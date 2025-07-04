export interface CommunityLog {
  id: number;
  animalId: number;
  animalName: string;
  animalSpecies: string;
  loggedById: number;
  loggedByName: string;
  loggedByEmail: string;
  logType: LogType;
  description: string;
  urgencyLevel: UrgencyLevel;
  upvoteCount: number;
  createdAt: string;
  isUpvotedByCurrentUser: boolean;
}

export interface CreateCommunityLogRequest {
  logType?: LogType;
  description?: string;
  urgencyLevel?: UrgencyLevel;
}

export const LogType = {
  SIGHTING: 'SIGHTING',
  CONCERN: 'CONCERN',
  UPDATE: 'UPDATE',
  ALERT: 'ALERT',
  FEEDING: 'FEEDING',
  CARE: 'CARE',
  ADOPTION: 'ADOPTION',
  OTHER: 'OTHER'
} as const;

export type LogType = typeof LogType[keyof typeof LogType];

export const UrgencyLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export type UrgencyLevel = typeof UrgencyLevel[keyof typeof UrgencyLevel];

export interface CommunityLogFilters {
  logType?: LogType;
  urgencyLevel?: UrgencyLevel;
  page?: number;
  size?: number;
}

export const LOG_TYPE_LABELS: Record<LogType, string> = {
  [LogType.SIGHTING]: 'Sighting',
  [LogType.CONCERN]: 'Concern',
  [LogType.UPDATE]: 'Update',
  [LogType.ALERT]: 'Alert',
  [LogType.FEEDING]: 'Feeding',
  [LogType.CARE]: 'Care',
  [LogType.ADOPTION]: 'Adoption',
  [LogType.OTHER]: 'Other'
};

export const URGENCY_LEVEL_LABELS: Record<UrgencyLevel, string> = {
  [UrgencyLevel.LOW]: 'Low',
  [UrgencyLevel.MEDIUM]: 'Medium',
  [UrgencyLevel.HIGH]: 'High',
  [UrgencyLevel.CRITICAL]: 'Critical'
};

export const URGENCY_LEVEL_COLORS: Record<UrgencyLevel, string> = {
  [UrgencyLevel.LOW]: 'text-green-600 bg-green-100',
  [UrgencyLevel.MEDIUM]: 'text-yellow-600 bg-yellow-100',
  [UrgencyLevel.HIGH]: 'text-orange-600 bg-orange-100',
  [UrgencyLevel.CRITICAL]: 'text-red-600 bg-red-100'
};

export const LOG_TYPE_ICONS: Record<LogType, string> = {
  [LogType.SIGHTING]: '👁️',
  [LogType.CONCERN]: '⚠️',
  [LogType.UPDATE]: '📝',
  [LogType.ALERT]: '🚨',
  [LogType.FEEDING]: '🍽️',
  [LogType.CARE]: '💊',
  [LogType.ADOPTION]: '🏠',
  [LogType.OTHER]: '📋'
}; 