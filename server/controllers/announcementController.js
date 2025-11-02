import Announcement from "../models/Announcement.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
export const getAllAnnouncements = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) filter.status = status;

    const announcements = await Announcement.find(filter)
      .populate("createdBy", "name email role")
      .sort({ pinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get announcement by ID
// @route   GET /api/announcements/:id
// @access  Private
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Get announcement error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin)
export const createAnnouncement = async (req, res) => {
  try {
    // Transform targetAudience to audience structure if needed
    const { targetAudience, message, ...rest } = req.body;
    
    let audienceData = { type: "all", classes: [], roles: [] };
    
    if (targetAudience) {
      switch (targetAudience) {
        case "students":
          audienceData = { type: "roles", classes: [], roles: ["student"] };
          break;
        case "teachers":
          audienceData = { type: "roles", classes: [], roles: ["teacher"] };
          break;
        case "staff":
          audienceData = { type: "roles", classes: [], roles: ["admin", "teacher"] };
          break;
        default:
          audienceData = { type: "all", classes: [], roles: [] };
      }
    }

    const announcementData = {
      ...rest,
      content: message || req.body.content, // Support both 'message' and 'content'
      audience: req.body.audience || audienceData,
      createdBy: req.user._id,
    };

    const announcement = await Announcement.create(announcementData);

    // Create notifications for target audience
    if (announcement.status === "published") {
      await createNotificationsForAnnouncement(announcement);
    }

    await announcement.populate("createdBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin)
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email role");

    // If status changed to published, create notifications
    if (
      req.body.status === "published" &&
      announcement.status !== "published"
    ) {
      await createNotificationsForAnnouncement(updated);
    }

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to create notifications for announcement
const createNotificationsForAnnouncement = async (announcement) => {
  try {
    // Get target users based on audience
    let targetRoles = [];
    
    if (announcement.audience.type === "all") {
      targetRoles = ["admin", "teacher", "student"];
    } else if (announcement.audience.type === "roles" && announcement.audience.roles.length > 0) {
      targetRoles = announcement.audience.roles;
    } else {
      targetRoles = ["admin", "teacher", "student"];
    }

    const users = await User.find({ role: { $in: targetRoles } }).select("_id");
    
    const notifications = users.map((user) => ({
      recipient: user._id,
      title: "New Announcement",
      message: announcement.title,
      type: "announcement",
      relatedEntity: "announcement",
      relatedEntityId: announcement._id,
      link: `/announcements/${announcement._id}`,
      actionText: "View Announcement",
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error("Error creating notifications for announcement:", error);
  }
};
