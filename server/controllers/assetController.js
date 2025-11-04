import Asset from '../models/Asset.js';
import Maintenance from '../models/Maintenance.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private (Admin)
export const getAllAssets = async (req, res) => {
  try {
    const { category, status, location, search } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = location;
    if (search) {
      filter.$or = [
        { assetId: { $regex: search, $options: 'i' } },
        { assetName: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const assets = await Asset.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    console.error('Get all assets error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single asset
// @route   GET /api/assets/:id
// @access  Private (Admin)
export const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'name email role');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    // Get maintenance history
    const maintenanceHistory = await Maintenance.find({ asset: asset._id })
      .sort({ scheduledDate: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        asset,
        maintenanceHistory,
      },
    });
  } catch (error) {
    console.error('Get asset by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private (Admin)
export const createAsset = async (req, res) => {
  try {
    const {
      assetName,
      category,
      description,
      purchaseDate,
      purchasePrice,
      currentValue,
      supplier,
      location,
      assignedTo,
      status,
      condition,
      warrantyExpiry,
      serialNumber,
      barcode,
      notes,
      depreciationRate,
    } = req.body;

    // Generate asset ID
    const assetCount = await Asset.countDocuments();
    const assetId = `AST${String(assetCount + 1).padStart(6, '0')}`;

    const asset = await Asset.create({
      assetId,
      assetName,
      category,
      description,
      purchaseDate,
      purchasePrice,
      currentValue: currentValue || purchasePrice,
      supplier,
      location,
      assignedTo,
      status,
      condition,
      warrantyExpiry,
      serialNumber,
      barcode,
      notes,
      depreciationRate,
    });

    const populatedAsset = await Asset.findById(asset._id)
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: populatedAsset,
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private (Admin)
export const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset,
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete asset (soft delete)
// @route   DELETE /api/assets/:id
// @access  Private (Admin)
export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    asset.isActive = false;
    await asset.save();

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get asset statistics
// @route   GET /api/assets/stats/overview
// @access  Private (Admin)
export const getAssetStats = async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments({ isActive: true });
    const activeAssets = await Asset.countDocuments({ status: 'Active', isActive: true });
    const underMaintenance = await Asset.countDocuments({ status: 'Under Maintenance', isActive: true });
    const retiredAssets = await Asset.countDocuments({ status: 'Retired', isActive: true });

    // Calculate total value
    const assets = await Asset.find({ isActive: true });
    const totalValue = assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);

    // Category breakdown
    const categoryBreakdown = await Asset.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: '$currentValue' } } },
    ]);

    // Assets needing maintenance
    const needsMaintenance = await Asset.countDocuments({
      isActive: true,
      nextMaintenanceDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        activeAssets,
        underMaintenance,
        retiredAssets,
        totalValue,
        categoryBreakdown,
        needsMaintenance,
      },
    });
  } catch (error) {
    console.error('Get asset stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update asset maintenance date
// @route   PATCH /api/assets/:id/maintenance
// @access  Private (Admin)
export const updateMaintenanceDate = async (req, res) => {
  try {
    const { lastMaintenanceDate, nextMaintenanceDate } = req.body;

    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { lastMaintenanceDate, nextMaintenanceDate },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Maintenance date updated successfully',
      data: asset,
    });
  } catch (error) {
    console.error('Update maintenance date error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export assets to Excel
// @route   POST /api/assets/export/excel
// @access  Private (Admin)
export const exportAssetsToExcel = async (req, res) => {
  try {
    const { category, status, location } = req.body;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = location;

    const assets = await Asset.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assets');

    // Define columns
    worksheet.columns = [
      { header: 'Asset ID', key: 'assetId', width: 15 },
      { header: 'Asset Name', key: 'assetName', width: 25 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Condition', key: 'condition', width: 12 },
      { header: 'Purchase Date', key: 'purchaseDate', width: 15 },
      { header: 'Purchase Price', key: 'purchasePrice', width: 15 },
      { header: 'Current Value', key: 'currentValue', width: 15 },
      { header: 'Serial Number', key: 'serialNumber', width: 20 },
      { header: 'Assigned To', key: 'assignedTo', width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    assets.forEach(asset => {
      worksheet.addRow({
        assetId: asset.assetId,
        assetName: asset.assetName,
        category: asset.category,
        location: asset.location,
        status: asset.status,
        condition: asset.condition,
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A',
        purchasePrice: asset.purchasePrice,
        currentValue: asset.currentValue || asset.purchasePrice,
        serialNumber: asset.serialNumber || 'N/A',
        assignedTo: asset.assignedTo?.name || 'Unassigned',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=assets-report.xlsx');

    return workbook.xlsx.write(res).then(() => res.end());
  } catch (error) {
    console.error('Export assets to Excel error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export assets to PDF
// @route   POST /api/assets/export/pdf
// @access  Private (Admin)
export const exportAssetsToPDF = async (req, res) => {
  try {
    const { category, status, location } = req.body;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = location;

    const assets = await Asset.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=assets-report.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Asset Management Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary Statistics
    doc.fontSize(14).text('Summary:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Assets: ${assets.length}`);
    doc.text(`Total Value: Rs. ${assets.reduce((sum, a) => sum + (a.currentValue || 0), 0).toLocaleString()}`);
    doc.moveDown();

    // Assets List
    doc.fontSize(14).text('Asset Details:', { underline: true });
    doc.moveDown(0.5);

    assets.slice(0, 50).forEach((asset, index) => {
      if (index > 0 && index % 5 === 0) {
        doc.addPage();
      }
      
      doc.fontSize(10);
      doc.text(`${index + 1}. ${asset.assetName} (${asset.assetId})`, { bold: true });
      doc.fontSize(9);
      doc.text(`   Category: ${asset.category} | Status: ${asset.status} | Condition: ${asset.condition}`);
      doc.text(`   Location: ${asset.location} | Value: Rs. ${(asset.currentValue || 0).toLocaleString()}`);
      doc.moveDown(0.5);
    });

    if (assets.length > 50) {
      doc.text(`\n... and ${assets.length - 50} more assets`);
    }

    doc.end();
  } catch (error) {
    console.error('Export assets to PDF error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

