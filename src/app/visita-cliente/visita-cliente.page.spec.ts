import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisitaClientePage } from './visita-cliente.page';

describe('VisitaClientePage', () => {
  let component: VisitaClientePage;
  let fixture: ComponentFixture<VisitaClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitaClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
