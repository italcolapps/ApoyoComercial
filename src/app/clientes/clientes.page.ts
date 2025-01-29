import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { ListasService } from '../services/listas.service';
import { AlertsService } from '../services/alerts.service';
import { UsuariosService } from '../services/usuarios.service';
import { AuthService } from '../services/auth.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { Listas } from '../interfaces/listas';
import { ClientesService } from '../services/clientes.service';
import { GerenteZonaService } from '../services/gerente-zona.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit, OnDestroy {

  displayModal = false;
  selectedLinea: any = null;

  listaTipoDocumento: any = [];
  listaTipoCliente: any = [];
  listaTipoCanal: any = [];
  listaClientes: any = [];
  listaGerenteZona: any[] = [];
  listaLineas: any = [];
  listaZonas: any = [];
  listaPais: any = [];
  listaDepartamento: any = [];
  listaMuncipio: any = [];

  subscriptions: Subscription[] = [];
  edit = false;
  idCliente: number;
  idGerenteZona: number;
  loading = false;

  ClienteForm: FormGroup;
  GerenteZonaForm: FormGroup;

  items: any[];
  activeItem: any;

  constructor(
    private fb: FormBuilder,
    private _clientesService: ClientesService,
    private _listasService: ListasService,
    private _alert: AlertsService,
    private _usuarioService: UsuariosService,
    private _auth: AuthService,
    private _confirmDialog: ConfirmDialogService,
    private _chRef: ChangeDetectorRef,
    private _gerenteZonaService: GerenteZonaService
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadInitialData();
    this.initializeTabMenu();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeTabMenu() {
    this.items = [
      {
        id: 'clientes',
        label: 'Clientes',
        icon: 'pi pi-users'
      },
      {
        id: 'gerentesZona',
        label: 'Gerentes de Zona',
        icon: 'pi pi-user-edit'
      }
    ];
    this.activeItem = this.items[0]; // Selecciona el primer tab por defecto
  }

  onActiveItemChange(event: any) {
    this.activeItem = event;
  }

  private initForm() {

    this.ClienteForm = this.fb.group({
      idUsuarioRegistro: [0],
      tipoClienteLista: [0, Validators.required],
      idTipoDocumentoLista: [0, Validators.required],
      numDocumento: ['', Validators.required],
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      linea: [[], Validators.required],
      canallista: [0, Validators.required],
      idPais: [0, Validators.required],
      idDepartamento: [0, Validators.required],
      idMunicipio: [0, Validators.required]
    });

    this.GerenteZonaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      idTipoDocumento: [0, Validators.required],
      numDocumento: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      idZona: [0, Validators.required],
      idLinea: [0, Validators.required],
      idUsuarioRegistro: [0]
    });
  }

  onLineaChange(event: any) {
    if (event.value) {
      this.selectedLinea = event.value;
      if (this.activeItem.id === 'clientes') {
        this.loadClientesByLinea(event.value.id);
      } else if (this.activeItem.id === 'gerentesZona') {
        this.loadGerenteZona(event.value.id);
      }
    } else {
      this.listaClientes = [];
      this.listaGerenteZona = [];
    }
  }

  private loadInitialData() {
    this.loadData(this._listasService.getListas(Listas.tipoDocumento), 'listaTipoDocumento');
    this.loadData(this._listasService.getListas(Listas.tipoCliente), 'listaTipoCliente');
    this.loadData(this._listasService.getListas(Listas.tipoCanal), 'listaTipoCanal');
    this.loadData(this._listasService.getListaLineas(), 'listaLineas');
    this.loadData(this._listasService.getListaZonas(), 'listaZonas');
    this.getPais();
  }

  private loadData(observable: any, propertyName: string, detectChanges: boolean = false) {
    const subscription = observable.subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this[propertyName] = data.result;
          if (detectChanges) {
            this._chRef.detectChanges();
          }
        }
      },
      error: (err) => {
        console.error(`Error al cargar ${propertyName}: ${err}`);
      }
    });
    this.subscriptions.push(subscription);
  }

  getPais() {
    const subscription = this._listasService.getListaPais().subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaPais = data.result;
        }
      },
      error: (err) => {
        console.error(`Error al cargar países: ${err}`);
      }
    });
    this.subscriptions.push(subscription);
  }

  getDepartamento(event: any) {
    const idPais = this.edit ? event : event.value;
    const subscription = this._listasService.getListaDepartamento(idPais).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaDepartamento = data.result;
          this._chRef.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error al cargar departamentos: ${err}`);
      }
    });
    this.subscriptions.push(subscription);
  }

  getMunicipio(event: any) {
    const idDepartamento = this.edit ? event : event.value;
    const subscription = this._listasService.getListaMunicipio(idDepartamento).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaMuncipio = data.result;
          this._chRef.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error al cargar municipios: ${err}`);
      }
    });
    this.subscriptions.push(subscription);
  }

  private loadClientesByLinea(idLinea: number) {
    this.loading = true;
    const subscription = this._clientesService.getClienteByIdLinea(idLinea).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaClientes = data.result;
          console.log(this.listaClientes);
          this._chRef.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error al cargar clientes: ${err}`);
        this.loading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  
  private loadGerenteZona(idLinea: number) {
    this.loading = true;
    const subscription = this._gerenteZonaService.getGerenteZonaByIdLinea(idLinea).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaGerenteZona = data.result.map((gerente: any) => ({
            ...gerente,
            nombreCompleto: `${gerente.nombre} ${gerente.apellido}`
          }));
          console.log("GZ",this.listaGerenteZona);
          this._chRef.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error al cargar Gerentes de zona: ${err}`);
        this.loading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  showModal() {
    this.displayModal = true;
  }

  closeModal() {
    this.displayModal = false;
    this.edit = false;
    this.ClienteForm.reset();
  }

  RegistrarCliente() {
    this.edit = false;
    if (this.ClienteForm.valid) {
      this._confirmDialog.showSaveConfirm('cliente').subscribe(confirmed => {
        if (confirmed) {
          const data = this.ClienteForm.value;
          data.idUsuarioRegistro = this._auth.getUser().Id;
          
          this._clientesService.createCliente(data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Cliente Creado con Éxito", "success");
                this.ClienteForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                if (this.selectedLinea) {
                  this.loadClientesByLinea(this.selectedLinea.id);
                }
              }
            },
            error: (err) => {
              console.error(`Error al registrar cliente: ${err}`);
              this._alert.presentToast("top", "Error al crear el cliente", "error");
            }
          });
        }
      });
    }
  }

  RegistrarGerenteZona() {
    this.edit = false;
    if (this.GerenteZonaForm.valid) {
      this._confirmDialog.showSaveConfirm('Gerente de Zona').subscribe(confirmed => {
        if (confirmed) {
          const data = this.GerenteZonaForm.value;
          data.idUsuarioRegistro = this._auth.getUser().Id;
          
          this._gerenteZonaService.createGerenteZona(data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Gerente de Zona Creado con Éxito", "success");
                this.GerenteZonaForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                if (this.selectedLinea) {
                  this.loadGerenteZona(this.selectedLinea.id);
                }
              }
            },
            error: (err) => {
              console.error(`Error al registrar Gerente de Zona: ${err}`);
              this._alert.presentToast("top", "Error al crear el Gerente de Zona", "error");
            }
          });
        }
      });
    }
  }

  editarCliente(cliente: any) {
    this.edit = true;
    this.idCliente = cliente.id;
    const subscription = this._clientesService.getCliente(this.idCliente).subscribe({
      next: (data: any) => {
        if (data.error) {
          this._alert.presentToast("top", data.message, "warning");
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          const clienteSeleccionado = data.result;
          console.log(clienteSeleccionado);
          if (clienteSeleccionado) {
            this.displayModal = true;
            this.ClienteForm.patchValue({
              tipoClienteLista: clienteSeleccionado.tipoClienteLista,
              idTipoDocumentoLista: clienteSeleccionado.idTipoDocumentoLista,
              numDocumento: clienteSeleccionado.numDocumento,
              nombre: clienteSeleccionado.nombre,
              telefono: clienteSeleccionado.telefono,
              email: clienteSeleccionado.email,
              direccion: clienteSeleccionado.direccion,
              linea: clienteSeleccionado.lineas.map((linea: any) => linea.id),
              canallista: clienteSeleccionado.canallista,
              idPais: clienteSeleccionado.idPais,
              idDepartamento: clienteSeleccionado.idDepartamento,
              idMunicipio: clienteSeleccionado.idMunicipio
            });
            if (clienteSeleccionado && clienteSeleccionado.idPais) {
              this.getDepartamento(clienteSeleccionado.idPais);
              if (clienteSeleccionado.idDepartamento) {
                this.getMunicipio(clienteSeleccionado.idDepartamento);
              }
              this._chRef.detectChanges();
            }
          }
        }
      },
      error: (err) => {
        console.error(`Error al cargar datos del cliente: ${err}`);
        this._alert.presentToast("top", "Error al cargar los datos del cliente", "error");
      }
    });
    this.subscriptions.push(subscription);
  }

  editarGerenteZona(gerenteZona: any) {
    this.edit = true;
    this.idGerenteZona = gerenteZona.id;
    const gerenteZonaSeleccionado = this.listaGerenteZona.find(gz => gz.id === this.idGerenteZona);

    if (gerenteZonaSeleccionado) {
      this.displayModal = true;
      this.GerenteZonaForm.patchValue({
        idTipoDocumento: gerenteZonaSeleccionado.idTipoDocumentoLista,
        numDocumento: gerenteZonaSeleccionado.numDocumento,
        nombre: gerenteZonaSeleccionado.nombre,
        apellido: gerenteZonaSeleccionado.apellido,
        telefono: gerenteZonaSeleccionado.telefono,
        email: gerenteZonaSeleccionado.email,
        idLinea: this.selectedLinea.id,
        idZona: gerenteZonaSeleccionado.idZona
      });
      this._chRef.detectChanges();
    }
  }

  actualizarCliente() {
    if (this.ClienteForm.valid) {
      this._confirmDialog.showUpdateConfirm('cliente').subscribe(confirmed => {
        if (confirmed) {
          const data = this.ClienteForm.value;
          data.idUsuarioRegistro = this._auth.getUser().id;
          
          this._clientesService.updateCliente(this.idCliente, data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Cliente Actualizado con Éxito", "success");
                this.ClienteForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                if (this.selectedLinea) {
                  this.loadClientesByLinea(this.selectedLinea.id);
                }
              }
            },
            error: (err) => {
              console.error(`Error al actualizar cliente: ${err}`);
              this._alert.presentToast("top", "Error al actualizar el cliente", "error");
            }
          });
        }
      });
    }
  }

  actualizarGerenteZona() {
    if (this.GerenteZonaForm.valid) {
      this._confirmDialog.showUpdateConfirm('Gerente de Zona').subscribe(confirmed => {
        if (confirmed) {
          const data = this.GerenteZonaForm.value;
          data.idUsuarioRegistro = this._auth.getUser().id;
          
          this._gerenteZonaService.updateGerenteZona(this.idGerenteZona, data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Gerente de Zona Actualizado con Éxito", "success");
                this.GerenteZonaForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                if (this.selectedLinea) {
                  this.loadGerenteZona(this.selectedLinea.id);
                }
              }
            },
            error: (err) => {
              console.error(`Error al actualizar Gerente de Zona: ${err}`);
              this._alert.presentToast("top", "Error al actualizar el Gerente de Zona", "error");
            }
          });
        }    
      });
    }
  } 


}
