import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { examScheduleService } from '../services/examScheduleService';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import { teacherService } from '../services/teacherService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ExamSchedule = () => {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');

  const [formData, setFormData] = useState({
    examName: '',
    examType: 'mid-term',
    class: '',
    academicYear: new Date().getFullYear().toString(),
    term: '1st',
    schedule: [],
    generalInstructions: '',
  });

  useEffect(() => {
    fetchSchedules();
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, [selectedClass]);

  const fetchSchedules = async () => {
    try {
      const params = selectedClass ? { classId: selectedClass } : {};
      const response = await examScheduleService.getAllExamSchedules(params);
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
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

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addExamSlot = () => {
    setFormData({
      ...formData,
      schedule: [
        ...formData.schedule,
        {
          subject: '',
          examDate: '',
          startTime: '09:00',
          endTime: '12:00',
          duration: 180,
          totalMarks: 100,
          roomNumber: '',
          invigilator: '',
          instructions: '',
        },
      ],
    });
  };

  const removeExamSlot = (index) => {
    const updated = formData.schedule.filter((_, idx) => idx !== index);
    setFormData({ ...formData, schedule: updated });
  };

  const handleSlotChange = (index, field, value) => {
    const updated = [...formData.schedule];
    updated[index][field] = value;
    setFormData({ ...formData, schedule: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await examScheduleService.createExamSchedule(formData);
      toast.success('Exam schedule created successfully');
      fetchSchedules();
      closeModal();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error(error.response?.data?.message || 'Error creating schedule');
    }
  };

  const handleDelete = async (schedule) => {
    if (window.confirm(`Are you sure you want to delete "${schedule.examName}"?`)) {
      try {
        await examScheduleService.deleteExamSchedule(schedule._id);
        toast.success('Exam schedule deleted successfully');
        fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('Error deleting schedule');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      examName: '',
      examType: 'mid-term',
      class: '',
      academicYear: new Date().getFullYear().toString(),
      term: '1st',
      schedule: [],
      generalInstructions: '',
    });
  };

  const columns = [
    { header: 'Exam Name', accessor: 'examName' },
    {
      header: 'Type',
      accessor: 'examType',
      render: (row) => (
        <span className="capitalize">{row.examType}</span>
      ),
    },
    {
      header: 'Class',
      accessor: 'class',
      render: (row) => row.class ? `${row.class.className} - ${row.class.grade}` : 'N/A',
    },
    { header: 'Academic Year', accessor: 'academicYear' },
    {
      header: 'Subjects',
      accessor: 'subjects',
      render: (row) => row.schedule?.length || 0,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === 'completed' ? 'bg-green-100 text-green-800' :
          row.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'published' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
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
            <h1 className="text-2xl font-bold text-gray-900">Exam Schedule</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage examination schedules and timetables
            </p>
          </div>
          {isAdmin && (
            <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
              Create Exam Schedule
            </Button>
          )}
        </div>

        {/* Filter */}
        <div className="bg-white shadow rounded-lg p-4">
          <Select
            label="Filter by Class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={[
              { value: '', label: 'All Classes' },
              ...classes.map((cls) => ({
                value: cls._id,
                label: `${cls.className} - ${cls.grade}`,
              })),
            ]}
          />
        </div>

        {/* Schedules Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table columns={columns} data={schedules} loading={loading} />
        </div>

        {/* Create Schedule Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Create Exam Schedule"
          size="large"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Exam Name"
              name="examName"
              value={formData.examName}
              onChange={handleInputChange}
              placeholder="e.g., Mid-Term Examination 2024"
              required
            />

            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Exam Type"
                name="examType"
                value={formData.examType}
                onChange={handleInputChange}
                options={[
                  { value: 'mid-term', label: 'Mid-Term' },
                  { value: 'final', label: 'Final' },
                  { value: 'quiz', label: 'Quiz' },
                  { value: 'test', label: 'Test' },
                  { value: 'annual', label: 'Annual' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
                required
              />
              <Select
                label="Class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Select Class' },
                  ...classes.map((cls) => ({
                    value: cls._id,
                    label: `${cls.className} - ${cls.grade}`,
                  })),
                ]}
                required
              />
              <Select
                label="Term"
                name="term"
                value={formData.term}
                onChange={handleInputChange}
                options={[
                  { value: '1st', label: '1st Term' },
                  { value: '2nd', label: '2nd Term' },
                  { value: '3rd', label: '3rd Term' },
                  { value: 'annual', label: 'Annual' },
                ]}
              />
            </div>

            <Input
              label="Academic Year"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              required
            />

            <hr />
            <div className="flex justify-between items-center">
              <h3 className="text-md font-semibold text-gray-900">Exam Schedule</h3>
              <Button type="button" variant="secondary" onClick={addExamSlot}>
                Add Subject
              </Button>
            </div>

            {formData.schedule.map((slot, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Subject {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeExamSlot(index)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Subject"
                    value={slot.subject}
                    onChange={(e) => handleSlotChange(index, 'subject', e.target.value)}
                    options={[
                      { value: '', label: 'Select Subject' },
                      ...subjects.map((subj) => ({
                        value: subj._id,
                        label: subj.subjectName,
                      })),
                    ]}
                    required
                  />
                  <Input
                    label="Exam Date"
                    type="date"
                    value={slot.examDate}
                    onChange={(e) => handleSlotChange(index, 'examDate', e.target.value)}
                    required
                  />
                  <Input
                    label="Start Time"
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                    required
                  />
                  <Input
                    label="End Time"
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                    required
                  />
                  <Input
                    label="Duration (minutes)"
                    type="number"
                    value={slot.duration}
                    onChange={(e) => handleSlotChange(index, 'duration', e.target.value)}
                    required
                  />
                  <Input
                    label="Total Marks"
                    type="number"
                    value={slot.totalMarks}
                    onChange={(e) => handleSlotChange(index, 'totalMarks', e.target.value)}
                    required
                  />
                  <Input
                    label="Room Number"
                    value={slot.roomNumber}
                    onChange={(e) => handleSlotChange(index, 'roomNumber', e.target.value)}
                  />
                  <Select
                    label="Invigilator"
                    value={slot.invigilator}
                    onChange={(e) => handleSlotChange(index, 'invigilator', e.target.value)}
                    options={[
                      { value: '', label: 'Select Teacher' },
                      ...teachers.map((teacher) => ({
                        value: teacher._id,
                        label: `${teacher.firstName} ${teacher.lastName}`,
                      })),
                    ]}
                  />
                </div>
              </div>
            ))}

            {formData.schedule.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-md text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-600">
                  No subjects added yet. Click "Add Subject" to create exam schedule.
                </p>
              </div>
            )}

            <textarea
              name="generalInstructions"
              value={formData.generalInstructions}
              onChange={handleInputChange}
              placeholder="General exam instructions..."
              rows="3"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Create Schedule</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ExamSchedule;

