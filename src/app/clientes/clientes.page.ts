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
import { ClienteFiltro } from '../interfaces/cliente';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit, OnDestroy {

  displayModal = false;
  selectedLinea: any[] = [];
  selectedPlanta: any[] = [];

  listaTipoDocumento: any = [];
  listaTipoCliente: any = [];
  listaTipoCanal: any = [];
  listaClientes: any = [];
  listaGerenteZona: any[] = [];
  listaLineas: any = [];
  listaPlantas: any = [];
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

  filtroClienteForm:FormGroup = this.fb.group({
    tipoClienteLista: [0],
    nombre: [''],
    idLinea: [0],
  });

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

  private hayAlgunaCondicionDeFiltro(): boolean {
    const filtros = this.filtroClienteForm.getRawValue(); 
    return Object.keys(filtros).some(key => {
      const valor = filtros[key];
      return valor !== 0 && valor !== '' && valor !== null;
    });
  }

  buscarClientes() {
    if (!this.hayAlgunaCondicionDeFiltro()) {
      this.mostrarAdvertenciaSinFiltros();
      return;
    }
    const usuarioActual = this._auth.getUser().Id;
    const formValues = this.filtroClienteForm.getRawValue();
    const filtro: ClienteFiltro = {
      tipoClienteLista: formValues.tipoClienteLista?.id || 0,
      nombre: formValues.nombre,
      idLinea: formValues.idLinea?.id || 0
    };
    console.log(filtro);
    this._clientesService.getClienteFiltrado(usuarioActual, filtro).subscribe((data: any) => {
      this.manejarRespuestaClientes(data);
    });
  }
  
  private mostrarAdvertenciaSinFiltros() {
    console.warn('Debe utilizar al menos un criterio de búsqueda');
    this._alert.presentToast("top", 'Debe utilizar al menos un criterio de búsqueda', "error");
  }

  private manejarRespuestaClientes(data: any) {
    if (data.error) {
      console.error(`Error:${data.message} - code: ${data.codError} - ${data.result}`);
    } else {
      this.listaClientes = data.result;
      console.log('listaClientes con nombres de planta:', this.listaClientes);
    }
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
      idUsuarioRegistro: [0],
      planta: [[], Validators.required],
    });
  }

  onLineaChange(event: any) {
    if (event.value && event.value.length > 0) {
      const lineaIds = event.value.map((linea: any) => linea.id);
      this.loadGerenteZona(lineaIds);
    } else {
      this.listaGerenteZona = [];
      this._chRef.detectChanges();
    }
  }

    onPlantaChange(event:any){
      if (event.value) {
        this.loadGerenteZona(event.value.id);
      }else{
        this.listaGerenteZona = [];
      }
    }

  private loadInitialData() {
    this.loadData(this._listasService.getListas(Listas.tipoDocumento), 'listaTipoDocumento');
    this.loadData(this._listasService.getListas(Listas.tipoCliente), 'listaTipoCliente');
    this.loadData(this._listasService.getListas(Listas.tipoCanal), 'listaTipoCanal');
    this.loadData(this._listasService.getListaLineas(), 'listaLineas');
    this.loadData(this._listasService.getListaPlantas(), 'listaPlantas');
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

  private loadGerenteZona(idPlanta: number) {
    this.loading = true;
    const subscription = this._gerenteZonaService.getGerenteZonaByIdPlanta(idPlanta).subscribe({
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
        console.error('Error:', err);
        this.loading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  private loadClientesByLinea(lineaIds: number[]) {
    this.loading = true;
    const subscription = this._clientesService.getClienteByIdLinea(lineaIds).subscribe({
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

  showModal() {
    this.displayModal = true;
  }

  closeModal() {
    this.displayModal = false;
    this.edit = false;
    this.ClienteForm.reset();
  }

  RegistrarCliente() {
    if (this.ClienteForm.valid) {
      this._confirmDialog.showSaveConfirm('Cliente').subscribe(confirmed => {
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
                if (this.selectedLinea && this.selectedLinea.length > 0) {
                  const lineaIds = this.selectedLinea.map((linea: any) => linea.id);
                  this.loadClientesByLinea(lineaIds);
                }
              }
            },
            error: (err) => {
              this._alert.presentToast("top", err, "warning");
            }
          });
        }
      });
    }
  }

  RegistrarGerenteZona() {
    if (this.GerenteZonaForm.valid) {
      this._confirmDialog.showSaveConfirm('Gerente de Zona').subscribe(confirmed => {
        if (confirmed) {
          const data = this.GerenteZonaForm.value;
          data.idUsuarioRegistro = this._auth.getUser().Id;
          console.log(data);
          this._gerenteZonaService.createGerenteZona(data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", `Error: ${x.message} - code: ${x.codError}`, "error");
              } else {
                this._alert.presentToast("top", "Gerente de Zona creado con éxito", "success");
                const selectedPlantas = this.GerenteZonaForm.get('planta').value;
                if (selectedPlantas && selectedPlantas.length > 0) {
                  const lastPlantaId = selectedPlantas[selectedPlantas.length - 1];
                  this.loadGerenteZona(lastPlantaId);
                }
                this.GerenteZonaForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
              }
            },
            error: (err) => {
              this._alert.presentToast("top", err, "warning");
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
    console.log(gerenteZonaSeleccionado);
    if (gerenteZonaSeleccionado) {
      this.displayModal = true;
      this.GerenteZonaForm.patchValue({
        idTipoDocumento: gerenteZonaSeleccionado.idTipoDocumentoLista,
        numDocumento: gerenteZonaSeleccionado.numDocumento,
        nombre: gerenteZonaSeleccionado.nombre,
        apellido: gerenteZonaSeleccionado.apellido,
        telefono: gerenteZonaSeleccionado.telefono,
        email: gerenteZonaSeleccionado.email,
        planta: gerenteZonaSeleccionado.plantasAsociadas ? gerenteZonaSeleccionado.plantasAsociadas.map((p: any) => p.idPlanta) : [],
        idZona: gerenteZonaSeleccionado.idZona
      });
      this._chRef.detectChanges();
    }
  }

  actualizarCliente() {
    if (this.ClienteForm.valid) {
      this._confirmDialog.showSaveConfirm('Cliente').subscribe(confirmed => {
        if (confirmed) {
          const data = this.ClienteForm.value;
          delete data.idUsuarioRegistro;
          data.idCliente = this.idCliente;
          this._clientesService.updateCliente(this.idCliente, data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Cliente Actualizado con Éxito", "success");
                this.ClienteForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                if (this.selectedLinea && this.selectedLinea.length > 0) {
                  const lineaIds = this.selectedLinea.map((linea: any) => linea.id);
                  this.loadClientesByLinea(lineaIds);
                }
              }
            },
            error: (err) => {
              this._alert.presentToast("top", err, "warning");
            }
          });
        }
      });
    }
  }

  actualizarGerenteZona() {
    if (this.GerenteZonaForm.valid) {
      this._confirmDialog.showSaveConfirm('Gerente de Zona').subscribe(confirmed => {
        if (confirmed) {
          const data = this.GerenteZonaForm.value;
          delete data.idUsuarioRegistro;
          data.idGerenteZona = this.idGerenteZona;
          this._gerenteZonaService.updateGerenteZona(this.idGerenteZona, data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Gerente de Zona Actualizado con Éxito", "success");
                this.GerenteZonaForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                this.loadGerenteZona(data.p);
              }
            },
            error: (err) => {
              this._alert.presentToast("top", err, "warning");
            }
          });
        }
      });
    }
  } 


}
