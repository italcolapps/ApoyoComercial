import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VisitaClientesService } from '../services/visita-clientes.service';
import { ListasService } from '../services/listas.service';
import { AlertsService } from '../services/alerts.service';
import { AuthService } from '../services/auth.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { Listas } from '../interfaces/listas';
import { Subscription } from 'rxjs';
import { ClientesService } from '../services/clientes.service';
import { SeguimientoPlantaService } from '../services/seguimiento-planta.service';
import { GerenteZonaService } from '../services/gerente-zona.service';

@Component({
  selector: 'app-visita-cliente',
  templateUrl: './visita-cliente.page.html',
  styleUrls: ['./visita-cliente.page.scss'],
})
export class VisitaClientePage implements OnInit, OnDestroy {
  displayModal: boolean = false;
  selectedLinea: any = null;
  selectedCliente: any = null;
  listaClientes: any[] = []; 
  listaVisitaClientes: any[] = []; 
  listaSegPlantas: any[] = [];
  listaGerenteZona: any[] = [];
  listaFrecuencia: any[] = []; 
  frecuenciaOptions: any[] = [];
  listaLineas: any[] = [];

  edit = false;
  idVisitaCliente = 0;
  loading = false;

  subscriptions: Subscription[] = [];
  VisitaClientesForm: FormGroup

  constructor(
    private _formBuilder: FormBuilder,
    private _seguimientoVisitaService: VisitaClientesService,
    private _listasService: ListasService,
    private _chRef: ChangeDetectorRef,
    private _alert: AlertsService,
    private _auth: AuthService,
    private _confirmDialog: ConfirmDialogService,
    private _clientesService: ClientesService,
    private _seguimientoPlantaService: SeguimientoPlantaService,
    private _gerenteZonaService: GerenteZonaService
  ) { }

  ngOnInit() {
    this.loadInitialData();
    this.initForm();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  private initForm() {
    this.VisitaClientesForm = this._formBuilder.group({
      idCliente: [0, Validators.required],
      frecuenciaLista: [0, Validators.required],
      toneladas: [0, Validators.required],
      actividadRealizada: ['', Validators.required],
      idSeguimientoPlantaLinea: [0, Validators.required],
      fechaCompromiso: ['', Validators.required],
      idUsuarioRegistro: [0],
      idGerenteZona: [0, Validators.required],
      compromisoGerenteZona: ['', Validators.required],
      compromisoDirector: ['', Validators.required],
      calidadInformacion: ['', Validators.required]
    });
  }

  onLineaChange(event: any) {
    if (event.value) {
      this.selectedLinea = event.value;
      this.loadClientesByLinea(event.value.id);
      this.loadSeguimientosPlanta(event.value.id);
      this.loadGerenteZona(event.value.id);
    } else {
      this.listaClientes = [];
    }
  }

  onClienteChange(event: any) {
    if (event.value) {
      this.selectedCliente = event.value;
      this.loadVisitaClientes(event.value.id);
    } else {
      this.listaVisitaClientes = [];
    }
  }

  private loadInitialData() {
    this.loadData(this._listasService.getListas(Listas.frecuenciaVisita), 'listaFrecuencia');
    this.loadData(this._listasService.getListaLineas(), 'listaLineas');
  }

  private loadData(observable: any, propertyName: string, detectChanges: boolean = false) {
    const subscription = observable.subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this[propertyName] = data.result;
          if (propertyName === 'listaFrecuencia') {
            this.frecuenciaOptions = this.listaFrecuencia.map(item => ({
              label: item.descripcion,
              value: item.id
            }));
          }
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


  private loadVisitaClientes(idCliente: number) {
    this.loading = true;
    const subscription = this._seguimientoVisitaService.getVisitaClienteByIdCliente(idCliente).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaVisitaClientes = data.result;
          console.log(this.listaVisitaClientes);
          this._chRef.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error al cargar Visita del Cliente: ${err}`);
        this.loading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  private loadSeguimientosPlanta(idLinea: number) {
    this.loading = true;
    const subscription = this._seguimientoPlantaService.getSeguimientoPlantaByIdLinea(idLinea).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaSegPlantas = data.result.map((segPlanta: any) => ({
            ...segPlanta,
            descripcionCompleta: `${segPlanta.nombrePlanta} - ${segPlanta.observaciones}`
          }));
          console.log("Seg Plantas",this.listaSegPlantas);
          this._chRef.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error al cargar Seguimientos de planta: ${err}`);
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
    if (!this.selectedCliente) {
      this._alert.presentToast("top", "Debe seleccionar un Cliente", "warning");
      return;
    }
    this.VisitaClientesForm.patchValue({
      idPlanta: this.selectedCliente.id
    });
    this.displayModal = true;
  }

  closeModal() {
    this.displayModal = false;
    this.edit = false;
    this.VisitaClientesForm.reset();
  }

  RegistrarVisitaCliente(){
    if (this.VisitaClientesForm.valid) {
      this._confirmDialog.showSaveConfirm('Visita de Cliente').subscribe(confirmed => {
        if (confirmed) {
          const data = this.VisitaClientesForm.value;
          data.idUsuarioRegistro = this._auth.getUser().Id;
          data.idCliente = this.selectedCliente.id;
          // console.log(data);
          this._seguimientoVisitaService.createVisitaCliente(data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Visita de Cliente Creada con Éxito", "success");
                this.VisitaClientesForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                if (this.selectedCliente) {
                  this.loadVisitaClientes(this.selectedCliente.id);
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

  editarVisitaCliente(visita: any) {
    this.edit = true;
    this.idVisitaCliente = visita.id;
    const visitaSeleccionada = this.listaVisitaClientes.find(v => v.id === visita.id);
    
    if (visitaSeleccionada) {
        this.displayModal = true;
        
        this.VisitaClientesForm.patchValue({
            idCliente: visitaSeleccionada.idCliente,
            frecuenciaLista: visitaSeleccionada.frecuenciaLista,
            toneladas: visitaSeleccionada.toneladas,
            actividadRealizada: visitaSeleccionada.actividadRealizada,
            idSeguimientoPlantaLinea: visitaSeleccionada.idSeguimientoPlantaLinea,
            fechaCompromiso: new Date(visitaSeleccionada.fechaCompromiso),
            idGerenteZona: visitaSeleccionada.idGerenteZona,
            compromisoGerenteZona: visitaSeleccionada.compromisoGerenteZona,
            compromisoDirector: visitaSeleccionada.compromisoDirector,
            calidadInformacion: visitaSeleccionada.calidadInformacion
        });

        this.loadSeguimientosPlanta(this.selectedLinea.id);
        this.loadGerenteZona(this.selectedLinea.id);
    }
}

  actualizarVisitaCliente() {
    if (this.VisitaClientesForm.valid) {
      this._confirmDialog.showSaveConfirm('Visita de Cliente').subscribe(confirmed => {
        if (confirmed) {
          const data = this.VisitaClientesForm.value;
          delete data.idUsuarioRegistro;
          console.log(data);
          this._seguimientoVisitaService.updateVisitaCliente(this.idVisitaCliente,data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Visita de Cliente Actualizada con Éxito", "success");
                this.VisitaClientesForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                if (this.selectedCliente) {
                  this.loadVisitaClientes(this.selectedCliente.id);
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


}
