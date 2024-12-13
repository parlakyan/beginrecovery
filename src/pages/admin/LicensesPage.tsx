import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { licensesService } from '../../services/licenses';
import { License } from '../../types';
import AdminLogoUpload from '../../components/AdminLogoUpload';
import { AdminEntryCard } from '../../components/ui';

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: ''
  });

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const data = await licensesService.getLicenses();
      setLicenses(data);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingLicense(null);
    setFormData({ name: '', description: '', logo: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const license = licenses.find(l => l.id === id);
    if (license) {
      setEditingLicense(license);
      setFormData({
        name: license.name,
        description: license.description,
        logo: license.logo || ''
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this license?')) return;
    
    try {
      await licensesService.deleteLicense(id);
      await fetchLicenses();
    } catch (error) {
      console.error('Error deleting license:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLicense) {
        await licensesService.updateLicense(editingLicense.id, formData);
      } else {
        await licensesService.addLicense(formData);
      }
      await fetchLicenses();
      setIsModalOpen(false);
      setFormData({ name: '', description: '', logo: '' });
    } catch (error) {
      console.error('Error saving license:', error);
    }
  };

  const handleLogoUpload = (url: string) => {
    setFormData(prev => ({ ...prev, logo: url }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Licenses</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add License
        </button>
      </div>

      {/* Licenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {licenses.map((license) => (
          <AdminEntryCard
            key={license.id}
            id={license.id}
            name={license.name}
            description={license.description}
            logo={license.logo}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[calc(100vh-100px)] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingLicense ? 'Edit License' : 'Add License'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo
                </label>
                <AdminLogoUpload
                  currentLogo={formData.logo}
                  onUpload={handleLogoUpload}
                  folder="licenses"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
