import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';
import type { CreateCommunityLogRequest } from '../../types/community';
import { LogType, UrgencyLevel, LOG_TYPE_LABELS, URGENCY_LEVEL_LABELS } from '../../types/community';
import Button from '../common/Button';

const addCommunityLogSchema = z.object({
  logType: z.nativeEnum(LogType, {
    required_error: 'Please select a log type',
  }),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  urgencyLevel: z.nativeEnum(UrgencyLevel, {
    required_error: 'Please select urgency level',
  }),
});

interface AddCommunityLogFormProps {
  animalId: number;
  onSubmit: (data: CreateCommunityLogRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AddCommunityLogForm: React.FC<AddCommunityLogFormProps> = ({
  animalId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateCommunityLogRequest>({
    resolver: zodResolver(addCommunityLogSchema),
    mode: 'onChange',
  });

  const handleFormSubmit = (data: CreateCommunityLogRequest) => {
    onSubmit(data);
    reset();
    setIsOpen(false);
  };

  const handleCancel = () => {
    reset();
    setIsOpen(false);
    onCancel();
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="primary"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add Community Log</span>
      </Button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Add Community Log
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Log Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Log Type *
          </label>
          <select
            {...register('logType')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select log type</option>
            {Object.entries(LOG_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.logType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.logType.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Describe what you observed or want to share about this animal..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Urgency Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Urgency Level *
          </label>
          <select
            {...register('urgencyLevel')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select urgency level</option>
            {Object.entries(URGENCY_LEVEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.urgencyLevel && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.urgencyLevel.message}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Log'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCommunityLogForm; 