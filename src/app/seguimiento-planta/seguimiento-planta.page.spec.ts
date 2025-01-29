import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeguimientoPlantaPage } from './seguimiento-planta.page';

describe('SeguimientoPlantaPage', () => {
  let component: SeguimientoPlantaPage;
  let fixture: ComponentFixture<SeguimientoPlantaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SeguimientoPlantaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
