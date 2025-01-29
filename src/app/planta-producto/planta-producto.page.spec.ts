import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlantaProductoPage } from './planta-producto.page';

describe('PlantaProductoPage', () => {
  let component: PlantaProductoPage;
  let fixture: ComponentFixture<PlantaProductoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantaProductoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
