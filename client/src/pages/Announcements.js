import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import {
  PlusIcon,
  MegaphoneIcon,
  UserGroupIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { announcementService } from '../services/announcementService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Announcements = () => {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'all',
    priority: 'normal',
    status: 'published',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementService.getAllAnnouncements();
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await announcementService.createAnnouncement(formData);
      toast.success('Announcement created successfully');
      fetchAnnouncements();
      closeModal();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error(error.response?.data?.message || 'Error creating announcement');
    }
  };

  const handleDelete = async (announcement) => {
    if (window.confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
      try {
        await announcementService.deleteAnnouncement(announcement._id);
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast.error('Error deleting announcement');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: '',
      message: '',
      targetAudience: 'all',
      priority: 'normal',
      status: 'published',
    });
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.normal;
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
      render: (row) => (
        <div className="font-medium text-gray-900">{row.title}</div>
      ),
    },
    {
      header: 'Message',
      accessor: 'content',
      render: (row) => (
        <div className="max-w-md truncate text-sm text-gray-600">{row.content}</div>
      ),
    },
    {
      header: 'Target',
      accessor: 'targetAudience',
      render: (row) => (
        <span className="capitalize text-sm">{row.targetAudience}</span>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(row.priority)}`}>
          {row.priority}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedAnnouncement(row);
              setIsDetailModalOpen(true);
            }}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
          >
            View
          </button>
          {isAdmin && (
            <button
              onClick={() => handleDelete(row)}
              className="text-red-600 hover:text-red-900 text-sm"
            >
              Delete
            </button>
          )}
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
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="mt-1 text-sm text-gray-500">
              School-wide announcements and notices
            </p>
          </div>
          {isAdmin && (
            <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
              Create Announcement
            </Button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card
            title="Total Announcements"
            value={announcements.length}
            icon={MegaphoneIcon}
            color="blue"
          />
          <Card
            title="This Month"
            value={announcements.filter(a => new Date(a.createdAt).getMonth() === new Date().getMonth()).length}
            icon={UserGroupIcon}
            color="green"
          />
          <Card
            title="High Priority"
            value={announcements.filter(a => a.priority === 'high' || a.priority === 'urgent').length}
            icon={EyeIcon}
            color="red"
          />
        </div>

        {/* Announcements Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table columns={columns} data={announcements} loading={loading} />
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Create Announcement"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Target Audience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                options={[
                  { value: 'all', label: 'Everyone' },
                  { value: 'students', label: 'Students' },
                  { value: 'teachers', label: 'Teachers' },
                  { value: 'parents', label: 'Parents' },
                  { value: 'staff', label: 'Staff' },
                ]}
                required
              />
              <Select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Create Announcement</Button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        {isDetailModalOpen && selectedAnnouncement && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            title="Announcement Details"
            size="large"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedAnnouncement.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedAnnouncement.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex space-x-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(selectedAnnouncement.priority)}`}>
                  {selectedAnnouncement.priority}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                  {selectedAnnouncement.targetAudience}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>

              {selectedAnnouncement.createdBy && (
                <div className="text-sm text-gray-500">
                  <strong>Posted by:</strong> {selectedAnnouncement.createdBy.name}
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default Announcements;

