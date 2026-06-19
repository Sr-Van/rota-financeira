import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { ToastService } from '../../shared/toast/toast.service';
import { DriverConfig, DailyCosts, FixedCostPerKm, VariableCostsPerKm, CombinedCosts } from '../../models/driver-config.type';

@Component({
  selector: 'app-costs',
  standalone: true,
  imports: [ReactiveFormsModule],
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

  constructor() {
    const saved = this.transactionService.getConfig();
    this.form = this.fb.group({
      vehicleInstallment: [saved?.vehicleInstallment ?? '', [Validators.required, Validators.min(0.01)]],
      insurance: [saved?.insurance ?? '', [Validators.required, Validators.min(0.01)]],
      ipva: [saved?.ipva ?? '', [Validators.required, Validators.min(0.01)]],
      daysWorked: [saved?.daysWorked ?? '', [Validators.required, Validators.min(1), Validators.max(31)]],
      estimatedKm: [saved?.estimatedKm ?? '', [Validators.required, Validators.min(1)]],
      desiredSalary: [saved?.desiredSalary ?? '', [Validators.required, Validators.min(0.01)]],
      fuelPrice: [saved?.fuelPrice ?? '', [Validators.required, Validators.min(0.01)]],
      fuelConsumption: [saved?.fuelConsumption ?? '', [Validators.required, Validators.min(0.1)]],
      reviewCost: [saved?.reviewCost ?? '', [Validators.required, Validators.min(0.01)]],
      reviewInterval: [saved?.reviewInterval ?? 10000, [Validators.required, Validators.min(1)]],
      tireCost: [saved?.tireCost ?? '', [Validators.required, Validators.min(0.01)]],
      tireLongevity: [saved?.tireLongevity ?? 60000, [Validators.required, Validators.min(1)]],
      maintenanceReserve: [saved?.maintenanceReserve ?? '', [Validators.required, Validators.min(0.01)]],
    });

    if (saved) {
      this.calculateResults(saved);
    }

    this.form.valueChanges.subscribe(() => this.onFormChange());
  }

  private buildConfig(): DriverConfig {
    const raw = this.form.getRawValue();
    return {
      vehicleInstallment: Number(raw.vehicleInstallment),
      insurance: Number(raw.insurance),
      ipva: Number(raw.ipva),
      daysWorked: Number(raw.daysWorked),
      estimatedKm: Number(raw.estimatedKm),
      desiredSalary: Number(raw.desiredSalary),
      fuelPrice: Number(raw.fuelPrice),
      fuelConsumption: Number(raw.fuelConsumption),
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

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
