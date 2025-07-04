import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, User, Clock, AlertTriangle } from 'lucide-react';
import type { CommunityLog } from '../../types/community';
import { LOG_TYPE_LABELS, URGENCY_LEVEL_LABELS, URGENCY_LEVEL_COLORS, LOG_TYPE_ICONS } from '../../types/community';
import Button from '../common/Button';

interface CommunityLogCardProps {
  log: CommunityLog;
  onUpvote: (logId: number) => void;
  showAnimalInfo?: boolean;
}

const CommunityLogCard: React.FC<CommunityLogCardProps> = ({ 
  log, 
  onUpvote, 
  showAnimalInfo = false 
}) => {
  const handleUpvote = () => {
    onUpvote(log.id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{LOG_TYPE_ICONS[log.logType]}</span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {LOG_TYPE_LABELS[log.logType]}
            </h4>
            {showAnimalInfo && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {log.animalName} ({log.animalSpecies})
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${URGENCY_LEVEL_COLORS[log.urgencyLevel]}`}>
            {URGENCY_LEVEL_LABELS[log.urgencyLevel]}
          </span>
          {log.urgencyLevel === 'CRITICAL' && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {log.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{log.loggedByName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUpvote}
          disabled={log.isUpvotedByCurrentUser}
          className={`flex items-center space-x-1 ${
            log.isUpvotedByCurrentUser 
              ? 'bg-blue-50 text-blue-600 border-blue-200' 
              : 'hover:bg-gray-50'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${log.isUpvotedByCurrentUser ? 'fill-current' : ''}`} />
          <span>{log.upvoteCount}</span>
        </Button>
      </div>
    </div>
  );
};

export default CommunityLogCard; 