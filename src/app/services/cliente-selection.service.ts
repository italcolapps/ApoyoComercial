import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteSelectionService {
  private clienteSeleccionadoSubject = new BehaviorSubject<{ id: number; nombre: string } | null>(null);

  clienteSeleccionado$ = this.clienteSeleccionadoSubject.asObservable();

  setClienteSeleccionado(cliente: { id: number; nombre: string }) {
    this.clienteSeleccionadoSubject.next(cliente);
  }

  getClienteSeleccionado() {
    return this.clienteSeleccionadoSubject.value;
  }

  clearSelection() {
    this.clienteSeleccionadoSubject.next(null);
  }
}
