import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import { 
  DocumentIcon, 
  VideoCameraIcon, 
  LinkIcon, 
  PlusIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';

const ResourceLibrary = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    classId: '',
    subjectId: '',
    externalUrl: '',
    file: null
  });

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    fetchResources();
    if (isTeacher || isAdmin) {
      fetchDropdownData();
    }
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/resources');
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const classData = await classService.getAllClasses();
      setClasses(classData);
      const subjectData = await subjectService.getAllSubjects();
      setSubjects(subjectData);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      if (formData.type !== 'link' && !formData.file) {
        toast.error('Please upload a file or provide a link');
        return;
      }
      
      await axios.post('/api/resources', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Resource uploaded successfully');
      setIsModalOpen(false);
      fetchResources();
      setFormData({
        title: '',
        description: '',
        type: 'document',
        classId: '',
        subjectId: '',
        externalUrl: '',
        file: null
      });
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast.error(error.response?.data?.message || 'Failed to upload resource');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await axios.delete(`/api/resources/${id}`);
        toast.success('Resource deleted');
        fetchResources();
      } catch (error) {
        toast.error('Failed to delete resource');
      }
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         res.subject?.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || res.type === filterType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'video': return <VideoCameraIcon className="h-6 w-6 text-red-500" />;
      case 'link': return <LinkIcon className="h-6 w-6 text-blue-500" />;
      case 'document': return <DocumentIcon className="h-6 w-6 text-indigo-500" />;
      default: return <DocumentTextIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">LMS Resource Library</h1>
            <p className="text-sm text-gray-500 mt-1">Access structured learning materials and lesson notes</p>
          </div>
          {(isTeacher || isAdmin) && (
            <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
              Upload Resource
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or subject..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="document">Documents</option>
            <option value="note">Lesson Notes</option>
            <option value="link">External Links</option>
            <option value="video">Videos</option>
          </select>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100"></div>
            ))
          ) : filteredResources.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100">
              <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No resources found matching your criteria</p>
            </div>
          ) : (
            filteredResources.map((res) => (
              <div key={res._id} className="bg-white group rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:scale-110 transition-transform">
                      {getIcon(res.type)}
                    </div>
                    {(isAdmin || (isTeacher && res.teacher?._id === user?._id)) && (
                      <button onClick={() => handleDelete(res._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{res.title}</h3>
                  <p className="text-xs text-primary-600 font-semibold uppercase mt-1">
                    {res.subject?.subjectName} • {res.class?.className}
                  </p>
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">{res.description}</p>
                </div>
                
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                   <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                        {res.teacher?.firstName?.[0]}{res.teacher?.lastName?.[0]}
                      </div>
                      <span className="ml-2 text-xs text-gray-600 font-medium">{res.teacher?.firstName} {res.teacher?.lastName}</span>
                   </div>
                   
                   {res.type === 'link' || res.type === 'video' ? (
                     <a href={res.externalUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" icon={LinkIcon}>Open</Button>
                     </a>
                   ) : (
                     <a href={`/api/resources/download/${res._id}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" icon={ArrowDownTrayIcon}>View</Button>
                     </a>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Learning Resource"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Resource Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Algebra Introduction Chapter 1"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Resource Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: 'document', label: 'PDF Document' },
                { value: 'note', label: 'Lesson Notes' },
                { value: 'link', label: 'External Resource (Link)' },
                { value: 'video', label: 'YouTube/Video Link' }
              ]}
              required
            />
            <Select
              label="Subject"
              name="subjectId"
              value={formData.subjectId}
              onChange={handleInputChange}
              options={subjects.map(s => ({ value: s._id, label: s.subjectName }))}
              required
            />
          </div>
          <Select
            label="Target Class"
            name="classId"
            value={formData.classId}
            onChange={handleInputChange}
            options={classes.map(c => ({ value: c._id, label: c.className }))}
            required
          />
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              name="description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none h-24"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {formData.type === 'link' || formData.type === 'video' ? (
            <Input
              label="External URL"
              name="externalUrl"
              value={formData.externalUrl}
              onChange={handleInputChange}
              placeholder="https://youtube.com/..."
              required
            />
          ) : (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Upload File</label>
              <input 
                type="file" 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                onChange={handleFileChange}
              />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Publish Resource</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default ResourceLibrary;
