import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDestinationsPage } from './admin-destinations.page';

describe('AdminDestinationsPage', () => {
  let component: AdminDestinationsPage;
  let fixture: ComponentFixture<AdminDestinationsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDestinationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
