import { Component, inject, Input, booleanAttribute } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { SettingsService } from '../../core/services/settings.service';
import { CostCalculationService } from '../../core/services/cost-calculation.service';
import { DailyCloseService } from '../../core/services/daily-close.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Router, RouterLink } from '@angular/router';
import { DailyCosts } from '../../models/driver-config.type';

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './entry-form.component.html',
})
export class EntryFormComponent {
  @Input({ transform: booleanAttribute }) embedded = false;

  private settingsService = inject(SettingsService);
  private costCalculation = inject(CostCalculationService);
  private dailyCloseService = inject(DailyCloseService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  form;

  today = new Date().toISOString().split('T')[0];
  dailyFixedCosts: DailyCosts | null = null;
  hasConfig = false;

  constructor(
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      date: [this.today, [Validators.required]],
      totalEarnings: ['', [Validators.required, Validators.min(0)]],
      kmDriven: ['', [Validators.required, Validators.min(0)]],
      hoursWorked: ['', [Validators.required, Validators.min(0)]],
      rideCount: ['', [Validators.required, Validators.min(0)]],
      fuelCost: ['', [Validators.required, Validators.min(0)]],
      vehicleConsumption: ['', [Validators.required, Validators.min(0)]],
      dailyInstallment: [{ value: '', disabled: true }],
      dailyInsurance: [{ value: '', disabled: true }],
      dailyIpva: [{ value: '', disabled: true }],
    });

    this.loadFixedCosts();
  }

  private loadFixedCosts(): void {
    const config = this.settingsService.getConfig();
    if (!config) {
      this.hasConfig = false;
      return;
    }

    this.hasConfig = true;
    this.dailyFixedCosts = this.costCalculation.calculateDailyCosts(config);

    const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    this.form.patchValue({
      dailyInstallment: fmt(this.dailyFixedCosts.dailyInstallment),
      dailyInsurance: fmt(this.dailyFixedCosts.dailyInsurance),
      dailyIpva: fmt(this.dailyFixedCosts.dailyIpva),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const date = raw.date ?? '';
    const totalEarnings = parseFloat(raw.totalEarnings ?? '0');
    const fuelCost = parseFloat(raw.fuelCost ?? '0');
    const kmDriven = parseFloat(raw.kmDriven ?? '0');
    const hoursWorked = parseFloat(raw.hoursWorked ?? '0');
    const rideCount = parseFloat(raw.rideCount ?? '0');
    const vehicleConsumption = parseFloat(raw.vehicleConsumption ?? '0');

    this.dailyCloseService.save({
      date,
      totalEarnings,
      kmDriven,
      hoursWorked,
      rideCount,
      fuelCost,
      vehicleConsumption,
    });

    this.form.reset({ date: this.today });
    this.loadFixedCosts();
    this.toastService.show('Fechamento diario salvo com sucesso.');
    this.router.navigate(['/dashboard']);
  }
}
