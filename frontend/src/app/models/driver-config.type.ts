export type VehicleType = 'combustion' | 'electric';

export interface DriverConfig {
  vehicleType: VehicleType;
  vehicleInstallment: number;
  insurance: number;
  ipva: number;
  daysWorked: number;
  estimatedKm: number;
  desiredSalary: number;
  fuelPrice: number;
  fuelConsumption: number;
  batteryCapacity: number;
  totalAutonomy: number;
  kwhPrice: number;
  gasolinePrice: number;
  reviewCost: number;
  reviewInterval: number;
  tireCost: number;
  tireLongevity: number;
  maintenanceReserve: number;
}

export interface DailyCosts {
  dailyInstallment: number;
  dailyInsurance: number;
  dailyIpva: number;
  dailyPerKm: number;
  totalDaily: number;
}

export interface FixedCostPerKm {
  monthlyTotal: number;
  costPerKm: number;
}

export interface VariableCostsPerKm {
  fuelCostPerKm: number;
  reviewCostPerKm: number;
  tireCostPerKm: number;
  maintenanceCostPerKm: number;
  totalVariableCostPerKm: number;
  kmPerLiterEquivalent?: number;
}

export interface CombinedCosts {
  fixedCostPerKm: number;
  variableCostPerKm: number;
  totalCostPerKm: number;
}
