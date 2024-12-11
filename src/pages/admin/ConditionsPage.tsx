import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { conditionsService } from '../../services/conditions';
import { Condition } from '../../types';
import AdminLogoUpload from '../../components/AdminLogoUpload';
import { AdminEntryCard } from '../../components/ui';

export default function ConditionsPage() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCondition, setEditingCondition] = useState<Condition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: ''
  });

  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      setLoading(true);
      const data = await conditionsService.getConditions();
      setConditions(data);
    } catch (error) {
      console.error('Error fetching conditions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCondition(null);
    setFormData({ name: '', description: '', logo: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const condition = conditions.find(c => c.id === id);
    if (condition) {
      setEditingCondition(condition);
      setFormData({
        name: condition.name,
        description: condition.description,
        logo: condition.logo || ''
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this condition?')) return;
    
    try {
      await conditionsService.deleteCondition(id);
      await fetchConditions();
    } catch (error) {
      console.error('Error deleting condition:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCondition) {
        await conditionsService.updateCondition(editingCondition.id, formData);
      } else {
        await conditionsService.addCondition(formData);
      }
      await fetchConditions();
      setIsModalOpen(false);
      setFormData({ name: '', description: '', logo: '' });
    } catch (error) {
      console.error('Error saving condition:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Conditions</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Condition
        </button>
      </div>

      {/* Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conditions.map((condition) => (
          <AdminEntryCard
            key={condition.id}
            id={condition.id}
            name={condition.name}
            description={condition.description}
            logo={condition.logo}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingCondition ? 'Edit Condition' : 'Add Condition'}
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
                  folder="conditions"
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
