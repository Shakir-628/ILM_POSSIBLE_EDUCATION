import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import { VideoCameraIcon, CalendarIcon, ClockIcon, PlusIcon, TrashIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import onlineClassService from '../services/onlineClassService';
import { subjectService } from '../services/subjectService';
import { classService } from '../services/classService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { teacherService } from '../services/teacherService';
import { format } from 'date-fns';

const OnlineClasses = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    classId: '',
    teacherId: '',
    startTime: '',
    duration: 40,
    description: ''
  });

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    fetchOnlineClasses();
    if (isTeacher || isAdmin) {
      fetchSubjects();
      fetchClasses();
    }
    if (isAdmin) {
      fetchTeachers();
    }
  }, [user]);

  const fetchOnlineClasses = async () => {
    try {
      const response = await onlineClassService.getClasses();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching online classes:', error);
      toast.error('Failed to load online classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAllSubjects();
      setSubjects(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setAvailableClasses(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAllTeachers();
      setTeachers(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onlineClassService.scheduleClass(formData);
      toast.success('Online class scheduled successfully');
      setIsModalOpen(false);
      fetchOnlineClasses();
      setFormData({ title: '', subject: '', classId: '', teacherId: '', startTime: '', duration: 40, description: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error scheduling class');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this class?')) {
      try {
        await onlineClassService.deleteClass(id);
        toast.success('Class cancelled');
        fetchOnlineClasses();
      } catch (error) {
        toast.error('Error deleting class');
      }
    }
  };

  const handleJoin = (meetingLink) => {
    window.open(meetingLink, '_blank');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">Online Classes</h1>
            <p className="text-sm text-gray-500 mt-1">Schedule and join virtual learning sessions</p>
          </div>
          {(isTeacher || isAdmin) && (
            <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
              Schedule Class
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/4"></div>
              </div>
            ))
          ) : (classes || []).length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <VideoCameraIcon className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Online Classes</h3>
              <p className="text-gray-500 mt-2">There are no virtual classes scheduled at the moment.</p>
            </div>
          ) : (
            (classes || []).map((cls) => (
              <div key={cls._id} className="bg-white group rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary-50 p-3 rounded-xl">
                      <VideoCameraIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    {(isTeacher || isAdmin) && (
                      <button onClick={() => handleDelete(cls._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {cls.title}
                  </h3>
                  <p className="text-sm font-medium text-primary-700 bg-primary-50 inline-block px-2 py-0.5 rounded mb-4">
                    {cls.subject?.subjectName}
                  </p>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>{format(new Date(cls.startTime), 'EEEE, MMMM do')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span>{format(new Date(cls.startTime), 'hh:mm a')} ({cls.duration} mins)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-600 font-bold">C</div>
                      <span>Class: {cls.class?.className}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-50 flex gap-3">
                    <Button
                      fullWidth
                      icon={ArrowTopRightOnSquareIcon}
                      onClick={() => handleJoin(cls.meetingLink)}
                    >
                      Join Class
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Online Class"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Class Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Mathematics - Algebra Advanced"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              options={(subjects || []).map(s => ({ value: s._id, label: s.subjectName }))}
            />
            <Select
              label="Target Class"
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              required
              options={(availableClasses || []).map(c => ({ value: c._id, label: c.className }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date & Time"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
            {isAdmin && (
              <Select
                label="Assign Teacher"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
                options={(teachers || []).map(t => ({ value: t._id, label: `${t.firstName} ${t.lastName}` }))}
              />
            )}
            <Input
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Schedule Class</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default OnlineClasses;
