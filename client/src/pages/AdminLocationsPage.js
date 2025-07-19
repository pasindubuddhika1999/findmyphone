import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AdminLocationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('districts');
  const [districts, setDistricts] = useState([]);
  const [towns, setTowns] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [districtName, setDistrictName] = useState('');
  const [townName, setTownName] = useState('');
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [editingTown, setEditingTown] = useState(null);

  // Fetch districts
  const fetchDistricts = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminDistricts();
      setDistricts(response.data);
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to load districts');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch towns
  const fetchTowns = async (districtId = '') => {
    setIsLoading(true);
    try {
      const response = await api.getAdminTowns(districtId);
      setTowns(response.data);
    } catch (error) {
      console.error('Error fetching towns:', error);
      toast.error('Failed to load towns');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchDistricts();
  }, []);

  // When district selection changes
  useEffect(() => {
    if (activeTab === 'towns') {
      fetchTowns(selectedDistrict);
    }
  }, [selectedDistrict, activeTab]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'districts') {
      fetchDistricts();
    } else if (tab === 'towns') {
      fetchTowns(selectedDistrict);
    }
  };

  // District form handlers
  const handleDistrictSubmit = async (e) => {
    e.preventDefault();
    if (!districtName.trim()) {
      toast.error('District name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDistrict) {
        // Update existing district
        await api.updateDistrict(editingDistrict._id, { name: districtName });
        toast.success('District updated successfully');
      } else {
        // Create new district
        await api.createDistrict({ name: districtName });
        toast.success('District added successfully');
      }
      setDistrictName('');
      setEditingDistrict(null);
      fetchDistricts();
    } catch (error) {
      console.error('Error saving district:', error);
      toast.error(error.response?.data?.message || 'Failed to save district');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDistrict = (district) => {
    setEditingDistrict(district);
    setDistrictName(district.name);
  };

  const handleDeleteDistrict = async (id) => {
    if (!window.confirm('Are you sure you want to delete this district? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteDistrict(id);
      toast.success('District deleted successfully');
      fetchDistricts();
    } catch (error) {
      console.error('Error deleting district:', error);
      toast.error(error.response?.data?.message || 'Failed to delete district');
    }
  };

  // Town form handlers
  const handleTownSubmit = async (e) => {
    e.preventDefault();
    if (!townName.trim()) {
      toast.error('Town name is required');
      return;
    }

    if (!selectedDistrict && !editingTown) {
      toast.error('Please select a district');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTown) {
        // Update existing town
        await api.updateTown(editingTown._id, { 
          name: townName,
          districtId: selectedDistrict || editingTown.district._id
        });
        toast.success('Town updated successfully');
      } else {
        // Create new town
        await api.createTown({ 
          name: townName,
          districtId: selectedDistrict
        });
        toast.success('Town added successfully');
      }
      setTownName('');
      setEditingTown(null);
      fetchTowns(selectedDistrict);
    } catch (error) {
      console.error('Error saving town:', error);
      toast.error(error.response?.data?.message || 'Failed to save town');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTown = (town) => {
    setEditingTown(town);
    setTownName(town.name);
    setSelectedDistrict(town.district._id);
  };

  const handleDeleteTown = async (id) => {
    if (!window.confirm('Are you sure you want to delete this town? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteTown(id);
      toast.success('Town deleted successfully');
      fetchTowns(selectedDistrict);
    } catch (error) {
      console.error('Error deleting town:', error);
      toast.error(error.response?.data?.message || 'Failed to delete town');
    }
  };

  // Cancel form editing
  const handleCancelEdit = () => {
    if (activeTab === 'districts') {
      setEditingDistrict(null);
      setDistrictName('');
    } else {
      setEditingTown(null);
      setTownName('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Location Management</h1>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'districts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => handleTabChange('districts')}
        >
          Districts
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'towns' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => handleTabChange('towns')}
        >
          Towns
        </button>
      </div>

      {/* Districts Tab Content */}
      {activeTab === 'districts' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingDistrict ? 'Edit District' : 'Add New District'}
            </h2>
            <form onSubmit={handleDistrictSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="districtName">
                  District Name
                </label>
                <input
                  type="text"
                  id="districtName"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter district name"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {isSubmitting ? 'Saving...' : (editingDistrict ? 'Update District' : 'Add District')}
                </button>
                {editingDistrict && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-semibold p-6 bg-gray-50 border-b">Districts List</h2>
            {isLoading ? (
              <div className="p-6 text-center">Loading districts...</div>
            ) : districts.length === 0 ? (
              <div className="p-6 text-center">No districts found. Add your first district above.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {districts.map((district) => (
                      <tr key={district._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{district.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${district.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {district.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditDistrict(district)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDistrict(district._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Towns Tab Content */}
      {activeTab === 'towns' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingTown ? 'Edit Town' : 'Add New Town'}
            </h2>
            <form onSubmit={handleTownSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="districtSelect">
                  Select District
                </label>
                <select
                  id="districtSelect"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select a district</option>
                  {districts.map((district) => (
                    <option key={district._id} value={district._id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="townName">
                  Town Name
                </label>
                <input
                  type="text"
                  id="townName"
                  value={townName}
                  onChange={(e) => setTownName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter town name"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {isSubmitting ? 'Saving...' : (editingTown ? 'Update Town' : 'Add Town')}
                </button>
                {editingTown && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-semibold p-6 bg-gray-50 border-b">
              Towns List {selectedDistrict && `(${districts.find(d => d._id === selectedDistrict)?.name || ''})`}
            </h2>
            {isLoading ? (
              <div className="p-6 text-center">Loading towns...</div>
            ) : towns.length === 0 ? (
              <div className="p-6 text-center">
                {selectedDistrict 
                  ? 'No towns found for this district. Add your first town above.' 
                  : 'Please select a district to view towns.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        District
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {towns.map((town) => (
                      <tr key={town._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{town.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{town.district.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${town.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {town.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditTown(town)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTown(town._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLocationsPage; 