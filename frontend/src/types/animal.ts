export interface Animal {
  id: string;
  uniqueIdentifier: string;
  name?: string;
  species: 'DOG' | 'CAT' | 'BIRD' | 'OTHER';
  breed: string;
  color: string;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  age?: number;
  temperament: 'FRIENDLY' | 'SHY' | 'AGGRESSIVE' | 'NEUTRAL' | 'PLAYFUL' | 'CALM' | 'CRITICAL';
  healthStatus: 'HEALTHY' | 'SICK' | 'INJURED' | 'RECOVERING' | 'CRITICAL';
  isVaccinated?: boolean;
  isSterilized?: boolean;
  isNeutered?: boolean; // Add missing property
  description?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  reportedBy: string | { id: string; name: string; email: string }; // Allow both string and object
  reportedAt?: string; // Add missing property
  createdAt: string;
  updatedAt: string;
  lastSeenAt?: string;
  imageUrls?: string[];
  images?: string[]; // For backward compatibility
  locations?: AnimalLocation[];
  location?: Location; // For backward compatibility
  tags?: string[]; // Add missing property
}

export interface AnimalLocation {
  id?: string;
  latitude: number;
  longitude: number;
  address: string;
  area: string;
  city: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface Location {
  id?: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  state?: string;
  area?: string;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PUBLIC_USER' | 'VOLUNTEER' | 'ADMIN';
}

export interface AnimalListResponse {
  content: Animal[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  page?: number; // Add missing property
}

export interface AnimalStats {
  totalAnimals: number;
  approvedAnimals: number;
  pendingAnimals: number;
  rejectedAnimals: number;
  dogsCount: number;
  catsCount: number;
  otherCount: number;
}

export interface AnimalFilters {
  species?: string[];
  gender?: string;
  healthStatus?: string[];
  area?: string;
  search?: string;
  status?: string;
  page?: number;
  size?: number;
  age?: string[]; // Add missing property
  isNeutered?: boolean; // Add missing property
  isVaccinated?: boolean; // Add missing property
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export interface CreateAnimalRequest {
  species: 'DOG' | 'CAT' | 'BIRD' | 'OTHER';
  breed: string;
  color: string;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  age?: number;
  healthStatus: 'HEALTHY' | 'SICK' | 'INJURED' | 'RECOVERING' | 'CRITICAL';
  temperament: 'FRIENDLY' | 'SHY' | 'AGGRESSIVE' | 'NEUTRAL' | 'PLAYFUL' | 'CALM';
  isVaccinated?: boolean;
  isSterilized?: boolean;
  description?: string;
  images: File[];
  location: {
    address: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };
}

export interface UpdateAnimalRequest {
  id: string;
  species?: 'DOG' | 'CAT' | 'BIRD' | 'OTHER';
  breed?: string;
  color?: string;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  age?: number;
  healthStatus?: 'HEALTHY' | 'SICK' | 'INJURED' | 'RECOVERING' | 'CRITICAL';
  temperament?: 'FRIENDLY' | 'SHY' | 'AGGRESSIVE' | 'NEUTRAL' | 'PLAYFUL' | 'CALM';
  isVaccinated?: boolean;
  isSterilized?: boolean;
  description?: string;
  images?: File[];
  location?: {
    address: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };
}

export interface CareLog {
  id: string;
  type: 'FEEDING' | 'VACCINATION' | 'STERILIZATION' | 'MEDICAL' | 'OTHER';
  description: string;
  performedBy: {
    id: string;
    name: string;
  };
  performedAt: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  attachments?: string[];
}

export interface CommunityLog {
  id: string;
  type: 'SIGHTING' | 'FEEDING' | 'HEALTH_UPDATE' | 'BEHAVIOR' | 'OTHER';
  title: string;
  description: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  upvotes: number;
  isUpvoted: boolean;
} 