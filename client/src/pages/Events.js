import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import {
  PlusIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { eventService } from '../services/eventService';
import { classService } from '../services/classService';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'academic',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    isAllDay: false,
    venue: '',
    targetAudience: ['all'],
    specificClasses: [],
    organizer: '',
    contactPerson: {
      name: '',
      phone: '',
      email: '',
    },
    requiresRegistration: false,
    maxParticipants: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    fetchEvents();
    fetchClasses();
    fetchStats();
  }, [typeFilter]);

  const fetchEvents = async () => {
    try {
      const params = typeFilter !== 'all' ? { eventType: typeFilter } : {};
      const response = await eventService.getAllEvents(params);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await eventService.getEventStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const {
    paginatedData,
    searchTerm,
    setSearchTerm,
    clearSearch,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
  } = useTableData(events, ['title', 'eventType', 'venue'], 10);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('contactPerson.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        contactPerson: {
          ...formData.contactPerson,
          [field]: value,
        },
      });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent._id, formData);
        toast.success('Event updated successfully');
      } else {
        await eventService.createEvent(formData);
        toast.success('Event created successfully');
      }
      fetchEvents();
      fetchStats();
      closeModal();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.message || 'Error saving event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '17:00',
      isAllDay: event.isAllDay || false,
      venue: event.venue || '',
      targetAudience: event.targetAudience || ['all'],
      specificClasses: event.specificClasses?.map(c => c._id) || [],
      organizer: event.organizer || '',
      contactPerson: event.contactPerson || { name: '', phone: '', email: '' },
      requiresRegistration: event.requiresRegistration || false,
      maxParticipants: event.maxParticipants || '',
      color: event.color || '#3b82f6',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        await eventService.deleteEvent(event._id);
        toast.success('Event deleted successfully');
        fetchEvents();
        fetchStats();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Error deleting event');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      eventType: 'academic',
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '17:00',
      isAllDay: false,
      venue: '',
      targetAudience: ['all'],
      specificClasses: [],
      organizer: '',
      contactPerson: { name: '', phone: '', email: '' },
      requiresRegistration: false,
      maxParticipants: '',
      color: '#3b82f6',
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800',
      sports: 'bg-green-100 text-green-800',
      cultural: 'bg-purple-100 text-purple-800',
      holiday: 'bg-red-100 text-red-800',
      exam: 'bg-orange-100 text-orange-800',
      meeting: 'bg-gray-100 text-gray-800',
      'parent-teacher': 'bg-indigo-100 text-indigo-800',
      workshop: 'bg-yellow-100 text-yellow-800',
      celebration: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    {
      header: 'Type',
      accessor: 'eventType',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventTypeColor(row.eventType)}`}>
          {row.eventType}
        </span>
      ),
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      render: (row) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      header: 'End Date',
      accessor: 'endDate',
      render: (row) => new Date(row.endDate).toLocaleDateString(),
    },
    { header: 'Venue', accessor: 'venue' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === 'completed' ? 'bg-green-100 text-green-800' :
          row.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          {isAdmin && (
            <>
              <button
                onClick={() => handleEdit(row)}
                className="text-indigo-600 hover:text-indigo-900 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(row)}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                Delete
              </button>
            </>
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
            <h1 className="text-2xl font-bold text-gray-900">School Events</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage school events and activities
            </p>
          </div>
          {isAdmin && (
            <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
              Create Event
            </Button>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <Card title="Total Events" value={stats.total} icon={CalendarIcon} color="blue" />
            <Card title="Upcoming" value={stats.upcoming} icon={ClockIcon} color="yellow" />
            <Card title="Completed" value={stats.completed} icon={CheckCircleIcon} color="green" />
            <Card title="Cancelled" value={stats.cancelled} icon={XCircleIcon} color="red" />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={clearSearch}
              placeholder="Search events..."
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'academic', label: 'Academic' },
                { value: 'sports', label: 'Sports' },
                { value: 'cultural', label: 'Cultural' },
                { value: 'holiday', label: 'Holiday' },
                { value: 'exam', label: 'Exam' },
                { value: 'meeting', label: 'Meeting' },
                { value: 'parent-teacher', label: 'Parent-Teacher' },
                { value: 'workshop', label: 'Workshop' },
                { value: 'celebration', label: 'Celebration' },
              ]}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {paginatedData.length} of {totalItems} events
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table columns={columns} data={paginatedData} loading={loading} />
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* Create/Edit Event Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingEvent ? 'Edit Event' : 'Create Event'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Event description..."
              rows="3"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Event Type"
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                options={[
                  { value: 'academic', label: 'Academic' },
                  { value: 'sports', label: 'Sports' },
                  { value: 'cultural', label: 'Cultural' },
                  { value: 'holiday', label: 'Holiday' },
                  { value: 'exam', label: 'Exam' },
                  { value: 'meeting', label: 'Meeting' },
                  { value: 'parent-teacher', label: 'Parent-Teacher' },
                  { value: 'workshop', label: 'Workshop' },
                  { value: 'celebration', label: 'Celebration' },
                  { value: 'other', label: 'Other' },
                ]}
                required
              />
              <Input
                label="Venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="e.g., School Auditorium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
              <Input
                label="End Date & Time"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAllDay"
                checked={formData.isAllDay}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                All Day Event
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleInputChange}
                placeholder="e.g., Student Affairs"
              />
              <Input
                label="Event Color"
                name="color"
                type="color"
                value={formData.color}
                onChange={handleInputChange}
              />
            </div>

            <hr />
            <h3 className="text-sm font-semibold text-gray-900">Contact Person</h3>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Name"
                name="contactPerson.name"
                value={formData.contactPerson.name}
                onChange={handleInputChange}
              />
              <Input
                label="Phone"
                name="contactPerson.phone"
                value={formData.contactPerson.phone}
                onChange={handleInputChange}
              />
              <Input
                label="Email"
                name="contactPerson.email"
                type="email"
                value={formData.contactPerson.email}
                onChange={handleInputChange}
              />
            </div>

            <hr />
            <h3 className="text-sm font-semibold text-gray-900">Registration</h3>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="requiresRegistration"
                checked={formData.requiresRegistration}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Requires Registration
              </label>
            </div>

            {formData.requiresRegistration && (
              <Input
                label="Max Participants"
                name="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
              />
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">{editingEvent ? 'Update' : 'Create'} Event</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Events;

