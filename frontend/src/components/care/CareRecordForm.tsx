import React, { useState } from 'react';
import { CareType } from '../../types/care';
import type { CareRecordRequest } from '../../types/care';

interface CareRecordFormProps {
  animalId: number;
  animalName: string;
  onSubmit: (careRecord: CareRecordRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CareRecordForm: React.FC<CareRecordFormProps> = ({
  animalName,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CareRecordRequest>({
    careType: CareType.FEEDING,
    careDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.description.trim()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CareRecordRequest, value: string | CareType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Record Care Activity
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Recording care for <span className="font-medium">{animalName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Care Type */}
        <div>
          <label htmlFor="careType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Care Type *
          </label>
          <select
            id="careType"
            value={formData.careType}
            onChange={(e) => handleInputChange('careType', e.target.value as CareType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value={CareType.FEEDING}>Feeding</option>
            <option value={CareType.VACCINATION}>Vaccination</option>
            <option value={CareType.STERILIZATION}>Sterilization</option>
            <option value={CareType.MEDICAL_TREATMENT}>Medical Treatment</option>
            <option value={CareType.GROOMING}>Grooming</option>
            <option value={CareType.CHECKUP}>Checkup</option>
          </select>
        </div>

        {/* Care Date */}
        <div>
          <label htmlFor="careDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Care Date *
          </label>
          <input
            type="date"
            id="careDate"
            value={formData.careDate}
            onChange={(e) => handleInputChange('careDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            placeholder="Describe the care activity performed..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.description.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recording...
              </div>
            ) : (
              'Record Care'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}; 