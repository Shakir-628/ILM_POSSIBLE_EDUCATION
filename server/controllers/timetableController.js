import Timetable from "../models/Timetable.js";
import Class from "../models/Class.js";
import Teacher from "../models/Teacher.js";
import Subject from "../models/Subject.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

// @desc    Get all timetables
// @route   GET /api/timetables
// @access  Private (Admin, Teacher)
export const getAllTimetables = async (req, res) => {
  try {
    const { classId, academicYear } = req.query;
    const filter = {};

    if (classId) filter.class = classId;
    if (academicYear) filter.academicYear = academicYear;

    const timetables = await Timetable.find(filter)
      .populate("class", "className grade section")
      .populate({
        path: "schedule.periods.subject",
        select: "subjectName subjectCode",
      })
      .populate({
        path: "schedule.periods.teacher",
        select: "firstName lastName teacherId",
      })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: timetables.length,
      data: timetables,
    });
  } catch (error) {
    console.error("Get timetables error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get timetable by ID
// @route   GET /api/timetables/:id
// @access  Private
export const getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate("class", "className grade section")
      .populate({
        path: "schedule.periods.subject",
        select: "subjectName subjectCode",
      })
      .populate({
        path: "schedule.periods.teacher",
        select: "firstName lastName teacherId email",
      })
      .populate("createdBy", "name");

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    console.error("Get timetable error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get timetable by class
// @route   GET /api/timetables/class/:classId
// @access  Private
export const getTimetableByClass = async (req, res) => {
  try {
    const { academicYear, term } = req.query;
    const filter = { class: req.params.classId };

    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const timetable = await Timetable.findOne(filter)
      .populate("class", "className grade section")
      .populate({
        path: "schedule.periods.subject",
        select: "subjectName subjectCode",
      })
      .populate({
        path: "schedule.periods.teacher",
        select: "firstName lastName teacherId",
      });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found for this class",
      });
    }

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    console.error("Get timetable by class error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create timetable
// @route   POST /api/timetables
// @access  Private (Admin)
export const createTimetable = async (req, res) => {
  try {
    const timetableData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // Check if timetable already exists for this class/year/term
    const existing = await Timetable.findOne({
      class: req.body.class,
      academicYear: req.body.academicYear,
      term: req.body.term,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Timetable already exists for this class, year, and term",
      });
    }

    const timetable = await Timetable.create(timetableData);

    await timetable.populate("class", "className grade section");
    await timetable.populate({
      path: "schedule.periods.subject",
      select: "subjectName subjectCode",
    });
    await timetable.populate({
      path: "schedule.periods.teacher",
      select: "firstName lastName teacherId",
    });

    res.status(201).json({
      success: true,
      message: "Timetable created successfully",
      data: timetable,
    });
  } catch (error) {
    console.error("Create timetable error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update timetable
// @route   PUT /api/timetables/:id
// @access  Private (Admin)
export const updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    const updatedTimetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("class", "className grade section")
      .populate({
        path: "schedule.periods.subject",
        select: "subjectName subjectCode",
      })
      .populate({
        path: "schedule.periods.teacher",
        select: "firstName lastName teacherId",
      });

    res.status(200).json({
      success: true,
      message: "Timetable updated successfully",
      data: updatedTimetable,
    });
  } catch (error) {
    console.error("Update timetable error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete timetable
// @route   DELETE /api/timetables/:id
// @access  Private (Admin)
export const deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    await timetable.deleteOne();

    res.status(200).json({
      success: true,
      message: "Timetable deleted successfully",
    });
  } catch (error) {
    console.error("Delete timetable error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Detect timetable conflicts
// @route   POST /api/timetables/check-conflicts
// @access  Private (Admin)
export const checkConflicts = async (req, res) => {
  try {
    const { schedule, class: classId, academicYear, term } = req.body;
    const conflicts = [];

    // Check for teacher conflicts
    for (const daySchedule of schedule) {
      for (const period of daySchedule.periods) {
        if (!period.teacher || !period.subject) continue;

        // Find other timetables with same teacher at same time
        const otherTimetables = await Timetable.find({
          _id: { $ne: req.body.excludeId }, // Exclude current timetable if editing
          academicYear,
          term,
          "schedule.day": daySchedule.day,
          "schedule.periods": {
            $elemMatch: {
              teacher: period.teacher,
              startTime: period.startTime,
              endTime: period.endTime,
            },
          },
        }).populate("class", "className grade");

        if (otherTimetables.length > 0) {
          conflicts.push({
            day: daySchedule.day,
            period: period.periodNumber,
            time: `${period.startTime} - ${period.endTime}`,
            teacher: period.teacher,
            conflictWith: otherTimetables.map((t) => ({
              class: t.class.className,
              grade: t.class.grade,
            })),
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      hasConflicts: conflicts.length > 0,
      conflicts,
    });
  } catch (error) {
    console.error("Check conflicts error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export timetable to Excel
// @route   GET /api/timetables/:id/export/excel
// @access  Private
export const exportToExcel = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate("class", "className grade section")
      .populate({
        path: "schedule.periods.subject",
        select: "subjectName subjectCode",
      })
      .populate({
        path: "schedule.periods.teacher",
        select: "firstName lastName",
      });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Timetable");

    // Set column widths
    worksheet.columns = [
      { header: "Time", key: "time", width: 20 },
      { header: "Monday", key: "monday", width: 25 },
      { header: "Tuesday", key: "tuesday", width: 25 },
      { header: "Wednesday", key: "wednesday", width: 25 },
      { header: "Thursday", key: "thursday", width: 25 },
      { header: "Friday", key: "friday", width: 25 },
      { header: "Saturday", key: "saturday", width: 25 },
    ];

    // Add title row
    worksheet.mergeCells("A1:G1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${timetable.class.className} - ${timetable.class.grade} ${timetable.class.section || ""} - Academic Year ${timetable.academicYear}`;
    titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" },
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 30;

    // Style header row
    const headerRow = worksheet.getRow(2);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" },
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 25;

    // Time slots
    const timeSlots = [
      { label: "08:00 - 08:45", isBreak: false },
      { label: "08:45 - 09:30", isBreak: false },
      { label: "09:30 - 10:15", isBreak: false },
      { label: "10:15 - 10:30", isBreak: true, name: "Break" },
      { label: "10:30 - 11:15", isBreak: false },
      { label: "11:15 - 12:00", isBreak: false },
      { label: "12:00 - 12:45", isBreak: false },
      { label: "12:45 - 13:00", isBreak: true, name: "Lunch" },
      { label: "13:00 - 13:45", isBreak: false },
      { label: "13:45 - 14:30", isBreak: false },
    ];

    const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    let periodIndex = 0;
    timeSlots.forEach((slot, slotIndex) => {
      const row = worksheet.getRow(slotIndex + 3);
      row.getCell(1).value = slot.label;

      if (slot.isBreak) {
        // Break row
        worksheet.mergeCells(`B${slotIndex + 3}:G${slotIndex + 3}`);
        const breakCell = row.getCell(2);
        breakCell.value = slot.name;
        breakCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF4CC" },
        };
        breakCell.font = { bold: true };
        breakCell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        // Regular period row
        daysOfWeek.forEach((day, dayIndex) => {
          const daySchedule = timetable.schedule.find((s) => s.day.toLowerCase() === day);
          if (daySchedule && daySchedule.periods[periodIndex]) {
            const period = daySchedule.periods[periodIndex];
            let cellValue = "";

            if (period.subject && period.teacher) {
              cellValue = `${period.subject.subjectName}\n${period.teacher.firstName} ${period.teacher.lastName}`;
              if (period.roomNumber) cellValue += `\nRoom: ${period.roomNumber}`;
            } else {
              cellValue = "Free Period";
            }

            const cell = row.getCell(dayIndex + 2);
            cell.value = cellValue;
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

            if (period.subject) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFE7F3FF" },
              };
            }
          }
        });
        periodIndex++;
      }

      row.height = slot.isBreak ? 25 : 50;
      row.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=timetable_${timetable.class.className}_${Date.now()}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export to Excel error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export timetable to PDF
// @route   GET /api/timetables/:id/export/pdf
// @access  Private
export const exportToPDF = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate("class", "className grade section")
      .populate({
        path: "schedule.periods.subject",
        select: "subjectName subjectCode",
      })
      .populate({
        path: "schedule.periods.teacher",
        select: "firstName lastName",
      });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    // Create PDF document in landscape mode
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 30 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=timetable_${timetable.class.className}_${Date.now()}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(18).font("Helvetica-Bold").fillColor("#0070C0").text(
      `${timetable.class.className} - ${timetable.class.grade} ${timetable.class.section || ""}`,
      { align: "center" }
    );
    doc.fontSize(12).fillColor("#666666").text(`Academic Year: ${timetable.academicYear}`, {
      align: "center",
    });
    doc.moveDown(1);

    // Table settings
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeSlots = [
      { label: "08:00 - 08:45", isBreak: false },
      { label: "08:45 - 09:30", isBreak: false },
      { label: "09:30 - 10:15", isBreak: false },
      { label: "10:15 - 10:30", isBreak: true, name: "☕ BREAK" },
      { label: "10:30 - 11:15", isBreak: false },
      { label: "11:15 - 12:00", isBreak: false },
      { label: "12:00 - 12:45", isBreak: false },
      { label: "12:45 - 13:00", isBreak: true, name: "🍽️ LUNCH" },
      { label: "13:00 - 13:45", isBreak: false },
      { label: "13:45 - 14:30", isBreak: false },
    ];

    const tableTop = doc.y;
    const tableLeft = 30;
    const colWidth = 110;
    const rowHeight = 50;
    const headerHeight = 30;

    // Draw header
    doc.fillColor("#0070C0").rect(tableLeft, tableTop, colWidth * 7, headerHeight).fill();

    // Header text
    doc.fontSize(9).font("Helvetica-Bold").fillColor("white");
    ["Time", ...daysOfWeek].forEach((header, i) => {
      doc.text(header, tableLeft + i * colWidth + 5, tableTop + 10, {
        width: colWidth - 10,
        align: "center",
      });
    });

    let currentY = tableTop + headerHeight;
    let periodIndex = 0;

    // Draw timetable rows
    timeSlots.forEach((slot) => {
      if (slot.isBreak) {
        // Draw break row
        doc.fillColor("#FFF4CC").rect(tableLeft, currentY, colWidth * 7, rowHeight * 0.6).fill();
        doc.strokeColor("#000000").rect(tableLeft, currentY, colWidth * 7, rowHeight * 0.6).stroke();

        doc.fontSize(8).font("Helvetica").fillColor("#000000");
        doc.text(slot.label, tableLeft + 5, currentY + 10, { width: colWidth - 10 });
        doc.font("Helvetica-Bold").text(slot.name, tableLeft + colWidth, currentY + 10, {
          width: colWidth * 6 - 10,
          align: "center",
        });

        currentY += rowHeight * 0.6;
      } else {
        // Draw regular period row
        doc.fillColor("#FFFFFF").rect(tableLeft, currentY, colWidth * 7, rowHeight).fill();
        doc.strokeColor("#000000");

        // Draw borders for each cell
        for (let i = 0; i <= 7; i++) {
          doc.moveTo(tableLeft + i * colWidth, currentY)
            .lineTo(tableLeft + i * colWidth, currentY + rowHeight)
            .stroke();
        }
        doc.moveTo(tableLeft, currentY).lineTo(tableLeft + colWidth * 7, currentY).stroke();
        doc.moveTo(tableLeft, currentY + rowHeight)
          .lineTo(tableLeft + colWidth * 7, currentY + rowHeight)
          .stroke();

        // Time slot
        doc.fontSize(7).font("Helvetica").fillColor("#000000");
        doc.text(slot.label, tableLeft + 5, currentY + 5, { width: colWidth - 10 });

        // Periods for each day
        daysOfWeek.forEach((day, dayIndex) => {
          const daySchedule = timetable.schedule.find((s) => s.day === day);
          if (daySchedule && daySchedule.periods[periodIndex]) {
            const period = daySchedule.periods[periodIndex];
            const x = tableLeft + (dayIndex + 1) * colWidth + 5;
            const y = currentY + 5;

            if (period.subject && period.teacher) {
              doc.fontSize(8).font("Helvetica-Bold").fillColor("#000000");
              doc.text(period.subject.subjectName, x, y, {
                width: colWidth - 10,
                align: "center",
              });

              doc.fontSize(7).font("Helvetica").fillColor("#666666");
              doc.text(
                `${period.teacher.firstName} ${period.teacher.lastName}`,
                x,
                y + 15,
                { width: colWidth - 10, align: "center" }
              );

              if (period.roomNumber) {
                doc.fontSize(6).fillColor("#999999");
                doc.text(`Room: ${period.roomNumber}`, x, y + 30, {
                  width: colWidth - 10,
                  align: "center",
                });
              }
            } else {
              doc.fontSize(7).font("Helvetica-Oblique").fillColor("#CCCCCC");
              doc.text("Free Period", x, y + 15, { width: colWidth - 10, align: "center" });
            }
          }
        });

        currentY += rowHeight;
        periodIndex++;
      }
    });

    // Add footer
    doc.fontSize(8).font("Helvetica").fillColor("#666666");
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      tableLeft,
      currentY + 20,
      { align: "center", width: colWidth * 7 }
    );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Export to PDF error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Smart Generate Timetable
// @route   POST /api/timetables/smart-generate
// @access  Private (Admin)
export const generateSmartTimetable = async (req, res) => {
  try {
    const { classId, academicYear, term } = req.body;

    if (!classId || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Please provide classId and academicYear",
      });
    }

    // 1. Fetch Class and its required subjects
    const targetClass = await Class.findById(classId).populate("subjects");
    if (!targetClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const classSubjects = targetClass.subjects;
    if (!classSubjects || classSubjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No subjects assigned to this class. Please assign subjects first.",
      });
    }

    // 2. Fetch all active teachers and their expert subjects
    const allTeachers = await Teacher.find({ status: "active" }).populate("subjects");

    // 3. Define standard period slots (can be customized later)
    const timeSlots = [
      { start: "08:00", end: "08:45" },
      { start: "08:45", end: "09:30" },
      { start: "09:30", end: "10:15" },
      { start: "10:15", end: "11:00" },
      { start: "11:00", end: "11:45" },
      { start: "11:45", end: "12:30" },
      { start: "13:15", end: "14:00" },
      { start: "14:00", end: "14:45" },
    ];

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const generatedSchedule = [];

    // 4. Fetch all existing timetables for this year/term to check teacher availability globally
    const currentTimetables = await Timetable.find({ academicYear, term });

    function isTeacherAvailable(teacherId, day, startTime, endTime) {
      for (const timetable of currentTimetables) {
        const daySched = timetable.schedule.find(s => s.day === day);
        if (daySched) {
          const match = daySched.periods.find(p =>
            p.teacher &&
            p.teacher.toString() === teacherId.toString() &&
            p.startTime === startTime
          );
          if (match) return false;
        }
      }
      return true;
    }

    // 5. Generate schedule
    for (const day of days) {
      const periods = [];

      // Shuffle subjects for each day and make sure we have enough to fill slots
      let dailySubjects = [...classSubjects].sort(() => Math.random() - 0.5);
      while (dailySubjects.length < timeSlots.length) {
        dailySubjects = [...dailySubjects, ...[...classSubjects].sort(() => Math.random() - 0.5)];
      }

      let lastSubjectId = null;

      for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i];

        // Try to avoid consecutive subjects
        let subjectIndex = i;
        if (dailySubjects[subjectIndex]._id.toString() === lastSubjectId && dailySubjects.length > i + 1) {
          // Swap with next one if available
          [dailySubjects[subjectIndex], dailySubjects[subjectIndex + 1]] = [dailySubjects[subjectIndex + 1], dailySubjects[subjectIndex]];
        }

        const subject = dailySubjects[subjectIndex];
        lastSubjectId = subject._id.toString();

        // Find a teacher who can teach this subject and is available
        const eligibleTeachers = allTeachers.filter(t =>
          t.subjects.some(s => s._id.toString() === subject._id.toString())
        );

        // Sort teachers by workload if we had that data, for now just find first available
        let assignedTeacher = null;
        for (const teacher of eligibleTeachers) {
          if (isTeacherAvailable(teacher._id, day, slot.start, slot.end)) {
            assignedTeacher = teacher._id;
            break;
          }
        }

        periods.push({
          periodNumber: i + 1,
          startTime: slot.start,
          endTime: slot.end,
          subject: subject._id,
          teacher: assignedTeacher,
          periodType: "lecture",
          roomNumber: targetClass.room || ""
        });
      }

      generatedSchedule.push({
        day,
        periods
      });
    }

    res.status(200).json({
      success: true,
      data: {
        class: classId,
        academicYear,
        term: term || "1st",
        schedule: generatedSchedule
      }
    });

  } catch (error) {
    console.error("Smart generate error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

