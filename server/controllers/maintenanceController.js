import Maintenance from '../models/Maintenance.js';
import Asset from '../models/Asset.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private (Admin)
export const getAllMaintenance = async (req, res) => {
  try {
    const { status, priority, assetId, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assetId) filter.asset = assetId;
    if (startDate && endDate) {
      filter.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const maintenanceRecords = await Maintenance.find(filter)
      .populate('asset', 'assetId assetName category location')
      .populate('assignedTo', 'name email')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: maintenanceRecords.length,
      data: maintenanceRecords,
    });
  } catch (error) {
    console.error('Get all maintenance error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single maintenance record
// @route   GET /api/maintenance/:id
// @access  Private (Admin)
export const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('asset', 'assetId assetName category location status')
      .populate('assignedTo', 'name email role');

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    console.error('Get maintenance by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create maintenance record
// @route   POST /api/maintenance
// @access  Private (Admin)
export const createMaintenance = async (req, res) => {
  try {
    const {
      asset,
      maintenanceType,
      scheduledDate,
      status,
      priority,
      description,
      performedBy,
      assignedTo,
      cost,
      partsReplaced,
      serviceProvider,
      beforeCondition,
      notes,
      nextMaintenanceDate,
    } = req.body;

    // Check if asset exists
    const assetExists = await Asset.findById(asset);
    if (!assetExists) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    // Generate maintenance ID
    const maintenanceCount = await Maintenance.countDocuments();
    const maintenanceId = `MNT${String(maintenanceCount + 1).padStart(6, '0')}`;

    const maintenance = await Maintenance.create({
      maintenanceId,
      asset,
      maintenanceType,
      scheduledDate,
      status,
      priority,
      description,
      performedBy,
      assignedTo,
      cost,
      partsReplaced,
      serviceProvider,
      beforeCondition,
      notes,
      nextMaintenanceDate,
    });

    // Update asset status if maintenance is scheduled
    if (status === 'Scheduled' || status === 'In Progress') {
      await Asset.findByIdAndUpdate(asset, { status: 'Under Maintenance' });
    }

    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('asset', 'assetId assetName category')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: populatedMaintenance,
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update maintenance record
// @route   PUT /api/maintenance/:id
// @access  Private (Admin)
export const updateMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found',
      });
    }

    // If status is being updated to Completed
    if (req.body.status === 'Completed' && maintenance.status !== 'Completed') {
      req.body.completedDate = new Date();
      
      // Update asset status and maintenance dates
      const asset = await Asset.findById(maintenance.asset);
      if (asset) {
        asset.status = 'Active';
        asset.lastMaintenanceDate = new Date();
        if (req.body.nextMaintenanceDate) {
          asset.nextMaintenanceDate = req.body.nextMaintenanceDate;
        }
        if (req.body.afterCondition) {
          asset.condition = req.body.afterCondition;
        }
        await asset.save();
      }
    }

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('asset', 'assetId assetName category')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: updatedMaintenance,
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Private (Admin)
export const deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found',
      });
    }

    await maintenance.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Maintenance record deleted successfully',
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats/overview
// @access  Private (Admin)
export const getMaintenanceStats = async (req, res) => {
  try {
    const totalMaintenance = await Maintenance.countDocuments();
    const scheduled = await Maintenance.countDocuments({ status: 'Scheduled' });
    const inProgress = await Maintenance.countDocuments({ status: 'In Progress' });
    const completed = await Maintenance.countDocuments({ status: 'Completed' });
    const pending = await Maintenance.countDocuments({ status: 'Pending' });

    // Calculate total cost
    const maintenanceRecords = await Maintenance.find({ status: 'Completed' });
    const totalCost = maintenanceRecords.reduce((sum, record) => sum + (record.cost || 0), 0);

    // Upcoming maintenance (next 7 days)
    const upcomingMaintenance = await Maintenance.countDocuments({
      status: 'Scheduled',
      scheduledDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Overdue maintenance
    const overdueMaintenance = await Maintenance.countDocuments({
      status: { $in: ['Scheduled', 'Pending'] },
      scheduledDate: { $lt: new Date() },
    });

    // Maintenance by type
    const maintenanceByType = await Maintenance.aggregate([
      { $group: { _id: '$maintenanceType', count: { $sum: 1 }, totalCost: { $sum: '$cost' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMaintenance,
        scheduled,
        inProgress,
        completed,
        pending,
        totalCost,
        upcomingMaintenance,
        overdueMaintenance,
        maintenanceByType,
      },
    });
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get asset maintenance history
// @route   GET /api/maintenance/asset/:assetId
// @access  Private (Admin)
export const getAssetMaintenanceHistory = async (req, res) => {
  try {
    const maintenanceHistory = await Maintenance.find({ asset: req.params.assetId })
      .populate('assignedTo', 'name email')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: maintenanceHistory.length,
      data: maintenanceHistory,
    });
  } catch (error) {
    console.error('Get asset maintenance history error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export maintenance records to Excel
// @route   POST /api/maintenance/export/excel
// @access  Private (Admin)
export const exportMaintenanceToExcel = async (req, res) => {
  try {
    const { status, priority, startDate, endDate } = req.body;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (startDate && endDate) {
      filter.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const maintenanceRecords = await Maintenance.find(filter)
      .populate('asset', 'assetId assetName category location')
      .populate('assignedTo', 'name email')
      .sort({ scheduledDate: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Maintenance Records');

    // Define columns
    worksheet.columns = [
      { header: 'Maintenance ID', key: 'maintenanceId', width: 15 },
      { header: 'Asset ID', key: 'assetId', width: 15 },
      { header: 'Asset Name', key: 'assetName', width: 25 },
      { header: 'Type', key: 'maintenanceType', width: 15 },
      { header: 'Scheduled Date', key: 'scheduledDate', width: 15 },
      { header: 'Completed Date', key: 'completedDate', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Performed By', key: 'performedBy', width: 20 },
      { header: 'Cost', key: 'cost', width: 12 },
      { header: 'Description', key: 'description', width: 35 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };

    // Add data
    maintenanceRecords.forEach(record => {
      worksheet.addRow({
        maintenanceId: record.maintenanceId,
        assetId: record.asset?.assetId || 'N/A',
        assetName: record.asset?.assetName || 'N/A',
        maintenanceType: record.maintenanceType,
        scheduledDate: new Date(record.scheduledDate).toLocaleDateString(),
        completedDate: record.completedDate ? new Date(record.completedDate).toLocaleDateString() : 'Pending',
        status: record.status,
        priority: record.priority,
        performedBy: record.performedBy || 'N/A',
        cost: record.cost || 0,
        description: record.description,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=maintenance-report.xlsx');

    return workbook.xlsx.write(res).then(() => res.end());
  } catch (error) {
    console.error('Export maintenance to Excel error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export maintenance records to PDF
// @route   POST /api/maintenance/export/pdf
// @access  Private (Admin)
export const exportMaintenanceToPDF = async (req, res) => {
  try {
    const { status, priority, startDate, endDate } = req.body;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (startDate && endDate) {
      filter.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const maintenanceRecords = await Maintenance.find(filter)
      .populate('asset', 'assetId assetName category location')
      .populate('assignedTo', 'name email')
      .sort({ scheduledDate: -1 });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=maintenance-report.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Maintenance Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Summary:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Records: ${maintenanceRecords.length}`);
    doc.text(`Total Cost: Rs. ${maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0).toLocaleString()}`);
    doc.moveDown();

    // Maintenance Records
    doc.fontSize(14).text('Maintenance Details:', { underline: true });
    doc.moveDown(0.5);

    maintenanceRecords.slice(0, 30).forEach((record, index) => {
      if (index > 0 && index % 4 === 0) {
        doc.addPage();
      }

      doc.fontSize(10);
      doc.text(`${index + 1}. ${record.asset?.assetName || 'Unknown'} (${record.maintenanceId})`, { bold: true });
      doc.fontSize(9);
      doc.text(`   Type: ${record.maintenanceType} | Status: ${record.status} | Priority: ${record.priority}`);
      doc.text(`   Scheduled: ${new Date(record.scheduledDate).toLocaleDateString()} | Cost: Rs. ${(record.cost || 0).toLocaleString()}`);
      doc.text(`   Description: ${record.description.substring(0, 80)}...`);
      doc.moveDown(0.5);
    });

    if (maintenanceRecords.length > 30) {
      doc.text(`\n... and ${maintenanceRecords.length - 30} more records`);
    }

    doc.end();
  } catch (error) {
    console.error('Export maintenance to PDF error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

