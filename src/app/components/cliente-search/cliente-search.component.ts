import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ClienteSelectionService } from 'src/app/services/cliente-selection.service';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-cliente-search',
  templateUrl: './cliente-search.component.html',
  styleUrls: ['./cliente-search.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClienteSearchComponent),
      multi: true
    }
  ]
})
export class ClienteSearchComponent  implements OnInit, ControlValueAccessor {
  @Input() nombre: string = '';
  @Output() clienteSeleccionado = new EventEmitter<{ id: number, nombre: string }>();

  private _value: any;
  onChange: any = () => {};
  onTouched: any = () => {};

  clientesFiltrados: any[] = [];
  selectedCliente: any = null;
  mostrarListbox: boolean = false;
  searchTimeout: any;

  constructor(
    private clienteService: ClientesService,
    private _auth: AuthService,
    private clienteSelectionService: ClienteSelectionService
  ) { }

  ngOnInit() {
    const clienteSeleccionado = this.clienteSelectionService.getClienteSeleccionado();
    if (clienteSeleccionado) {
      this.writeValue(clienteSeleccionado.id);
      this.nombre = clienteSeleccionado.nombre; // Mostrar el nombre del cliente
    }
  }


  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  writeValue(value: any) {
    this._value = value;
    if (value) {
      const cliente = this.clientesFiltrados.find(c => c.id === value);
      if (cliente) {
        this.selectedCliente = cliente;
        this.nombre = cliente.nombre;
      }
    } else {
      this.nombre = '';
      this.selectedCliente = null;
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {

  }

  buscarCliente(query: string) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      if (query.length >= 3) {
        this.mostrarListbox = true;
        const idUsuarioRegistro = this._auth.getUser().Id;

        const data = {
          tipoClienteLista: 0,
          nombre: query || "",
          idPlanta: 0
        };

        this.clienteService.getClienteFiltrado(idUsuarioRegistro, data).subscribe(
          (response: any) => {
            if (!response.error) {
              this.clientesFiltrados = response.result;
              console.log('clientesFiltrados:', this.clientesFiltrados);

              if (this._value) {
                const cliente = this.clientesFiltrados.find(c => c.id === this._value);
                if (cliente) {
                  this.selectedCliente = cliente;
                  this.nombre = cliente.nombre;
                }
              }
            } else {
              this.clientesFiltrados = [];
            }
          },
          (error) => {
            console.error('Error al buscar clientes', error);
            this.clientesFiltrados = [];
          }
        );
      } else {
        this.mostrarListbox = false;
        this.clientesFiltrados = [];
      }
    }, 1000); 
  }

  onClienteSelect(event: any) {
    const clienteSeleccionado = event.value;
    if (clienteSeleccionado && clienteSeleccionado.id) {
      this.value = clienteSeleccionado.id;
      this.nombre = clienteSeleccionado.nombre;
      this.clienteSeleccionado.emit(clienteSeleccionado);
      this.clienteSelectionService.setClienteSeleccionado(clienteSeleccionado); // Actualizar el servicio
      console.log('Cliente seleccionado y emitido:', clienteSeleccionado);
      this.mostrarListbox = false; 
    } else {
      console.error('El cliente seleccionado no tiene un id o nombre válido:', clienteSeleccionado);
    }
  }

  limpiarSeleccion() {
    this.nombre = '';
    this.mostrarListbox = false;
  }


}
