import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { gradeService } from '../services/gradeService';
import { studentService } from '../services/studentService';
import { classService } from '../services/classService';
import api from '../services/api';

const Grades = () => {
  const toast = useToast();
  const { isTeacher, isAdmin, isStudent } = useAuth();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student: '',
    subject: '',
    classId: '',
    examType: '',
    examName: '',
    examDate: '',
    marksObtained: '',
    totalMarks: '',
    academicYear: '2024-2025',
    term: '',
  });

  useEffect(() => {
    fetchGrades();
    if (isTeacher || isAdmin) {
      fetchStudents();
      fetchClasses();
      fetchSubjects();
    }
  }, []);

  const fetchGrades = async () => {
    try {
      const data = await gradeService.getAllGrades();
      setGrades(data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
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
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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
      await gradeService.createGrade(formData);
      fetchGrades();
      closeModal();
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error(error.response?.data?.message || 'Error saving grade');
    }
  };

  const handleDelete = async (grade) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        await gradeService.deleteGrade(grade._id);
        fetchGrades();
      } catch (error) {
        console.error('Error deleting grade:', error);
        toast.error('Error deleting grade');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      student: '',
      subject: '',
      classId: '',
      examType: '',
      examName: '',
      examDate: '',
      marksObtained: '',
      totalMarks: '',
      academicYear: '2024-2025',
      term: '',
    });
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'student',
      render: (row) =>
        row.student ? `${row.student.firstName} ${row.student.lastName}` : 'N/A',
    },
    {
      header: 'Class',
      accessor: 'class',
      render: (row) => row.class?.className || 'N/A',
    },
    { header: 'Exam', accessor: 'examName' },
    { header: 'Type', accessor: 'examType' },
    {
      header: 'Marks',
      accessor: 'marks',
      render: (row) => `${row.marksObtained}/${row.totalMarks}`,
    },
    {
      header: 'Percentage',
      accessor: 'percentage',
      render: (row) => `${row.percentage?.toFixed(2)}%`,
    },
    {
      header: 'Grade',
      accessor: 'grade',
      render: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            ['A+', 'A'].includes(row.grade)
              ? 'bg-green-100 text-green-800'
              : ['B+', 'B'].includes(row.grade)
              ? 'bg-blue-100 text-blue-800'
              : ['C+', 'C'].includes(row.grade)
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.grade}
        </span>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          {(isTeacher || isAdmin) && (
            <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
              Add Grade
            </Button>
          )}
        </div>

        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <Table
              columns={columns}
              data={grades}
              onDelete={isAdmin ? handleDelete : null}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add Grade"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Student"
            name="student"
            value={formData.student}
            onChange={handleInputChange}
            required
            options={students.map(student => ({
              value: student._id,
              label: `${student.firstName} ${student.lastName} (${student.studentId})`,
            }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Class"
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              required
              options={classes.map(cls => ({
                value: cls._id,
                label: cls.className,
              }))}
            />

            <Select
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              options={subjects.map(subj => ({
                value: subj._id,
                label: subj.subjectName,
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Exam Type"
              name="examType"
              value={formData.examType}
              onChange={handleInputChange}
              required
              options={[
                { value: 'quiz', label: 'Quiz' },
                { value: 'midterm', label: 'Midterm' },
                { value: 'final', label: 'Final' },
                { value: 'assignment', label: 'Assignment' },
                { value: 'project', label: 'Project' },
                { value: 'practical', label: 'Practical' },
              ]}
            />
            <Input
              label="Exam Name"
              name="examName"
              value={formData.examName}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Exam Date"
            name="examDate"
            type="date"
            value={formData.examDate}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Marks Obtained"
              name="marksObtained"
              type="number"
              value={formData.marksObtained}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Total Marks"
              name="totalMarks"
              type="number"
              value={formData.totalMarks}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Academic Year"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              required
              placeholder="e.g., 2023-2024"
            />
            <Select
              label="Term"
              name="term"
              value={formData.term}
              onChange={handleInputChange}
              required
              options={[
                { value: '1st', label: '1st Term' },
                { value: '2nd', label: '2nd Term' },
                { value: '3rd', label: '3rd Term' },
                { value: 'annual', label: 'Annual' },
              ]}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Add Grade</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Grades;

