import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import {
  HomeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { hostelService } from '../services/hostelService';
import { studentService } from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Hostel = () => {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('rooms'); // rooms, allocations
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  const [roomFormData, setRoomFormData] = useState({
    roomNumber: '',
    roomType: 'Double',
    floor: '1st Floor',
    capacity: 2,
    gender: 'Male',
    monthlyFee: '',
    facilities: [],
  });

  const [allocationFormData, setAllocationFormData] = useState({
    roomId: '',
    studentId: '',
    bedNumber: '',
    securityDeposit: '',
  });

  useEffect(() => {
    fetchData();
    fetchStudents();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, allocationsData, statsData] = await Promise.all([
        hostelService.getAllRooms(),
        hostelService.getAllAllocations(),
        hostelService.getHostelStats(),
      ]);
      
      setRooms(roomsData);
      setAllocations(allocationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch hostel data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await hostelService.createRoom(roomFormData);
      toast.success('Room created successfully');
      fetchData();
      setIsRoomModalOpen(false);
      resetRoomForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating room');
    }
  };

  const handleAllocateRoom = async (e) => {
    e.preventDefault();
    try {
      const room = rooms.find(r => r._id === allocationFormData.roomId);
      const dataToSend = {
        ...allocationFormData,
        monthlyFee: room?.monthlyFee || 0,
      };
      
      await hostelService.allocateRoom(dataToSend);
      toast.success('Room allocated successfully');
      fetchData();
      setIsAllocationModalOpen(false);
      resetAllocationForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error allocating room');
    }
  };

  const handleVacateRoom = async (allocationId) => {
    if (window.confirm('Are you sure you want to vacate this room?')) {
      try {
        await hostelService.vacateRoom(allocationId);
        toast.success('Room vacated successfully');
        fetchData();
      } catch (error) {
        toast.error('Error vacating room');
      }
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await hostelService.deleteRoom(roomId);
        toast.success('Room deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting room');
      }
    }
  };

  const resetRoomForm = () => {
    setRoomFormData({
      roomNumber: '',
      roomType: 'Double',
      floor: '1st Floor',
      capacity: 2,
      gender: 'Male',
      monthlyFee: '',
      facilities: [],
    });
  };

  const resetAllocationForm = () => {
    setAllocationFormData({
      roomId: '',
      studentId: '',
      bedNumber: '',
      securityDeposit: '',
    });
  };

  const roomColumns = [
    { header: 'Room Number', accessor: 'roomNumber' },
    { header: 'Type', accessor: 'roomType' },
    { header: 'Floor', accessor: 'floor' },
    { header: 'Gender', accessor: 'gender' },
    {
      header: 'Occupancy',
      accessor: 'occupancy',
      render: (row) => `${row.currentOccupancy} / ${row.capacity}`,
    },
    { header: 'Monthly Fee', accessor: 'monthlyFee', render: (row) => `PKR ${row.monthlyFee}` },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.status === 'Available' ? 'bg-green-100 text-green-800' :
          row.status === 'Full' ? 'bg-red-100 text-red-800' :
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
        isAdmin && row.currentOccupancy === 0 && (
          <button onClick={() => handleDeleteRoom(row._id)} className="text-red-600 hover:text-red-900">
            Delete
          </button>
        )
      ),
    },
  ];

  const allocationColumns = [
    { header: 'Allocation ID', accessor: 'allocationId' },
    {
      header: 'Student',
      accessor: 'student',
      render: (row) => (
        <div>
          <div className="font-medium">{row.student?.firstName} {row.student?.lastName}</div>
          <div className="text-xs text-gray-500">{row.student?.studentId}</div>
        </div>
      ),
    },
    {
      header: 'Room',
      accessor: 'room',
      render: (row) => `${row.room?.roomNumber} (${row.room?.floor})`,
    },
    { header: 'Bed', accessor: 'bedNumber' },
    {
      header: 'Allocation Date',
      accessor: 'allocationDate',
      render: (row) => new Date(row.allocationDate).toLocaleDateString(),
    },
    { header: 'Monthly Fee', accessor: 'monthlyFee', render: (row) => `PKR ${row.monthlyFee}` },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        isAdmin && row.status === 'Active' && (
          <button onClick={() => handleVacateRoom(row._id)} className="text-red-600 hover:text-red-900">
            Vacate
          </button>
        )
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <HomeIcon className="h-8 w-8 mr-2 text-primary-600" />
              Hostel Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">Manage rooms and student allocations</p>
          </div>
          {isAdmin && (
            <Button
              icon={PlusIcon}
              onClick={() => activeTab === 'rooms' ? setIsRoomModalOpen(true) : setIsAllocationModalOpen(true)}
            >
              {activeTab === 'rooms' ? 'Add Room' : 'Allocate Room'}
            </Button>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card title="Total Rooms" value={stats.totalRooms} icon={HomeIcon} color="blue" />
            <Card title="Available Rooms" value={stats.availableRooms} icon={CheckCircleIcon} color="green" />
            <Card title="Occupancy Rate" value={`${stats.occupancyRate}%`} icon={UserGroupIcon} color="purple" />
            <Card title="Total Students" value={stats.totalAllocations} icon={UserGroupIcon} color="indigo" />
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { key: 'rooms', label: 'Rooms', icon: HomeIcon },
                { key: 'allocations', label: 'Allocations', icon: UserGroupIcon },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-5 w-5 inline-block mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'rooms' && <Table columns={roomColumns} data={rooms} loading={loading} />}
            {activeTab === 'allocations' && <Table columns={allocationColumns} data={allocations} loading={loading} />}
          </div>
        </div>

        {/* Add Room Modal */}
        <Modal isOpen={isRoomModalOpen} onClose={() => setIsRoomModalOpen(false)} title="Add New Room">
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Room Number"
                name="roomNumber"
                value={roomFormData.roomNumber}
                onChange={(e) => setRoomFormData({ ...roomFormData, roomNumber: e.target.value.toUpperCase() })}
                placeholder="e.g., R101"
                required
              />
              <Select
                label="Room Type"
                name="roomType"
                value={roomFormData.roomType}
                onChange={(e) => setRoomFormData({ ...roomFormData, roomType: e.target.value })}
                options={[
                  { value: 'Single', label: 'Single' },
                  { value: 'Double', label: 'Double' },
                  { value: 'Triple', label: 'Triple' },
                  { value: 'Quad', label: 'Quad' },
                  { value: 'Dormitory', label: 'Dormitory' },
                ]}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Floor"
                name="floor"
                value={roomFormData.floor}
                onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })}
                required
              />
              <Input
                label="Capacity"
                name="capacity"
                type="number"
                value={roomFormData.capacity}
                onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })}
                min="1"
                required
              />
              <Select
                label="Gender"
                name="gender"
                value={roomFormData.gender}
                onChange={(e) => setRoomFormData({ ...roomFormData, gender: e.target.value })}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                ]}
                required
              />
            </div>
            <Input
              label="Monthly Fee (PKR)"
              name="monthlyFee"
              type="number"
              value={roomFormData.monthlyFee}
              onChange={(e) => setRoomFormData({ ...roomFormData, monthlyFee: e.target.value })}
              required
            />
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsRoomModalOpen(false)}>Cancel</Button>
              <Button type="submit">Create Room</Button>
            </div>
          </form>
        </Modal>

        {/* Allocate Room Modal */}
        <Modal isOpen={isAllocationModalOpen} onClose={() => setIsAllocationModalOpen(false)} title="Allocate Room">
          <form onSubmit={handleAllocateRoom} className="space-y-4">
            <Select
              label="Select Room"
              name="roomId"
              value={allocationFormData.roomId}
              onChange={(e) => setAllocationFormData({ ...allocationFormData, roomId: e.target.value })}
              options={[
                { value: '', label: 'Select Room' },
                ...rooms.filter(r => r.status === 'Available' || r.currentOccupancy < r.capacity).map(room => ({
                  value: room._id,
                  label: `${room.roomNumber} - ${room.roomType} (${room.currentOccupancy}/${room.capacity}) - PKR ${room.monthlyFee}`,
                })),
              ]}
              required
            />
            <Select
              label="Select Student"
              name="studentId"
              value={allocationFormData.studentId}
              onChange={(e) => setAllocationFormData({ ...allocationFormData, studentId: e.target.value })}
              options={[
                { value: '', label: 'Select Student' },
                ...students.map(student => ({
                  value: student._id,
                  label: `${student.firstName} ${student.lastName} (${student.studentId})${student.grade ? ` - ${student.grade}` : ''}${student.section ? ` ${student.section}` : ''}`,
                })),
              ]}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bed Number (Optional)"
                name="bedNumber"
                value={allocationFormData.bedNumber}
                onChange={(e) => setAllocationFormData({ ...allocationFormData, bedNumber: e.target.value })}
                placeholder="e.g., B1, B2"
              />
              <Input
                label="Security Deposit (PKR)"
                name="securityDeposit"
                type="number"
                value={allocationFormData.securityDeposit}
                onChange={(e) => setAllocationFormData({ ...allocationFormData, securityDeposit: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsAllocationModalOpen(false)}>Cancel</Button>
              <Button type="submit">Allocate Room</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Hostel;

