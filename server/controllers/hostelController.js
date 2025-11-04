import HostelRoom from '../models/HostelRoom.js';
import RoomAllocation from '../models/RoomAllocation.js';
import Student from '../models/Student.js';

// Rooms
export const getAllRooms = async (req, res) => {
  try {
    const { status, gender, floor } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (gender) query.gender = gender;
    if (floor) query.floor = floor;
    
    const rooms = await HostelRoom.find(query)
      .populate('students', 'firstName lastName studentId grade section')
      .populate('warden', 'name')
      .sort({ floor: 1, roomNumber: 1 });
      
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const roomData = { ...req.body, createdBy: req.user.id };
    const room = new HostelRoom(roomData);
    await room.save();
    res.status(201).json({ message: 'Room created successfully', data: room });
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await HostelRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room updated successfully', data: room });
  } catch (error) {
    res.status(500).json({ message: 'Error updating room', error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await HostelRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    if (room.currentOccupancy > 0) {
      return res.status(400).json({ message: 'Cannot delete room with students. Please vacate first.' });
    }
    
    await room.deleteOne();
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
};

// Allocations
export const getAllAllocations = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    
    const allocations = await RoomAllocation.find(query)
      .populate('room', 'roomNumber floor building')
      .populate('student', 'firstName lastName studentId grade section photo')
      .sort({ allocationDate: -1 });
      
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching allocations', error: error.message });
  }
};

export const allocateRoom = async (req, res) => {
  try {
    const { roomId, studentId, bedNumber, monthlyFee, securityDeposit } = req.body;
    
    // Check room availability
    const room = await HostelRoom.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({ message: 'Room is full' });
    }
    
    // Check if student already has a room
    const existingAllocation = await RoomAllocation.findOne({
      student: studentId,
      status: 'Active',
    });
    
    if (existingAllocation) {
      return res.status(400).json({ message: 'Student already allocated to a room' });
    }
    
    // Create allocation
    const allocation = new RoomAllocation({
      room: roomId,
      student: studentId,
      bedNumber,
      monthlyFee: monthlyFee || room.monthlyFee,
      securityDeposit: securityDeposit || 0,
      createdBy: req.user.id,
    });
    
    await allocation.save();
    
    // Update room
    room.students.push(studentId);
    room.currentOccupancy += 1;
    await room.save();
    
    const populatedAllocation = await RoomAllocation.findById(allocation._id)
      .populate('room')
      .populate('student');
    
    res.status(201).json({ message: 'Room allocated successfully', data: populatedAllocation });
  } catch (error) {
    res.status(500).json({ message: 'Error allocating room', error: error.message });
  }
};

export const vacateRoom = async (req, res) => {
  try {
    const allocation = await RoomAllocation.findById(req.params.id);
    if (!allocation) return res.status(404).json({ message: 'Allocation not found' });
    
    allocation.status = 'Vacated';
    allocation.vacateDate = new Date();
    await allocation.save();
    
    // Update room
    const room = await HostelRoom.findById(allocation.room);
    room.students = room.students.filter(s => s.toString() !== allocation.student.toString());
    room.currentOccupancy -= 1;
    await room.save();
    
    res.json({ message: 'Room vacated successfully', data: allocation });
  } catch (error) {
    res.status(500).json({ message: 'Error vacating room', error: error.message });
  }
};

// Get hostel statistics
export const getHostelStats = async (req, res) => {
  try {
    const totalRooms = await HostelRoom.countDocuments();
    const availableRooms = await HostelRoom.countDocuments({ status: 'Available' });
    const fullRooms = await HostelRoom.countDocuments({ status: 'Full' });
    const totalAllocations = await RoomAllocation.countDocuments({ status: 'Active' });
    
    const totalCapacity = await HostelRoom.aggregate([
      { $group: { _id: null, total: { $sum: '$capacity' } } },
    ]);
    
    const currentOccupancy = await HostelRoom.aggregate([
      { $group: { _id: null, total: { $sum: '$currentOccupancy' } } },
    ]);
    
    res.json({
      totalRooms,
      availableRooms,
      fullRooms,
      totalAllocations,
      totalCapacity: totalCapacity[0]?.total || 0,
      currentOccupancy: currentOccupancy[0]?.total || 0,
      occupancyRate: totalCapacity[0]?.total > 0 
        ? ((currentOccupancy[0]?.total || 0) / totalCapacity[0].total * 100).toFixed(1)
        : 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

