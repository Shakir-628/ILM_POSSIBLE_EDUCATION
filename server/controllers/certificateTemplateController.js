import CertificateTemplate from "../models/CertificateTemplate.js";

// @desc    Get all certificate templates
// @route   GET /api/certificate-templates
// @access  Private (Admin)
export const getCertificateTemplates = async (req, res) => {
  try {
    const { certificateType, isActive } = req.query;
    
    let query = {};
    if (certificateType) query.certificateType = certificateType;
    if (isActive !== undefined) query.isActive = isActive === "true";
    
    const templates = await CertificateTemplate.find(query)
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email")
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get certificate template by ID
// @route   GET /api/certificate-templates/:id
// @access  Private (Admin)
export const getCertificateTemplateById = async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email");
    
    if (template) {
      res.json(template);
    } else {
      res.status(404).json({ message: "Template not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new certificate template
// @route   POST /api/certificate-templates
// @access  Private (Admin)
export const createCertificateTemplate = async (req, res) => {
  try {
    const {
      templateName,
      certificateType,
      layout,
      orientation,
      header,
      title,
      content,
      signatures,
      footer,
      design,
      availablePlaceholders,
      isActive,
      isDefault,
    } = req.body;
    
    // Check if template name already exists
    const existingTemplate = await CertificateTemplate.findOne({ templateName });
    if (existingTemplate) {
      return res.status(400).json({ message: "Template name already exists" });
    }
    
    const template = new CertificateTemplate({
      templateName,
      certificateType,
      layout,
      orientation,
      header,
      title,
      content,
      signatures,
      footer,
      design,
      availablePlaceholders,
      isActive: isActive !== undefined ? isActive : true,
      isDefault: isDefault || false,
      createdBy: req.user.id,
    });
    
    await template.save();
    
    // Populate fields for response
    await template.populate("createdBy", "name email");
    
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update certificate template
// @route   PUT /api/certificate-templates/:id
// @access  Private (Admin)
export const updateCertificateTemplate = async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    const {
      templateName,
      certificateType,
      layout,
      orientation,
      header,
      title,
      content,
      signatures,
      footer,
      design,
      availablePlaceholders,
      isActive,
      isDefault,
    } = req.body;
    
    // Check if new template name already exists (excluding current template)
    if (templateName && templateName !== template.templateName) {
      const existingTemplate = await CertificateTemplate.findOne({ 
        templateName,
        _id: { $ne: template._id }
      });
      if (existingTemplate) {
        return res.status(400).json({ message: "Template name already exists" });
      }
    }
    
    if (templateName) template.templateName = templateName;
    if (certificateType) template.certificateType = certificateType;
    if (layout) template.layout = layout;
    if (orientation) template.orientation = orientation;
    if (header) template.header = { ...template.header, ...header };
    if (title) template.title = { ...template.title, ...title };
    if (content) template.content = { ...template.content, ...content };
    if (signatures) template.signatures = { ...template.signatures, ...signatures };
    if (footer) template.footer = { ...template.footer, ...footer };
    if (design) template.design = { ...template.design, ...design };
    if (availablePlaceholders) template.availablePlaceholders = availablePlaceholders;
    if (isActive !== undefined) template.isActive = isActive;
    if (isDefault !== undefined) template.isDefault = isDefault;
    
    template.lastModifiedBy = req.user.id;
    
    await template.save();
    
    // Populate fields for response
    await template.populate("createdBy", "name email");
    await template.populate("lastModifiedBy", "name email");
    
    res.json(template);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Set template as default
// @route   PUT /api/certificate-templates/:id/set-default
// @access  Private (Admin)
export const setTemplateAsDefault = async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    // Set all other templates of same type as non-default
    await CertificateTemplate.updateMany(
      { 
        certificateType: template.certificateType,
        _id: { $ne: template._id }
      },
      { isDefault: false }
    );
    
    // Set this template as default
    template.isDefault = true;
    template.lastModifiedBy = req.user.id;
    await template.save();
    
    res.json({
      message: "Template set as default successfully",
      template,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete certificate template
// @route   DELETE /api/certificate-templates/:id
// @access  Private (Admin)
export const deleteCertificateTemplate = async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    // Check if template is being used
    const Certificate = (await import("../models/Certificate.js")).default;
    const certificatesUsingTemplate = await Certificate.countDocuments({ 
      template: template._id 
    });
    
    if (certificatesUsingTemplate > 0) {
      return res.status(400).json({ 
        message: `Cannot delete template. It is being used by ${certificatesUsingTemplate} certificate(s).` 
      });
    }
    
    await template.deleteOne();
    
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Duplicate template
// @route   POST /api/certificate-templates/:id/duplicate
// @access  Private (Admin)
export const duplicateCertificateTemplate = async (req, res) => {
  try {
    const originalTemplate = await CertificateTemplate.findById(req.params.id);
    
    if (!originalTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    // Create new template name
    let newTemplateName = `${originalTemplate.templateName} (Copy)`;
    let counter = 1;
    
    // Ensure unique name
    while (await CertificateTemplate.findOne({ templateName: newTemplateName })) {
      counter++;
      newTemplateName = `${originalTemplate.templateName} (Copy ${counter})`;
    }
    
    // Create duplicate
    const duplicateTemplate = new CertificateTemplate({
      templateName: newTemplateName,
      certificateType: originalTemplate.certificateType,
      layout: originalTemplate.layout,
      orientation: originalTemplate.orientation,
      header: originalTemplate.header,
      title: originalTemplate.title,
      content: originalTemplate.content,
      signatures: originalTemplate.signatures,
      footer: originalTemplate.footer,
      design: originalTemplate.design,
      availablePlaceholders: originalTemplate.availablePlaceholders,
      isActive: true,
      isDefault: false, // Duplicate is never default
      createdBy: req.user.id,
    });
    
    await duplicateTemplate.save();
    
    // Populate fields for response
    await duplicateTemplate.populate("createdBy", "name email");
    
    res.status(201).json({
      message: "Template duplicated successfully",
      template: duplicateTemplate,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get templates by certificate type
// @route   GET /api/certificate-templates/type/:certificateType
// @access  Private
export const getTemplatesByCertificateType = async (req, res) => {
  try {
    const templates = await CertificateTemplate.find({
      certificateType: req.params.certificateType,
      isActive: true,
    })
      .sort({ isDefault: -1, templateName: 1 })
      .select("templateName certificateType isDefault");
    
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available placeholders
// @route   GET /api/certificate-templates/placeholders/:certificateType
// @access  Private (Admin)
export const getAvailablePlaceholders = async (req, res) => {
  try {
    const certificateType = req.params.certificateType;
    
    // Common placeholders for all certificate types
    const commonPlaceholders = [
      { placeholder: "{{studentName}}", description: "Full name of the student" },
      { placeholder: "{{studentId}}", description: "Student ID number" },
      { placeholder: "{{fatherName}}", description: "Father's name" },
      { placeholder: "{{motherName}}", description: "Mother's name" },
      { placeholder: "{{dateOfBirth}}", description: "Student's date of birth" },
      { placeholder: "{{gender}}", description: "Student's gender" },
      { placeholder: "{{class}}", description: "Current class name" },
      { placeholder: "{{section}}", description: "Class section" },
      { placeholder: "{{certificateNumber}}", description: "Unique certificate number" },
      { placeholder: "{{issueDate}}", description: "Certificate issue date" },
      { placeholder: "{{academicYear}}", description: "Academic year" },
      { placeholder: "{{schoolName}}", description: "School name" },
      { placeholder: "{{schoolAddress}}", description: "School address" },
      { placeholder: "{{currentDate}}", description: "Current date" },
      { placeholder: "{{currentYear}}", description: "Current year" },
    ];
    
    // Type-specific placeholders
    const typeSpecificPlaceholders = {
      transfer: [
        { placeholder: "{{reasonForLeaving}}", description: "Reason for leaving the school" },
        { placeholder: "{{dateOfLeaving}}", description: "Date of leaving" },
      ],
      achievement: [
        { placeholder: "{{achievementTitle}}", description: "Title of the achievement" },
        { placeholder: "{{position}}", description: "Position/rank achieved" },
      ],
      participation: [
        { placeholder: "{{eventName}}", description: "Name of the event" },
      ],
      conduct: [
        { placeholder: "{{conductRating}}", description: "Conduct rating" },
      ],
    };
    
    const placeholders = [
      ...commonPlaceholders,
      ...(typeSpecificPlaceholders[certificateType] || []),
    ];
    
    res.json(placeholders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

