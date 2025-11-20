import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTripsPage } from './admin-trips.page';

describe('AdminTripsPage', () => {
  let component: AdminTripsPage;
  let fixture: ComponentFixture<AdminTripsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTripsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
