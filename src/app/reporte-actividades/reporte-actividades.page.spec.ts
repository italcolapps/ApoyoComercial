import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReporteActividadesPage } from './reporte-actividades.page';

describe('ReporteActividadesPage', () => {
  let component: ReporteActividadesPage;
  let fixture: ComponentFixture<ReporteActividadesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteActividadesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
