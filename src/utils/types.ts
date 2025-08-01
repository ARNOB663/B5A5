export enum UserRole {
  ADMIN = 'admin',
  RIDER = 'rider',
  DRIVER = 'driver'
}

export enum RideStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum DriverStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy'
}

export enum DriverApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SUSPENDED = 'suspended'
}

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
