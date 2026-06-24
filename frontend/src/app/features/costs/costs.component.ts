import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';
import { ToastService } from '../../shared/toast/toast.service';
import {
  DriverConfig,
  DailyCosts,
  FixedCostPerKm,
  VariableCostsPerKm,
  CombinedCosts,
  VehicleType,
} from '../../models/driver-config.type';

@Component({
  selector: 'app-costs',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './costs.component.html',
})
export class CostsComponent {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);

  form: FormGroup;
  dailyCosts: DailyCosts | null = null;
  fixedCostPerKm: FixedCostPerKm | null = null;
  variableCostsPerKm: VariableCostsPerKm | null = null;
  combinedCosts: CombinedCosts | null = null;

  showResults = false;
  minimumGainPerKm: number | null = null;
  idealGainPerKm: number | null = null;

  readonly fuelLabel: Record<VehicleType, string> = {
    combustion: 'Combustivel/km',
    electric: 'Energia/km',
  };

  constructor() {
    const saved = this.transactionService.getConfig();
    const vehicleType: VehicleType = saved?.vehicleType ?? 'combustion';

    this.form = this.fb.group({
      vehicleType: [vehicleType, Validators.required],
      vehicleInstallment: [saved?.vehicleInstallment ?? '', [Validators.required, Validators.min(0.01)]],
      insurance: [saved?.insurance ?? '', [Validators.required, Validators.min(0.01)]],
      ipva: [saved?.ipva ?? '', [Validators.required, Validators.min(0.01)]],
      daysWorked: [saved?.daysWorked ?? '', [Validators.required, Validators.min(1), Validators.max(31)]],
      estimatedKm: [saved?.estimatedKm ?? '', [Validators.required, Validators.min(1)]],
      desiredSalary: [saved?.desiredSalary ?? '', [Validators.required, Validators.min(0.01)]],
      fuelPrice: [saved?.fuelPrice ?? '', [Validators.required, Validators.min(0.01)]],
      fuelConsumption: [saved?.fuelConsumption ?? '', [Validators.required, Validators.min(0.1)]],
      batteryCapacity: [saved?.batteryCapacity ?? '', [Validators.required, Validators.min(0.1)]],
      totalAutonomy: [saved?.totalAutonomy ?? '', [Validators.required, Validators.min(1)]],
      kwhPrice: [saved?.kwhPrice ?? '', [Validators.required, Validators.min(0.01)]],
      gasolinePrice: [saved?.gasolinePrice ?? '', [Validators.required, Validators.min(0.01)]],
      reviewCost: [saved?.reviewCost ?? '', [Validators.required, Validators.min(0.01)]],
      reviewInterval: [saved?.reviewInterval ?? 10000, [Validators.required, Validators.min(1)]],
      tireCost: [saved?.tireCost ?? '', [Validators.required, Validators.min(0.01)]],
      tireLongevity: [saved?.tireLongevity ?? 60000, [Validators.required, Validators.min(1)]],
      maintenanceReserve: [saved?.maintenanceReserve ?? '', [Validators.required, Validators.min(0.01)]],
    });

    this.syncValidators(vehicleType);

    if (saved) {
      this.calculateResults(saved);
    }

    this.form.valueChanges.subscribe(() => this.onFormChange());
  }

  get vehicleType(): VehicleType {
    return this.form.get('vehicleType')?.value ?? 'combustion';
  }

  onVehicleTypeChange(): void {
    this.syncValidators(this.vehicleType);
    this.showResults = false;
    this.onFormChange();
  }

  setVehicleType(type: VehicleType): void {
    this.form.patchValue({ vehicleType: type });
    this.onVehicleTypeChange();
  }

  private syncValidators(type: VehicleType): void {
    const fuelPriceCtrl = this.form.get('fuelPrice');
    const fuelConsumptionCtrl = this.form.get('fuelConsumption');
    const batteryCapacityCtrl = this.form.get('batteryCapacity');
    const totalAutonomyCtrl = this.form.get('totalAutonomy');
    const kwhPriceCtrl = this.form.get('kwhPrice');
    const gasolinePriceCtrl = this.form.get('gasolinePrice');

    if (type === 'combustion') {
      fuelPriceCtrl?.setValidators([Validators.required, Validators.min(0.01)]);
      fuelConsumptionCtrl?.setValidators([Validators.required, Validators.min(0.1)]);
      batteryCapacityCtrl?.clearValidators();
      totalAutonomyCtrl?.clearValidators();
      kwhPriceCtrl?.clearValidators();
      gasolinePriceCtrl?.clearValidators();
    } else {
      fuelPriceCtrl?.clearValidators();
      fuelConsumptionCtrl?.clearValidators();
      batteryCapacityCtrl?.setValidators([Validators.required, Validators.min(0.1)]);
      totalAutonomyCtrl?.setValidators([Validators.required, Validators.min(1)]);
      kwhPriceCtrl?.setValidators([Validators.required, Validators.min(0.01)]);
      gasolinePriceCtrl?.setValidators([Validators.required, Validators.min(0.01)]);
    }

    fuelPriceCtrl?.updateValueAndValidity();
    fuelConsumptionCtrl?.updateValueAndValidity();
    batteryCapacityCtrl?.updateValueAndValidity();
    totalAutonomyCtrl?.updateValueAndValidity();
    kwhPriceCtrl?.updateValueAndValidity();
    gasolinePriceCtrl?.updateValueAndValidity();
  }

  private buildConfig(): DriverConfig {
    const raw = this.form.getRawValue();
    return {
      vehicleType: raw.vehicleType,
      vehicleInstallment: Number(raw.vehicleInstallment),
      insurance: Number(raw.insurance),
      ipva: Number(raw.ipva),
      daysWorked: Number(raw.daysWorked),
      estimatedKm: Number(raw.estimatedKm),
      desiredSalary: Number(raw.desiredSalary),
      fuelPrice: Number(raw.fuelPrice || 0),
      fuelConsumption: Number(raw.fuelConsumption || 0),
      batteryCapacity: Number(raw.batteryCapacity || 0),
      totalAutonomy: Number(raw.totalAutonomy || 0),
      kwhPrice: Number(raw.kwhPrice || 0),
      gasolinePrice: Number(raw.gasolinePrice || 0),
      reviewCost: Number(raw.reviewCost),
      reviewInterval: Number(raw.reviewInterval),
      tireCost: Number(raw.tireCost),
      tireLongevity: Number(raw.tireLongevity),
      maintenanceReserve: Number(raw.maintenanceReserve),
    };
  }

  private onFormChange(): void {
    if (this.form.valid) {
      const config = this.buildConfig();
      this.calculateResults(config);
    } else {
      this.dailyCosts = null;
      this.fixedCostPerKm = null;
      this.variableCostsPerKm = null;
      this.combinedCosts = null;
    }
  }

  private calculateResults(config: DriverConfig): void {
    this.dailyCosts = this.transactionService.calculateDailyCosts(config);
    this.fixedCostPerKm = this.transactionService.calculateFixedCostPerKm(config);
    this.variableCostsPerKm = this.transactionService.calculateVariableCostsPerKm(config);
    this.combinedCosts = this.transactionService.calculateCombinedCosts(this.fixedCostPerKm, this.variableCostsPerKm);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const config = this.buildConfig();
    this.transactionService.saveConfig(config);
    this.toastService.show('Configuracoes salvas com sucesso.');
  }

  generateKmIdeal(): void {
    if (!this.combinedCosts) return;

    const total = this.combinedCosts.totalCostPerKm;
    this.minimumGainPerKm = this.transactionService.calculateMinimumGainPerKm(total);
    this.idealGainPerKm = this.transactionService.calculateIdealGainPerKm(total);
    this.showResults = true;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
