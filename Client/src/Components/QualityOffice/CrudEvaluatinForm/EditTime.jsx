import { Edit, Save, X, Calendar } from 'lucide-react';
import React, { useState } from 'react';
import axios from '@/Lib/Axios';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';

const EditTime = ({ evaluation, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    semester: ''
  });

  if (!evaluation) {
    return null;
  }

  const handleEdit = () => {
    setFormData({
      startDate: evaluation.startDate ? new Date(evaluation.startDate).toISOString().split('T')[0] : '',
      endDate: evaluation.endDate ? new Date(evaluation.endDate).toISOString().split('T')[0] : '',
      semester: evaluation.semester || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      startDate: '',
      endDate: '',
      semester: ''
    });
  };

  const handleSave = async () => {
    // Validate all fields
    if (!formData.startDate || !formData.endDate || !formData.semester) {
      toast.error('All fields are required');
      return;
    }

    // Validate dates - use string comparison to avoid timezone issues
    if (formData.endDate <= formData.startDate) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.patch(`/evaluation/${evaluation._id}`, formData);

      if (response.data.success) {
        toast.success('Evaluation updated successfully');
        setIsEditing(false);

        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error('Error updating evaluation:', error);
      toast.error(error.response?.data?.message || 'Failed to update evaluation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-6 p-6 border-t">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Evaluation Schedule</h3>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 cursor-pointer text-green-600 hover:bg-green-50 text-[15px] rounded-md transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Schedule
          </button>
        )}
      </div>

      <div className={`border rounded-lg p-6 ${isEditing ? 'border-green-700 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-green-900 rounded-sm"
                  style={{ fontSize: 15 }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3  py-2 border border-green-900 rounded-sm"
                  style={{ fontSize: 15 }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <Select
                value={formData.semester}
                onValueChange={(value) => setFormData({ ...formData, semester: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semester I">Semester I</SelectItem>
                  <SelectItem value="Semester II">Semester II</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || !formData.startDate || !formData.endDate || !formData.semester}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="text-[15px]" />
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Start Date
              </p>
              <p className="text-sm font-semibold text-gray-900 ">
                {formatDate(evaluation.startDate)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                End Date
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(evaluation.endDate)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Semester</p>
              <p className="text-sm font-semibold text-gray-900">
                {evaluation.semester}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTime;
