import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../context/ToastContext';

const SchoolProfile = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    schoolName: '',
    shortName: '',
    establishedYear: '',
    schoolCode: '',
    email: '',
    phone: '',
    alternatePhone: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Pakistan',
    },
    primaryColor: '#0369a1',
    secondaryColor: '#3b82f6',
    vision: '',
    mission: '',
    description: '',
    principal: {
      name: '',
      email: '',
      phone: '',
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await settingsService.getSchoolProfile();
      const data = response.data;
      setProfile(data);
      setFormData({
        schoolName: data.schoolName || '',
        shortName: data.shortName || '',
        establishedYear: data.establishedYear || '',
        schoolCode: data.schoolCode || '',
        email: data.email || '',
        phone: data.phone || '',
        alternatePhone: data.alternatePhone || '',
        website: data.website || '',
        address: data.address || { street: '', city: '', state: '', zipCode: '', country: 'Pakistan' },
        primaryColor: data.primaryColor || '#0369a1',
        secondaryColor: data.secondaryColor || '#3b82f6',
        vision: data.vision || '',
        mission: data.mission || '',
        description: data.description || '',
        principal: data.principal || { name: '', email: '', phone: '' },
        socialMedia: data.socialMedia || { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSchoolProfile(formData);
      toast.success('School profile updated successfully');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage school information and branding
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BuildingLibraryIcon className="h-5 w-5 mr-2" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="School Name"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Short Name"
                name="shortName"
                value={formData.shortName}
                onChange={handleInputChange}
              />
              <Input
                label="School Code"
                name="schoolCode"
                value={formData.schoolCode}
                onChange={handleInputChange}
              />
              <Input
                label="Established Year"
                name="establishedYear"
                type="number"
                value={formData.establishedYear}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Alternate Phone"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleInputChange}
              />
              <Input
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Address */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                />
              </div>
              <Input
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
              />
              <Input
                label="State"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
              />
              <Input
                label="Zip Code"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
              />
              <Input
                label="Country"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  className="h-10 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <input
                  type="color"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleInputChange}
                  className="h-10 w-full rounded"
                />
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About School</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vision</label>
                <textarea
                  name="vision"
                  value={formData.vision}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="School's vision statement..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
                <textarea
                  name="mission"
                  value={formData.mission}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="School's mission statement..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="About the school..."
                />
              </div>
            </div>
          </div>

          {/* Principal */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Principal/Head</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Name"
                name="principal.name"
                value={formData.principal.name}
                onChange={handleInputChange}
              />
              <Input
                label="Email"
                name="principal.email"
                type="email"
                value={formData.principal.email}
                onChange={handleInputChange}
              />
              <Input
                label="Phone"
                name="principal.phone"
                value={formData.principal.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Facebook"
                name="socialMedia.facebook"
                value={formData.socialMedia.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/..."
              />
              <Input
                label="Twitter"
                name="socialMedia.twitter"
                value={formData.socialMedia.twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/..."
              />
              <Input
                label="Instagram"
                name="socialMedia.instagram"
                value={formData.socialMedia.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/..."
              />
              <Input
                label="LinkedIn"
                name="socialMedia.linkedin"
                value={formData.socialMedia.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/..."
              />
              <Input
                label="YouTube"
                name="socialMedia.youtube"
                value={formData.socialMedia.youtube}
                onChange={handleInputChange}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SchoolProfile;

