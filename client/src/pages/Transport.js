import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import {
  TruckIcon,
  MapPinIcon,
  UserIcon,
  PlusIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { transportService } from '../services/transportService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Transport = () => {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('routes'); // routes, vehicles, drivers
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [routeFormData, setRouteFormData] = useState({
    routeName: '',
    startPoint: '',
    endPoint: '',
    departureTime: '',
    monthlyFee: '',
    capacity: 40,
    daysActive: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  });

  const [vehicleFormData, setVehicleFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'Bus',
    manufacturer: '',
    model: '',
    year: new Date().getFullYear(),
    seatingCapacity: 40,
    registrationNumber: '',
    fuelType: 'Diesel',
  });

  const [driverFormData, setDriverFormData] = useState({
    firstName: '',
    lastName: '',
    cnic: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseType: 'PSV',
    experience: '',
    salary: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routesData, vehiclesData, driversData, statsData] = await Promise.all([
        transportService.getAllRoutes(),
        transportService.getAllVehicles(),
        transportService.getAllDrivers(),
        transportService.getTransportStats(),
      ]);
      
      setRoutes(routesData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch transport data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    try {
      await transportService.createRoute(routeFormData);
      toast.success('Route created successfully');
      fetchData();
      setIsModalOpen(false);
      resetForms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating route');
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await transportService.createVehicle(vehicleFormData);
      toast.success('Vehicle added successfully');
      fetchData();
      setIsModalOpen(false);
      resetForms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding vehicle');
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      await transportService.createDriver(driverFormData);
      toast.success('Driver added successfully');
      fetchData();
      setIsModalOpen(false);
      resetForms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding driver');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        if (type === 'route') await transportService.deleteRoute(id);
        else if (type === 'vehicle') await transportService.deleteVehicle(id);
        else if (type === 'driver') await transportService.deleteDriver(id);
        
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
        fetchData();
      } catch (error) {
        toast.error(`Error deleting ${type}`);
      }
    }
  };

  const resetForms = () => {
    setRouteFormData({
      routeName: '',
      startPoint: '',
      endPoint: '',
      departureTime: '',
      monthlyFee: '',
      capacity: 40,
      daysActive: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });
    setVehicleFormData({
      vehicleNumber: '',
      vehicleType: 'Bus',
      manufacturer: '',
      model: '',
      year: new Date().getFullYear(),
      seatingCapacity: 40,
      registrationNumber: '',
      fuelType: 'Diesel',
    });
    setDriverFormData({
      firstName: '',
      lastName: '',
      cnic: '',
      phone: '',
      email: '',
      licenseNumber: '',
      licenseExpiry: '',
      licenseType: 'PSV',
      experience: '',
      salary: '',
    });
  };

  const routeColumns = [
    { header: 'Route ID', accessor: 'routeId' },
    { header: 'Route Name', accessor: 'routeName' },
    {
      header: 'Route',
      accessor: 'route',
      render: (row) => `${row.startPoint} → ${row.endPoint}`,
    },
    { header: 'Departure', accessor: 'departureTime' },
    { header: 'Fee (Monthly)', accessor: 'monthlyFee', render: (row) => `PKR ${row.monthlyFee}` },
    {
      header: 'Students',
      accessor: 'students',
      render: (row) => `${row.students?.length || 0} / ${row.capacity}`,
    },
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
        isAdmin && (
          <button onClick={() => handleDelete(row._id, 'route')} className="text-red-600 hover:text-red-900">
            Delete
          </button>
        )
      ),
    },
  ];

  const vehicleColumns = [
    { header: 'Vehicle ID', accessor: 'vehicleId' },
    { header: 'Number', accessor: 'vehicleNumber' },
    { header: 'Type', accessor: 'vehicleType' },
    {
      header: 'Details',
      accessor: 'details',
      render: (row) => `${row.manufacturer || ''} ${row.model || ''}`.trim() || 'N/A',
    },
    { header: 'Capacity', accessor: 'seatingCapacity' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.status === 'Active' ? 'bg-green-100 text-green-800' :
          row.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
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
        isAdmin && (
          <button onClick={() => handleDelete(row._id, 'vehicle')} className="text-red-600 hover:text-red-900">
            Delete
          </button>
        )
      ),
    },
  ];

  const driverColumns = [
    { header: 'Driver ID', accessor: 'driverId' },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    { header: 'Phone', accessor: 'phone' },
    { header: 'License', accessor: 'licenseNumber' },
    { header: 'Experience', accessor: 'experience', render: (row) => `${row.experience} years` },
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
        isAdmin && (
          <button onClick={() => handleDelete(row._id, 'driver')} className="text-red-600 hover:text-red-900">
            Delete
          </button>
        )
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <TruckIcon className="h-8 w-8 mr-2 text-primary-600" />
              Transport Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage routes, vehicles, and drivers
            </p>
          </div>
          {isAdmin && (
            <Button icon={PlusIcon} onClick={() => setIsModalOpen(true)}>
              Add New {activeTab === 'routes' ? 'Route' : activeTab === 'vehicles' ? 'Vehicle' : 'Driver'}
            </Button>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card title="Total Routes" value={stats.totalRoutes} icon={MapPinIcon} color="blue" />
            <Card title="Vehicles" value={stats.totalVehicles} icon={TruckIcon} color="green" />
            <Card title="Drivers" value={stats.totalDrivers} icon={UserIcon} color="purple" />
            <Card title="Students" value={stats.totalStudents} icon={CheckCircleIcon} color="indigo" />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { key: 'routes', label: 'Routes', icon: MapPinIcon },
                { key: 'vehicles', label: 'Vehicles', icon: TruckIcon },
                { key: 'drivers', label: 'Drivers', icon: UserIcon },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 inline-block mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'routes' && (
              <Table columns={routeColumns} data={routes} loading={loading} />
            )}
            {activeTab === 'vehicles' && (
              <Table columns={vehicleColumns} data={vehicles} loading={loading} />
            )}
            {activeTab === 'drivers' && (
              <Table columns={driverColumns} data={drivers} loading={loading} />
            )}
          </div>
        </div>

        {/* Add Route Modal */}
        {activeTab === 'routes' && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Route">
            <form onSubmit={handleAddRoute} className="space-y-4">
              <Input
                label="Route Name"
                name="routeName"
                value={routeFormData.routeName}
                onChange={(e) => setRouteFormData({ ...routeFormData, routeName: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Point"
                  name="startPoint"
                  value={routeFormData.startPoint}
                  onChange={(e) => setRouteFormData({ ...routeFormData, startPoint: e.target.value })}
                  required
                />
                <Input
                  label="End Point"
                  name="endPoint"
                  value={routeFormData.endPoint}
                  onChange={(e) => setRouteFormData({ ...routeFormData, endPoint: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Departure Time"
                  name="departureTime"
                  type="time"
                  value={routeFormData.departureTime}
                  onChange={(e) => setRouteFormData({ ...routeFormData, departureTime: e.target.value })}
                  required
                />
                <Input
                  label="Monthly Fee (PKR)"
                  name="monthlyFee"
                  type="number"
                  value={routeFormData.monthlyFee}
                  onChange={(e) => setRouteFormData({ ...routeFormData, monthlyFee: e.target.value })}
                  required
                />
                <Input
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={routeFormData.capacity}
                  onChange={(e) => setRouteFormData({ ...routeFormData, capacity: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Route</Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Add Vehicle Modal */}
        {activeTab === 'vehicles' && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Vehicle Number"
                  name="vehicleNumber"
                  value={vehicleFormData.vehicleNumber}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleNumber: e.target.value.toUpperCase() })}
                  placeholder="ABC-123"
                  required
                />
                <Select
                  label="Vehicle Type"
                  name="vehicleType"
                  value={vehicleFormData.vehicleType}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleType: e.target.value })}
                  options={[
                    { value: 'Bus', label: 'Bus' },
                    { value: 'Van', label: 'Van' },
                    { value: 'Mini Bus', label: 'Mini Bus' },
                    { value: 'Car', label: 'Car' },
                  ]}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Manufacturer"
                  name="manufacturer"
                  value={vehicleFormData.manufacturer}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, manufacturer: e.target.value })}
                />
                <Input
                  label="Model"
                  name="model"
                  value={vehicleFormData.model}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, model: e.target.value })}
                />
                <Input
                  label="Year"
                  name="year"
                  type="number"
                  value={vehicleFormData.year}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, year: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Registration Number"
                  name="registrationNumber"
                  value={vehicleFormData.registrationNumber}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, registrationNumber: e.target.value })}
                  required
                />
                <Input
                  label="Seating Capacity"
                  name="seatingCapacity"
                  type="number"
                  value={vehicleFormData.seatingCapacity}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, seatingCapacity: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Vehicle</Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Add Driver Modal */}
        {activeTab === 'drivers' && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Driver">
            <form onSubmit={handleAddDriver} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={driverFormData.firstName}
                  onChange={(e) => setDriverFormData({ ...driverFormData, firstName: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={driverFormData.lastName}
                  onChange={(e) => setDriverFormData({ ...driverFormData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CNIC"
                  name="cnic"
                  value={driverFormData.cnic}
                  onChange={(e) => setDriverFormData({ ...driverFormData, cnic: e.target.value })}
                  placeholder="XXXXX-XXXXXXX-X"
                  required
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={driverFormData.phone}
                  onChange={(e) => setDriverFormData({ ...driverFormData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="License Number"
                  name="licenseNumber"
                  value={driverFormData.licenseNumber}
                  onChange={(e) => setDriverFormData({ ...driverFormData, licenseNumber: e.target.value })}
                  required
                />
                <Input
                  label="License Expiry"
                  name="licenseExpiry"
                  type="date"
                  value={driverFormData.licenseExpiry}
                  onChange={(e) => setDriverFormData({ ...driverFormData, licenseExpiry: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Experience (years)"
                  name="experience"
                  type="number"
                  value={driverFormData.experience}
                  onChange={(e) => setDriverFormData({ ...driverFormData, experience: e.target.value })}
                  required
                />
                <Input
                  label="Salary (PKR)"
                  name="salary"
                  type="number"
                  value={driverFormData.salary}
                  onChange={(e) => setDriverFormData({ ...driverFormData, salary: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Driver</Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default Transport;

