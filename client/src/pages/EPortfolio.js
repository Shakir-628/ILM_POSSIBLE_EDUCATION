import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import SearchBar from '../components/SearchBar';
import {
    TrophyIcon,
    DocumentIcon,
    SparklesIcon,
    PlusIcon,
    FolderIcon,
    CalendarIcon,
    UserIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';
import ePortfolioService from '../services/ePortfolioService';
import { studentService } from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OcrScanner from '../components/OcrScanner';
import api from '../services/api';

const EPortfolio = () => {
    const { isAdmin, isTeacher, isStudent } = useAuth();
    const toast = useToast();

    const [portfolioItems, setPortfolioItems] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        category: 'achievement',
        description: '',
        date: new Date().toISOString().split('T')[0],
        academicYear: '2023-24',
        achievementLevel: '',
        tags: '',
    });

    const [attachments, setAttachments] = useState([]);

    const fetchPortfolio = React.useCallback(async (studentId) => {
        setLoading(true);
        try {
            const data = await ePortfolioService.getStudentPortfolio(studentId);
            setPortfolioItems(data);
        } catch (error) {
            toast.error('Failed to load portfolio items');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const fetchStudents = React.useCallback(async () => {
        try {
            const data = await studentService.getAllStudents();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    }, []);

    const fetchMyPortfolio = React.useCallback(async () => {
        try {
            // For student, we first need their student record
            const response = await api.get('/students/me');
            setSelectedStudent(response.data);
            fetchPortfolio(response.data._id);
        } catch (error) {
            console.error('Error fetching student profile:', error);
        }
    }, [fetchPortfolio]);

    useEffect(() => {
        if (isAdmin || isTeacher) {
            fetchStudents();
        } else if (isStudent) {
            // Find the student ID for the current user
            fetchMyPortfolio();
        }
    }, [isAdmin, isTeacher, isStudent, fetchStudents, fetchMyPortfolio]);

    const handleStudentSelect = (studentId) => {
        const student = students.find(s => s._id === studentId);
        setSelectedStudent(student);
        if (student) {
            fetchPortfolio(student._id);
        } else {
            setPortfolioItems([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setAttachments([...attachments, ...Array.from(e.target.files)]);
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent) {
            toast.error('Please select a student first');
            return;
        }

        try {
            const itemData = {
                ...formData,
                studentId: selectedStudent._id,
            };

            let savedItem;
            if (editingId) {
                savedItem = await ePortfolioService.updatePortfolioItem(editingId, itemData);
                toast.success('Portfolio item updated successfully!');
            } else {
                savedItem = await ePortfolioService.addPortfolioItem(itemData);
                toast.success('Portfolio item added successfully!');
            }

            if (attachments.length > 0) {
                await ePortfolioService.uploadAttachments(savedItem._id, attachments);
            }

            setIsFormModalOpen(false);
            setEditingId(null);
            setFormData({
                title: '',
                category: 'achievement',
                description: '',
                date: new Date().toISOString().split('T')[0],
                academicYear: '2023-24',
                achievementLevel: '',
                tags: '',
            });
            setAttachments([]);
            fetchPortfolio(selectedStudent._id);
        } catch (error) {
            console.error(error);
            toast.error(editingId ? 'Failed to update portfolio item' : 'Failed to add portfolio item');
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            title: item.title,
            category: item.category,
            description: item.description,
            date: item.date ? item.date.split('T')[0] : '',
            academicYear: item.academicYear,
            achievementLevel: item.achievementLevel || '',
            tags: item.tags || '',
        });
        setAttachments([]); // New attachments only
        setIsFormModalOpen(true);
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this achievement?')) {
            try {
                await ePortfolioService.deletePortfolioItem(itemId);
                toast.success('Item deleted successfully');
                fetchPortfolio(selectedStudent._id);
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete item');
            }
        }
    };

    const handleOcrData = (data) => {
        setFormData({
            ...formData,
            title: data.title || 'Extracted Achievement',
            description: `Name: ${data.firstName} ${data.lastName}\nDOB: ${data.dateOfBirth}\nFather: ${data.fatherName}`,
            date: (data.dateOfBirth && data.dateOfBirth.length === 10) ? data.dateOfBirth : formData.date,
            category: 'certificate',
            achievementLevel: data.achievementLevel || '',
        });
        setIsScannerOpen(false);
        setIsFormModalOpen(true);
    };

    const filteredItems = portfolioItems.filter(item => {
        const matchesCategory = filter === 'all' || item.category === filter;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (item.title && item.title.toLowerCase().includes(searchLower)) ||
            (item.description && item.description.toLowerCase().includes(searchLower));

        return matchesCategory && matchesSearch;
    });

    const stats = {
        total: portfolioItems.length,
        certificates: portfolioItems.filter(i => i.category === 'certificate').length,
        sports: portfolioItems.filter(i => i.category === 'sports').length,
        projects: portfolioItems.filter(i => i.category === 'project').length,
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fadeIn">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">E-Portfolio</h1>
                        <p className="text-gray-500">Student Achievement & Project Store</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {(isAdmin || isTeacher) && (
                            <div className="w-64">
                                <Select
                                    name="studentId"
                                    options={students.map(s => ({
                                        label: `${s.firstName} ${s.lastName} (${s.studentId})`,
                                        value: s._id
                                    }))}
                                    onChange={(e) => handleStudentSelect(e.target.value)}
                                    placeholder="Select Student"
                                />
                            </div>
                        )}

                        {(isAdmin || isTeacher) && selectedStudent && (
                            <Button
                                variant="primary"
                                icon={PlusIcon}
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({
                                        title: '',
                                        category: 'achievement',
                                        description: '',
                                        date: new Date().toISOString().split('T')[0],
                                        academicYear: '2023-24',
                                        achievementLevel: '',
                                        tags: '',
                                    });
                                    setAttachments([]);
                                    setIsFormModalOpen(true);
                                }}
                            >
                                Add Achievement
                            </Button>
                        )}

                        <Button
                            variant="secondary"
                            icon={SparklesIcon}
                            onClick={() => setIsScannerOpen(true)}
                        >
                            AI Scanner
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <FolderIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-100 font-medium font-outfit uppercase tracking-wider">Total Items</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <TrophyIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-amber-100 font-medium font-outfit uppercase tracking-wider">Certificates</p>
                                <p className="text-2xl font-bold">{stats.certificates}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <SparklesIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-emerald-100 font-medium font-outfit uppercase tracking-wider">Sports</p>
                                <p className="text-2xl font-bold">{stats.sports}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <DocumentIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-rose-100 font-medium font-outfit uppercase tracking-wider">Projects</p>
                                <p className="text-2xl font-bold">{stats.projects}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and List Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant={filter === 'all' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setFilter('all')}
                            >
                                All Items
                            </Button>
                            <Button
                                variant={filter === 'certificate' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setFilter('certificate')}
                            >
                                Certificates
                            </Button>
                            <Button
                                variant={filter === 'sports' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setFilter('sports')}
                            >
                                Sports
                            </Button>
                            <Button
                                variant={filter === 'project' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setFilter('project')}
                            >
                                Projects
                            </Button>
                        </div>
                        <div className="w-full md:w-64">
                            <SearchBar
                                placeholder="Search portfolio..."
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onClear={() => setSearchTerm('')}
                            />
                        </div>
                    </div>

                    <div className="p-6">
                        {!selectedStudent ? (
                            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900">No Student Selected</h3>
                                <p className="text-gray-500">Please select a student to view their E-Portfolio.</p>
                            </div>
                        ) : loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                <p className="mt-4 text-gray-500">Loading portfolio...</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900">Empty Portfolio</h3>
                                <p className="text-gray-500">No achievements recorded for this student yet.</p>
                                {(isAdmin || isTeacher) && (
                                    <Button
                                        variant="primary"
                                        className="mt-6"
                                        onClick={() => setIsFormModalOpen(true)}
                                    >
                                        Add First Achievement
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredItems.map((item) => (
                                    <div
                                        key={item._id}
                                        className="group bg-white border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg rounded-2xl overflow-hidden transform hover:-translate-y-1"
                                    >
                                        <div className="p-0">
                                            <div className={`h-2 ${item.category === 'sports' ? 'bg-emerald-500' :
                                                item.category === 'project' ? 'bg-rose-500' : 'bg-amber-500'
                                                }`} />

                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`p-2 rounded-lg ${item.category === 'sports' ? 'bg-emerald-50' :
                                                        item.category === 'project' ? 'bg-rose-50' : 'bg-amber-50'
                                                        }`}>
                                                        {item.category === 'sports' ? <SparklesIcon className="w-6 h-6 text-emerald-600" /> :
                                                            item.category === 'project' ? <DocumentIcon className="w-6 h-6 text-rose-600" /> :
                                                                <TrophyIcon className="w-6 h-6 text-amber-600" />}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                                        {item.academicYear}
                                                    </span>
                                                </div>

                                                <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2 h-10">
                                                    {item.description}
                                                </p>

                                                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon className="w-4 h-4" />
                                                        {item.date && new Date(item.date).toLocaleDateString()}
                                                    </div>
                                                    {item.attachments?.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                                            {item.attachments.length} Files
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none shadow-none"
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setIsViewModalOpen(true);
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>

                                                    {(isAdmin || isTeacher) && (
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                                                onClick={() => handleEdit(item)}
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                                                                onClick={() => handleDelete(item._id)}
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Item Modal */}
                <Modal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    title={editingId ? 'Edit Achievement/Record' : 'Add Achievement/Record'}
                    maxWidth="2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Input
                                    label="Title / Achievement Name"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 1st Place Science Fair"
                                    required
                                />
                            </div>
                            <Select
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                options={[
                                    { label: 'Certificate', value: 'certificate' },
                                    { label: 'Sports Achievement', value: 'sports' },
                                    { label: 'Project Work', value: 'project' },
                                    { label: 'General Achievement', value: 'achievement' },
                                    { label: 'Community Service', value: 'community-service' },
                                ]}
                                required
                            />
                            <Input
                                label="Academic Year"
                                name="academicYear"
                                value={formData.academicYear}
                                onChange={handleInputChange}
                                placeholder="2023-24"
                                required
                            />
                            <Input
                                label="Date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                label="Achievement Level (Optional)"
                                name="achievementLevel"
                                value={formData.achievementLevel}
                                onChange={handleInputChange}
                                placeholder="e.g. Gold Medalist"
                            />
                        </div>

                        <Input
                            label="Description"
                            name="description"
                            type="textarea"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Provide more details about this achievement..."
                            rows={4}
                        />

                        <div>
                            <label className="block text-sm font-bold text-indigo-900 mb-1">Attachments</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors cursor-pointer group relative">
                                <div className="space-y-1 text-center">
                                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                    <div className="flex text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                            <span>Upload files</span>
                                            <input type="file" className="sr-only" multiple onChange={handleFileChange} />
                                        </label>
                                        <p className="pl-1 text-gray-500">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                                </div>
                            </div>

                            {attachments.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg text-xs truncate">
                                            <span className="truncate flex-1">{file.name}</span>
                                            <button type="button" onClick={() => removeAttachment(idx)} className="ml-2 text-rose-500 hover:text-rose-700">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" type="submit">Save Achievement</Button>
                        </div>
                    </form>
                </Modal>

                {/* View Detail Modal */}
                <Modal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Achievement Details"
                    maxWidth="lg"
                >
                    {selectedItem && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-4 rounded-2xl ${selectedItem.category === 'sports' ? 'bg-emerald-100 text-emerald-600' :
                                    selectedItem.category === 'project' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                    {selectedItem.category === 'sports' ? <SparklesIcon className="w-8 h-8" /> :
                                        selectedItem.category === 'project' ? <DocumentIcon className="w-8 h-8" /> : <TrophyIcon className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedItem.title}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <span className="capitalize">{selectedItem.category}</span>
                                        <span>•</span>
                                        <span>{selectedItem.academicYear}</span>
                                        <span>•</span>
                                        <span>{new Date(selectedItem.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedItem.achievementLevel && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
                                    <SparklesIcon className="w-5 h-5 text-indigo-600" />
                                    <span className="text-sm font-bold text-indigo-900 uppercase tracking-wider">{selectedItem.achievementLevel}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Description</h3>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                                    {selectedItem.description}
                                </p>
                            </div>

                            {selectedItem.attachments?.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Attachments</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {selectedItem.attachments.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={`http://localhost:5001${file.path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <DocumentIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                                    <span className="text-sm text-gray-700 truncate">{file.filename}</span>
                                                </div>
                                                <ArrowDownTrayIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <UserIcon className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        <p className="font-bold">Added by</p>
                                        <p className="uppercase">{selectedItem.addedBy?.name || 'Staff'}</p>
                                    </div>
                                </div>
                                <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* AI Scanner Modal */}
                <Modal
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    title="AI Document Scanner"
                    maxWidth="lg"
                >
                    <div className="p-4">
                        <p className="text-sm text-gray-500 mb-6">
                            Upload a certificate or achievement document. Our AI will automatically extract the details and pre-fill the form for you.
                        </p>
                        <OcrScanner onDataExtracted={handleOcrData} />
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};

export default EPortfolio;
