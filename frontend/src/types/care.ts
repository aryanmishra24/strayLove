export const CareType = {
  VACCINATION: 'VACCINATION',
  STERILIZATION: 'STERILIZATION',
  FEEDING: 'FEEDING',
  MEDICAL_TREATMENT: 'MEDICAL_TREATMENT',
  GROOMING: 'GROOMING',
  CHECKUP: 'CHECKUP'
} as const;

export type CareType = typeof CareType[keyof typeof CareType];

export interface CareRecord {
  id: number;
  animalId: number;
  animalName: string;
  animalSpecies: string;
  careType: CareType;
  careDate: string; // ISO date string
  description: string;
  performedById: number;
  performedByName: string;
  performedByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedingLog {
  id: number;
  animalId: number;
  animalName: string;
  animalSpecies: string;
  feedingTime: string; // ISO datetime string
  foodType: string;
  quantity: string;
  fedById: number;
  fedByName: string;
  fedByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareRecordRequest {
  careType: CareType;
  careDate: string; // ISO date string
  description: string;
}

export interface FeedingLogRequest {
  feedingTime: string; // ISO datetime string
  foodType: string;
  quantity: string;
}

export interface CareRecordResponse {
  id: number;
  animalId: number;
  animalName: string;
  animalSpecies: string;
  careType: CareType;
  careDate: string;
  description: string;
  performedById: number;
  performedByName: string;
  performedByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedingLogResponse {
  id: number;
  animalId: number;
  animalName: string;
  animalSpecies: string;
  feedingTime: string;
  foodType: string;
  quantity: string;
  fedById: number;
  fedByName: string;
  fedByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareStatistics {
  totalCareRecords: number;
  totalFeedingLogs: number;
  careRecordsThisMonth: number;
  feedingLogsThisMonth: number;
  mostActiveVolunteer: {
    id: number;
    name: string;
    careCount: number;
  };
  animalsWithMostCare: Array<{
    id: number;
    name: string;
    careCount: number;
  }>;
}

export interface CareFilters {
  animalId?: number;
  volunteerId?: number;
  careType?: CareType;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
} 