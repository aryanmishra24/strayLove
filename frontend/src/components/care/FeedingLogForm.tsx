import React, { useState } from 'react';
import type { FeedingLogRequest } from '../../types/care';

interface FeedingLogFormProps {
  animalId: number;
  animalName: string;
  onSubmit: (feedingLog: FeedingLogRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const FeedingLogForm: React.FC<FeedingLogFormProps> = ({
  animalName,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FeedingLogRequest>({
    feedingTime: new Date().toISOString().slice(0, 16), // Current datetime in YYYY-MM-DDTHH:MM format
    foodType: '',
    quantity: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.foodType.trim() && formData.quantity.trim()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof FeedingLogRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Log Feeding Activity
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Logging feeding for <span className="font-medium">{animalName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Feeding Time */}
        <div>
          <label htmlFor="feedingTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Feeding Time *
          </label>
          <input
            type="datetime-local"
            id="feedingTime"
            value={formData.feedingTime}
            onChange={(e) => handleInputChange('feedingTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Food Type */}
        <div>
          <label htmlFor="foodType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Food Type *
          </label>
          <input
            type="text"
            id="foodType"
            value={formData.foodType}
            onChange={(e) => handleInputChange('foodType', e.target.value)}
            placeholder="e.g., Dry kibble, Wet food, Raw meat, etc."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            required
          />
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quantity *
          </label>
          <input
            type="text"
            id="quantity"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            placeholder="e.g., 1 cup, 200g, 1 can, etc."
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
            disabled={isLoading || !formData.foodType.trim() || !formData.quantity.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging...
              </div>
            ) : (
              'Log Feeding'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}; 