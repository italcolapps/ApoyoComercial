import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeguimientoStateService {
  private selectedSeguimientoIdSource = new BehaviorSubject<number | null>(null);
  selectedSeguimientoId$ = this.selectedSeguimientoIdSource.asObservable();

  private selectedSeguimientoSource = new BehaviorSubject<any>(null);
  selectedSeguimiento$ = this.selectedSeguimientoSource.asObservable();

  constructor() { }

  setSeguimientoId(id: number) {
    this.selectedSeguimientoIdSource.next(id);
  }

  setSeguimiento(seguimiento: any) {
    this.selectedSeguimientoSource.next(seguimiento);
  }

  clearSeguimientoId() {
    this.selectedSeguimientoIdSource.next(null);
  }

  clearSeguimiento() {
    this.selectedSeguimientoSource.next(null);
  }

  clearAll() {
    this.clearSeguimientoId();
    this.clearSeguimiento();
  }
}
