import TransportRoute from '../models/TransportRoute.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Student from '../models/Student.js';

// Routes
export const getAllRoutes = async (req, res) => {
  try {
    const routes = await TransportRoute.find()
      .populate('vehicle', 'vehicleNumber vehicleType')
      .populate('driver', 'firstName lastName driverId phone')
      .populate('students', 'firstName lastName studentId')
      .sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching routes', error: error.message });
  }
};

export const createRoute = async (req, res) => {
  try {
    const routeData = { ...req.body, createdBy: req.user.id };
    const route = new TransportRoute(routeData);
    await route.save();
    res.status(201).json({ message: 'Route created successfully', data: route });
  } catch (error) {
    res.status(500).json({ message: 'Error creating route', error: error.message });
  }
};

export const updateRoute = async (req, res) => {
  try {
    const route = await TransportRoute.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route updated successfully', data: route });
  } catch (error) {
    res.status(500).json({ message: 'Error updating route', error: error.message });
  }
};

export const deleteRoute = async (req, res) => {
  try {
    const route = await TransportRoute.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting route', error: error.message });
  }
};

// Vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate('currentDriver', 'firstName lastName driverId phone')
      .populate('assignedRoute', 'routeName routeId')
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const vehicleData = { ...req.body, createdBy: req.user.id };
    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully', data: vehicle });
  } catch (error) {
    res.status(500).json({ message: 'Error creating vehicle', error: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle updated successfully', data: vehicle });
  } catch (error) {
    res.status(500).json({ message: 'Error updating vehicle', error: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
  }
};

// Drivers
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate('assignedVehicle', 'vehicleNumber vehicleType')
      .populate('assignedRoute', 'routeName routeId')
      .sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching drivers', error: error.message });
  }
};

export const createDriver = async (req, res) => {
  try {
    const driverData = { ...req.body, createdBy: req.user.id };
    const driver = new Driver(driverData);
    await driver.save();
    res.status(201).json({ message: 'Driver added successfully', data: driver });
  } catch (error) {
    res.status(500).json({ message: 'Error creating driver', error: error.message });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver updated successfully', data: driver });
  } catch (error) {
    res.status(500).json({ message: 'Error updating driver', error: error.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting driver', error: error.message });
  }
};

// Assign student to route
export const assignStudentToRoute = async (req, res) => {
  try {
    const { routeId, studentId } = req.body;
    
    const route = await TransportRoute.findById(routeId);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    
    if (route.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already assigned to this route' });
    }
    
    if (route.students.length >= route.capacity) {
      return res.status(400).json({ message: 'Route capacity full' });
    }
    
    route.students.push(studentId);
    await route.save();
    
    res.json({ message: 'Student assigned to route successfully', data: route });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning student', error: error.message });
  }
};

// Remove student from route
export const removeStudentFromRoute = async (req, res) => {
  try {
    const { routeId, studentId } = req.params;
    
    const route = await TransportRoute.findById(routeId);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    
    route.students = route.students.filter(s => s.toString() !== studentId);
    await route.save();
    
    res.json({ message: 'Student removed from route', data: route });
  } catch (error) {
    res.status(500).json({ message: 'Error removing student', error: error.message });
  }
};

// Get transport statistics
export const getTransportStats = async (req, res) => {
  try {
    const totalRoutes = await TransportRoute.countDocuments();
    const activeRoutes = await TransportRoute.countDocuments({ status: 'Active' });
    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({ status: 'Active' });
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ status: 'Active' });
    
    // Count total students using transport
    const routes = await TransportRoute.find();
    const totalStudents = routes.reduce((sum, route) => sum + route.students.length, 0);
    
    res.json({
      totalRoutes,
      activeRoutes,
      totalVehicles,
      activeVehicles,
      totalDrivers,
      activeDrivers,
      totalStudents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

