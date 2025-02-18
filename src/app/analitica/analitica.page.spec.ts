import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnaliticaPage } from './analitica.page';

describe('AnaliticaPage', () => {
  let component: AnaliticaPage;
  let fixture: ComponentFixture<AnaliticaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnaliticaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
