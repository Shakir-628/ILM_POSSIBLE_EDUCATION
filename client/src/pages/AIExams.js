import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiExamService } from '../services/aiExamService';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../hooks/useToast';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Select from '../components/Select';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import {
    ClipboardDocumentCheckIcon,
    PlusIcon,
    PlayIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

const AIExams = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await aiExamService.getAllAIExams();
            setExams(response.data || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
            showToast('Error loading exams', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (examId) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            try {
                await aiExamService.deleteAIExam(examId);
                showToast('Exam deleted successfully', 'success');
                fetchExams();
            } catch (error) {
                console.error('Error deleting exam:', error);
                showToast('Error deleting exam', 'error');
            }
        }
    };

    const handleStatusUpdate = async (examId, newStatus) => {
        try {
            await aiExamService.updateAIExam(examId, { status: newStatus });
            showToast(`Exam ${newStatus === 'ongoing' ? 'published' : 'updated'} successfully`, 'success');
            fetchExams();
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Error updating exam status', 'error');
        }
    };

    const filteredExams = exams.filter(e => {
        // Students should not see draft exams
        if (user?.role === 'student' && e.status === 'draft') return false;

        // Apply status filter
        if (statusFilter !== 'all' && e.status !== statusFilter) return false;

        return true;
    });

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
    } = useTableData(filteredExams, ['title', 'description'], 10);

    const columns = [
        {
            header: 'Exam Title',
            accessor: 'title',
            render: (row) => (
                <div className="flex items-center">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2 text-primary-500" />
                    <span className="font-medium">{row.title}</span>
                </div>
            ),
        },
        {
            header: 'Subject',
            accessor: 'subject',
            render: (row) => row.subject?.subjectName || 'N/A',
        },
        {
            header: 'Class',
            accessor: 'class',
            render: (row) => row.class?.className || 'N/A',
        },
        {
            header: 'Type',
            accessor: 'examType',
            render: (row) => (
                <span className="capitalize">{row.examType}</span>
            ),
        },
        {
            header: 'Duration',
            accessor: 'duration',
            render: (row) => `${row.examSettings?.duration || 0} min`,
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${row.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    row.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        row.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                    }`}>
                    {row.status}
                </span>
            ),
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex space-x-2">
                    {user?.role === 'student' && (
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => navigate(`/exams/${row._id}/take`)}
                            title="Take Exam"
                        >
                            <PlayIcon className="h-4 w-4" />
                        </Button>
                    )}
                    {(user?.role === 'admin' || user?.role === 'teacher') && (
                        <>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => navigate(`/exams/${row._id}/edit`)}
                                title="Edit Exam"
                            >
                                <PencilSquareIcon className="h-4 w-4" />
                            </Button>
                            {row.status === 'draft' && (
                                <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleStatusUpdate(row._id, 'ongoing')}
                                    title="Publish Exam"
                                >
                                    <ArrowUpTrayIcon className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(row._id)}
                                title="Delete Exam"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Exams</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage and take AI-powered exams
                        </p>
                    </div>
                    {(user?.role === 'admin' || user?.role === 'teacher') && (
                        <Button onClick={() => navigate('/exams/create')}>
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Create AI Exam
                        </Button>
                    )}
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="w-full md:w-96">
                            <SearchBar
                                placeholder="Search exams..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClear={clearSearch}
                            />
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'draft', label: 'Draft' },
                                    { value: 'scheduled', label: 'Scheduled' },
                                    { value: 'ongoing', label: 'Ongoing' },
                                    { value: 'completed', label: 'Completed' },
                                ]}
                            />
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        data={paginatedData}
                        loading={loading}
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default AIExams;
