import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OportunidadesPage } from './oportunidades.page';

describe('OportunidadesPage', () => {
  let component: OportunidadesPage;
  let fixture: ComponentFixture<OportunidadesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OportunidadesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
