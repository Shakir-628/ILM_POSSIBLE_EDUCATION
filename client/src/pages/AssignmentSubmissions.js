import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import { assignmentService } from '../services/assignmentService';
import { submissionService } from '../services/submissionService';
import { useToast } from '../context/ToastContext';
const AssignmentSubmissions = () => {
  const toast = useToast();
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({
    marksObtained: '',
    feedback: '',
  });

  useEffect(() => {
    fetchAssignment();
    fetchSubmissions();
    fetchStats();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const data = await assignmentService.getAssignmentById(assignmentId);
      setAssignment(data);
    } catch (error) {
      console.error('Error fetching assignment:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const data = await assignmentService.getAssignmentSubmissions(assignmentId);
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await assignmentService.getAssignmentStats(assignmentId);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    try {
      await submissionService.gradeSubmission(selectedSubmission._id, gradeData);
      toast.success('Submission graded successfully');
      setIsGradeModalOpen(false);
      setGradeData({ marksObtained: '', feedback: '' });
      fetchSubmissions();
      fetchStats();
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error(error.response?.data?.message || 'Error grading submission');
    }
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'student',
      render: (row) =>
        row.student ? `${row.student.firstName} ${row.student.lastName}` : 'N/A',
    },
    {
      header: 'Student ID',
      accessor: 'studentId',
      render: (row) => row.student?.studentId || 'N/A',
    },
    {
      header: 'Submitted At',
      accessor: 'submittedAt',
      render: (row) =>
        row.submittedAt ? new Date(row.submittedAt).toLocaleString() : 'Not submitted',
    },
    {
      header: 'Files',
      accessor: 'files',
      render: (row) => (
        <div className="flex items-center">
          <PaperClipIcon className="h-4 w-4 text-gray-400 mr-1" />
          {row.files?.length || 0}
        </div>
      ),
    },
    {
      header: 'Marks',
      accessor: 'marksObtained',
      render: (row) =>
        row.marksObtained !== null && row.marksObtained !== undefined
          ? `${row.marksObtained}/${assignment?.totalMarks}`
          : 'Not graded',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === 'graded'
              ? 'bg-green-100 text-green-800'
              : row.status === 'submitted'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.files && row.files.length > 0 && (
            <button
              onClick={() => window.open(`${'https://ilm-possible-education.onrender.com/api'}?.replace('/api', '')}${row.files[0].path}`, '_blank')}
              className="text-indigo-600 hover:text-indigo-900 text-sm"
            >
              View
            </button>
          )}
          {row.status === 'submitted' && (
            <button
              onClick={() => {
                setSelectedSubmission(row);
                setGradeData({
                  marksObtained: row.marksObtained || '',
                  feedback: row.feedback || '',
                });
                setIsGradeModalOpen(true);
              }}
              className="text-green-600 hover:text-green-900 text-sm"
            >
              Grade
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {assignment?.title || 'Assignment Submissions'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {assignment?.description}
          </p>
          <div className="mt-2 flex space-x-4 text-sm text-gray-600">
            <span>
              <strong>Class:</strong> {assignment?.class?.className}
            </span>
            <span>
              <strong>Subject:</strong> {assignment?.subject?.subjectName}
            </span>
            <span>
              <strong>Due:</strong> {assignment?.dueDate && new Date(assignment.dueDate).toLocaleDateString()}
            </span>
            <span>
              <strong>Total Marks:</strong> {assignment?.totalMarks}
            </span>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <Card
              title="Total Submissions"
              value={stats.totalSubmissions || 0}
              icon={DocumentTextIcon}
              color="blue"
            />
            <Card
              title="Graded"
              value={stats.gradedCount || 0}
              icon={CheckCircleIcon}
              color="green"
            />
            <Card
              title="Pending"
              value={stats.pendingCount || 0}
              icon={ClockIcon}
              color="yellow"
            />
            <Card
              title="Average Score"
              value={stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
              icon={DocumentTextIcon}
              color="purple"
            />
          </div>
        )}

        {/* Submissions Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table columns={columns} data={submissions} loading={loading} />
        </div>

        {/* Grade Submission Modal */}
        <Modal
          isOpen={isGradeModalOpen}
          onClose={() => {
            setIsGradeModalOpen(false);
            setGradeData({ marksObtained: '', feedback: '' });
          }}
          title="Grade Submission"
        >
          {selectedSubmission && (
            <form onSubmit={handleGrade} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm">
                  <strong>Student:</strong>{' '}
                  {selectedSubmission.student
                    ? `${selectedSubmission.student.firstName} ${selectedSubmission.student.lastName}`
                    : 'N/A'}
                </p>
                <p className="text-sm">
                  <strong>Submitted:</strong>{' '}
                  {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
                {selectedSubmission.comments && (
                  <p className="text-sm mt-2">
                    <strong>Comments:</strong> {selectedSubmission.comments}
                  </p>
                )}
              </div>

              {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm font-medium mb-2">Submitted Files:</p>
                  <ul className="space-y-1">
                    {selectedSubmission.files.map((file, idx) => (
                      <li key={idx} className="text-sm flex items-center">
                        <PaperClipIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <a
                          href={`${'https://ilm-possible-education.onrender.com'}${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {file.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Input
                label={`Marks Obtained (out of ${assignment?.totalMarks || 100})`}
                type="number"
                value={gradeData.marksObtained}
                onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })}
                max={assignment?.totalMarks || 100}
                required
              />

              <textarea
                value={gradeData.feedback}
                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                placeholder="Feedback for student..."
                rows="4"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setIsGradeModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Grade</Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default AssignmentSubmissions;

