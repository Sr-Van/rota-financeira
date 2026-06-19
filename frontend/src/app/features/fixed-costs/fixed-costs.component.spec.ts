import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedCostsComponent } from './fixed-costs.component';

describe('FixedCostsComponent', () => {
  let component: FixedCostsComponent;
  let fixture: ComponentFixture<FixedCostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedCostsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FixedCostsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
