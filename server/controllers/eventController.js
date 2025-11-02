import Event from "../models/Event.js";

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getAllEvents = async (req, res) => {
  try {
    const { eventType, status, month, year } = req.query;
    const filter = {};

    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;

    // Filter by month and year
    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      filter.startDate = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      filter.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const events = await Event.find(filter)
      .populate("specificClasses", "className grade section")
      .populate("createdBy", "name email")
      .populate("registeredParticipants.user", "name email")
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("specificClasses", "className grade section")
      .populate("createdBy", "name email")
      .populate("registeredParticipants.user", "name email role");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (Admin)
export const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const event = await Event.create(eventData);

    await event.populate("specificClasses", "className grade section");
    await event.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("specificClasses", "className grade section")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!event.requiresRegistration) {
      return res.status(400).json({
        success: false,
        message: "This event does not require registration",
      });
    }

    // Check if already registered
    const alreadyRegistered = event.registeredParticipants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this event",
      });
    }

    // Check max participants
    if (
      event.maxParticipants &&
      event.registeredParticipants.length >= event.maxParticipants
    ) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }

    event.registeredParticipants.push({
      user: req.user._id,
      registeredAt: new Date(),
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: "Registered successfully",
      data: event,
    });
  } catch (error) {
    console.error("Register for event error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Unregister from event
// @route   POST /api/events/:id/unregister
// @access  Private
export const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    event.registeredParticipants = event.registeredParticipants.filter(
      (p) => p.user.toString() !== req.user._id.toString()
    );

    await event.save();

    res.status(200).json({
      success: true,
      message: "Unregistered successfully",
      data: event,
    });
  } catch (error) {
    console.error("Unregister from event error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Private
export const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Event.find({
      startDate: { $gte: today },
      status: { $in: ["scheduled", "ongoing"] },
    })
      .populate("specificClasses", "className grade section")
      .sort({ startDate: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get upcoming events error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get event statistics
// @route   GET /api/events/stats
// @access  Private
export const getEventStats = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const stats = {
      total: await Event.countDocuments({
        startDate: { $gte: startOfYear, $lte: endOfYear },
      }),
      upcoming: await Event.countDocuments({
        startDate: { $gte: new Date() },
        status: { $in: ["scheduled", "ongoing"] },
      }),
      completed: await Event.countDocuments({
        startDate: { $gte: startOfYear, $lte: endOfYear },
        status: "completed",
      }),
      cancelled: await Event.countDocuments({
        startDate: { $gte: startOfYear, $lte: endOfYear },
        status: "cancelled",
      }),
      byType: {},
    };

    // Count by type
    const types = [
      "academic",
      "sports",
      "cultural",
      "holiday",
      "exam",
      "meeting",
      "parent-teacher",
      "workshop",
      "celebration",
      "other",
    ];

    for (const type of types) {
      stats.byType[type] = await Event.countDocuments({
        eventType: type,
        startDate: { $gte: startOfYear, $lte: endOfYear },
      });
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get event stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

