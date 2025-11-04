import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import SearchBar from '../components/SearchBar';
import Card from '../components/Card';
import {
  PlusIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import certificateTemplateService from '../services/certificateTemplateService';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../context/ToastContext';

const CertificateTemplates = () => {
  const toast = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [placeholders, setPlaceholders] = useState([]);

  const [formData, setFormData] = useState({
    templateName: '',
    certificateType: 'bonafide',
    layout: 'portrait',
    orientation: 'a4',
    header: {
      showLogo: true,
      logoPosition: 'center',
      schoolName: '{{schoolName}}',
      schoolAddress: '{{schoolAddress}}',
      showHeaderBorder: true,
    },
    title: {
      text: 'CERTIFICATE',
      fontSize: 24,
      color: '#000000',
      alignment: 'center',
    },
    content: {
      template: '',
      fontSize: 12,
      lineHeight: 1.5,
      alignment: 'justify',
    },
    signatures: {
      showClassTeacher: true,
      showPrincipal: true,
      showOther: false,
      layout: 'horizontal',
    },
    footer: {
      showDate: true,
      showCertificateNumber: true,
      showQRCode: true,
      customText: '',
    },
    design: {
      backgroundColor: '#FFFFFF',
      borderColor: '#000000',
      borderWidth: 2,
      showWatermark: false,
      watermarkText: '',
      watermarkOpacity: 0.1,
    },
    isActive: true,
    isDefault: false,
  });

  const certificateTypes = [
    { value: 'transfer', label: 'Transfer Certificate' },
    { value: 'character', label: 'Character Certificate' },
    { value: 'bonafide', label: 'Bonafide Certificate' },
    { value: 'achievement', label: 'Achievement Certificate' },
    { value: 'completion', label: 'Completion Certificate' },
    { value: 'participation', label: 'Participation Certificate' },
    { value: 'merit', label: 'Merit Certificate' },
    { value: 'conduct', label: 'Conduct Certificate' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (formData.certificateType) {
      fetchPlaceholders(formData.certificateType);
    }
  }, [formData.certificateType]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await certificateTemplateService.getCertificateTemplates();
      console.log('Templates fetched:', data);
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Error fetching templates. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceholders = async (type) => {
    try {
      const data = await certificateTemplateService.getAvailablePlaceholders(type);
      setPlaceholders(data);
    } catch (error) {
      console.error('Error fetching placeholders:', error);
    }
  };

  // Filter templates
  const filteredTemplates = typeFilter === 'all' 
    ? templates 
    : templates.filter((t) => t.certificateType === typeFilter);

  // Use table data hook for pagination and search
  const {
    paginatedData,
    searchTerm,
    setSearchTerm,
    clearSearch,
    currentPage,
    totalPages,
    totalItems,
    setCurrentPage,
  } = useTableData(filteredTemplates, ['templateName', 'certificateType'], 10);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const actualValue = type === 'checkbox' ? checked : value;

    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData((prev) => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = actualValue;
        return newData;
      });
    } else {
      setFormData({
        ...formData,
        [name]: actualValue,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await certificateTemplateService.updateCertificateTemplate(editingTemplate._id, formData);
        toast.success('Template updated successfully');
      } else {
        await certificateTemplateService.createCertificateTemplate(formData);
        toast.success('Template created successfully');
      }
      fetchTemplates();
      closeModal();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(error.response?.data?.message || 'Error saving template');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      templateName: template.templateName,
      certificateType: template.certificateType,
      layout: template.layout,
      orientation: template.orientation,
      header: template.header,
      title: template.title,
      content: template.content,
      signatures: template.signatures,
      footer: template.footer,
      design: template.design,
      isActive: template.isActive,
      isDefault: template.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleSetDefault = async (template) => {
    try {
      await certificateTemplateService.setTemplateAsDefault(template._id);
      toast.success('Template set as default successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error setting default template:', error);
      toast.error('Error setting default template');
    }
  };

  const handleDuplicate = async (template) => {
    try {
      await certificateTemplateService.duplicateCertificateTemplate(template._id);
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error(error.response?.data?.message || 'Error duplicating template');
    }
  };

  const handleDelete = async (template) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await certificateTemplateService.deleteCertificateTemplate(template._id);
        toast.success('Template deleted successfully');
        fetchTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
        toast.error(error.response?.data?.message || 'Error deleting template');
      }
    }
  };

  const handleView = (template) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setFormData({
      templateName: '',
      certificateType: 'bonafide',
      layout: 'portrait',
      orientation: 'a4',
      header: {
        showLogo: true,
        logoPosition: 'center',
        schoolName: '{{schoolName}}',
        schoolAddress: '{{schoolAddress}}',
        showHeaderBorder: true,
      },
      title: {
        text: 'CERTIFICATE',
        fontSize: 24,
        color: '#000000',
        alignment: 'center',
      },
      content: {
        template: '',
        fontSize: 12,
        lineHeight: 1.5,
        alignment: 'justify',
      },
      signatures: {
        showClassTeacher: true,
        showPrincipal: true,
        showOther: false,
        layout: 'horizontal',
      },
      footer: {
        showDate: true,
        showCertificateNumber: true,
        showQRCode: true,
        customText: '',
      },
      design: {
        backgroundColor: '#FFFFFF',
        borderColor: '#000000',
        borderWidth: 2,
        showWatermark: false,
        watermarkText: '',
        watermarkOpacity: 0.1,
      },
      isActive: true,
      isDefault: false,
    });
  };

  const columns = [
    {
      header: 'Template Name',
      accessor: (template) => (
        <div className="flex items-center">
          {template.templateName}
          {template.isDefault && (
            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              Default
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Certificate Type',
      accessor: (template) => template.certificateType.charAt(0).toUpperCase() + template.certificateType.slice(1),
    },
    {
      header: 'Layout',
      accessor: (template) => template.layout.charAt(0).toUpperCase() + template.layout.slice(1),
    },
    {
      header: 'Status',
      accessor: (template) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {template.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Usage Count',
      accessor: (template) => template.usageCount || 0,
    },
    {
      header: 'Actions',
      accessor: (template) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleView(template)}
            icon={EyeIcon}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleEdit(template)}
            icon={PencilIcon}
          >
            Edit
          </Button>
          {!template.isDefault && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleSetDefault(template)}
              icon={CheckCircleIcon}
            >
              Set Default
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDuplicate(template)}
            icon={DocumentDuplicateIcon}
          >
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(template)}
            icon={TrashIcon}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certificate Templates</h1>
            <p className="text-gray-600 mt-1">Manage certificate templates and designs</p>
          </div>
          <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
            Create Template
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white overflow-hidden rounded-lg shadow">
          <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-48"
            >
              <option value="all">All Types</option>
              {certificateTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={clearSearch}
              placeholder="Search templates..."
            />
          </div>
        </div>

        {/* Templates Table */}
        <div className="bg-white overflow-hidden rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading templates...</p>
            </div>
          ) : paginatedData.length > 0 ? (
            <Table columns={columns} data={paginatedData} />
          ) : (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new template.</p>
            </div>
          )}
        </div>

        {/* Create/Edit Template Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingTemplate ? 'Edit Template' : 'Create Template'}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Template Name"
                name="templateName"
                value={formData.templateName}
                onChange={handleInputChange}
                required
                placeholder="e.g., Official Bonafide Certificate"
              />
              <Select
                label="Certificate Type"
                name="certificateType"
                value={formData.certificateType}
                onChange={handleInputChange}
                required
              >
                {certificateTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
              <Select
                label="Layout"
                name="layout"
                value={formData.layout}
                onChange={handleInputChange}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </Select>
              <Select
                label="Paper Size"
                name="orientation"
                value={formData.orientation}
                onChange={handleInputChange}
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </Select>
            </div>

            {/* Title Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Title Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Title Text"
                  name="title.text"
                  value={formData.title.text}
                  onChange={handleInputChange}
                  placeholder="CERTIFICATE"
                />
                <Input
                  label="Font Size"
                  name="title.fontSize"
                  type="number"
                  value={formData.title.fontSize}
                  onChange={handleInputChange}
                />
                <Select
                  label="Alignment"
                  name="title.alignment"
                  value={formData.title.alignment}
                  onChange={handleInputChange}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </Select>
              </div>
            </div>

            {/* Content Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Template</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use placeholders like {'{{studentName}}'}, {'{{className}}'}, {'{{issueDate}}'}, etc.
              </p>
              {placeholders.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-xs font-medium text-gray-700 mb-2">Available Placeholders:</p>
                  <div className="flex flex-wrap gap-2">
                    {placeholders.map((ph, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded cursor-pointer hover:bg-blue-200"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="content.template"]');
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const newText = text.substring(0, start) + ph.placeholder + text.substring(end);
                            setFormData({
                              ...formData,
                              content: {
                                ...formData.content,
                                template: newText,
                              },
                            });
                          }
                        }}
                        title={ph.description}
                      >
                        {ph.placeholder}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <textarea
                name="content.template"
                value={formData.content.template}
                onChange={handleInputChange}
                rows="8"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                placeholder="This is to certify that {{studentName}} is a bonafide student of our institution..."
              />
            </div>

            {/* Signatures */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Signatures</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="signatures.showClassTeacher"
                    checked={formData.signatures.showClassTeacher}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Class Teacher</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="signatures.showPrincipal"
                    checked={formData.signatures.showPrincipal}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Principal</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="signatures.showOther"
                    checked={formData.signatures.showOther}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Other</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Footer Options</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="footer.showDate"
                    checked={formData.footer.showDate}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Show Date</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="footer.showCertificateNumber"
                    checked={formData.footer.showCertificateNumber}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Show Certificate No.</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="footer.showQRCode"
                    checked={formData.footer.showQRCode}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Show QR Code</span>
                </label>
              </div>
            </div>

            {/* Status */}
            <div className="border-t pt-4">
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Set as Default</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Template Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Template Details"
          size="lg"
        >
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Template Name</p>
                  <p className="text-base text-gray-900">{selectedTemplate.templateName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificate Type</p>
                  <p className="text-base text-gray-900 capitalize">{selectedTemplate.certificateType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Layout</p>
                  <p className="text-base text-gray-900 capitalize">{selectedTemplate.layout}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Usage Count</p>
                  <p className="text-base text-gray-900">{selectedTemplate.usageCount || 0}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Content Template</p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                    {selectedTemplate.content?.template}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default CertificateTemplates;

