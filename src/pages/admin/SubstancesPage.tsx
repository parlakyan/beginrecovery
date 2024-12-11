import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { substancesService } from '../../services/substances';
import { Substance } from '../../types';
import AdminLogoUpload from '../../components/AdminLogoUpload';

export default function SubstancesPage() {
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubstance, setEditingSubstance] = useState<Substance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: ''
  });

  useEffect(() => {
    fetchSubstances();
  }, []);

  const fetchSubstances = async () => {
    try {
      setLoading(true);
      const data = await substancesService.getSubstances();
      setSubstances(data);
    } catch (error) {
      console.error('Error fetching substances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSubstance(null);
    setFormData({ name: '', description: '', logo: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (substance: Substance) => {
    setEditingSubstance(substance);
    setFormData({
      name: substance.name,
      description: substance.description,
      logo: substance.logo
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this substance?')) return;
    
    try {
      await substancesService.deleteSubstance(id);
      await fetchSubstances();
    } catch (error) {
      console.error('Error deleting substance:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubstance) {
        await substancesService.updateSubstance(editingSubstance.id, formData);
      } else {
        await substancesService.addSubstance(formData);
      }
      setIsModalOpen(false);
      await fetchSubstances();
    } catch (error) {
      console.error('Error saving substance:', error);
    }
  };

  const handleLogoUpload = (url: string) => {
    setFormData(prev => ({ ...prev, logo: url }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Substances</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Substance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {substances.map(substance => (
          <div key={substance.id} className="bg-white rounded-lg shadow-md p-6">
            {substance.logo && (
              <img
                src={substance.logo}
                alt={substance.name}
                className="w-16 h-16 object-contain mb-4"
              />
            )}
            <h3 className="text-lg font-semibold mb-2">{substance.name}</h3>
            <p className="text-gray-600 mb-4">{substance.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(substance)}
                className="text-blue-600 hover:text-blue-700 p-2"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(substance.id)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingSubstance ? 'Edit' : 'Add'} Substance
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Logo</label>
                <AdminLogoUpload
                  currentLogo={formData.logo}
                  onUpload={handleLogoUpload}
                  folder="substances"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
