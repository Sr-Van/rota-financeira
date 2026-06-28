export type DailyCloseFilter = 'day' | 'week' | 'month' | 'year';

export interface DailyClose {
  id: string;
  date: string;
  totalEarnings: number;
  kmDriven: number;
  hoursWorked: number;
  rideCount: number;
  fuelCost: number;
  vehicleConsumption: number;
  createdAt: string;
}
