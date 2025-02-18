import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuSeguimientoPage } from './menu-seguimiento.page';

describe('MenuSeguimientoPage', () => {
  let component: MenuSeguimientoPage;
  let fixture: ComponentFixture<MenuSeguimientoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuSeguimientoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
