import { Injectable } from '@angular/core';
import {
  DriverConfig,
  DailyCosts,
  FixedCostPerKm,
  VariableCostsPerKm,
  CombinedCosts,
} from '../../models/driver-config.type';
import { round } from '../utils/number.utils';

@Injectable({ providedIn: 'root' })
export class CostCalculationService {
  calculateDailyCosts(config: DriverConfig): DailyCosts {
    const dailyInstallment = round(config.vehicleInstallment / config.daysWorked);
    const dailyInsurance = round(config.insurance / config.daysWorked);
    const dailyIpva = round(config.ipva / 12 / config.daysWorked);
    const totalDaily = round(dailyInstallment + dailyInsurance + dailyIpva);
    const dailyPerKm = round(totalDaily / (config.estimatedKm / config.daysWorked));
    return { dailyInstallment, dailyInsurance, dailyIpva, totalDaily, dailyPerKm };
  }

  calculateFixedCostPerKm(config: DriverConfig): FixedCostPerKm {
    const monthlyTotal = round(config.vehicleInstallment + config.insurance + config.ipva / 12);
    const costPerKm = round(monthlyTotal / config.estimatedKm);
    return { monthlyTotal, costPerKm };
  }

  calculateVariableCostsPerKm(config: DriverConfig): VariableCostsPerKm {
    let fuelCostPerKm: number;
    let kmPerLiterEquivalent: number | undefined;

    if (config.vehicleType === 'electric') {
      fuelCostPerKm = round((config.batteryCapacity / config.totalAutonomy) * config.kwhPrice);
      kmPerLiterEquivalent = this.calculateKmPerLiterEquivalent(fuelCostPerKm, config.gasolinePrice);
    } else {
      fuelCostPerKm = round(config.fuelPrice / config.fuelConsumption);
    }

    const reviewCostPerKm = round(config.reviewCost / config.reviewInterval);
    const tireCostPerKm = round(config.tireCost / config.tireLongevity);
    const maintenanceCostPerKm = round(config.maintenanceReserve / config.estimatedKm);
    const totalVariableCostPerKm = round(
      fuelCostPerKm + reviewCostPerKm + tireCostPerKm + maintenanceCostPerKm,
    );
    return {
      fuelCostPerKm,
      reviewCostPerKm,
      tireCostPerKm,
      maintenanceCostPerKm,
      totalVariableCostPerKm,
      ...(kmPerLiterEquivalent !== undefined && { kmPerLiterEquivalent }),
    };
  }

  calculateKmPerLiterEquivalent(fuelCostPerKm: number, gasolinePrice: number): number {
    if (!gasolinePrice || gasolinePrice <= 0) return 0;
    const costPer100km = fuelCostPerKm * 100;
    const equivalentLiters = costPer100km / gasolinePrice;
    if (equivalentLiters <= 0) return 0;
    return round(100 / equivalentLiters);
  }

  calculateCombinedCosts(fixed: FixedCostPerKm, variable: VariableCostsPerKm): CombinedCosts {
    return {
      fixedCostPerKm: fixed.costPerKm,
      variableCostPerKm: variable.totalVariableCostPerKm,
      totalCostPerKm: round(fixed.costPerKm + variable.totalVariableCostPerKm),
    };
  }

  calculateMinimumGainPerKm(totalCostPerKm: number): number {
    return round(totalCostPerKm / 0.5);
  }

  calculateIdealGainPerKm(totalCostPerKm: number): number {
    return round(totalCostPerKm / 0.4);
  }
}
