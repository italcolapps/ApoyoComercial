import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VisitaClientesService } from '../services/visita-clientes.service';
import { AlertsService } from '../services/alerts.service';
import { AuthService } from '../services/auth.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { ClientesService } from '../services/clientes.service';
import { ListasService } from '../services/listas.service';
import { OportunidadesService } from '../services/oportunidades.service';

@Component({
  selector: 'app-oportunidades',
  templateUrl: './oportunidades.page.html',
  styleUrls: ['./oportunidades.page.scss'],
})
export class OportunidadesPage implements OnInit, OnDestroy {
  displayModal: boolean = false;
  selectedLinea: any = null;
  selectedCliente: any = null;
  selectedVisita: any = null;
  listaClientes: any[] = []; 
  listaVisitaClientes: any[] = [];
  listaLineas: any[] = []; 
  listaOportunidades: any[] = []; 

  edit: boolean = false;
  idOportunidad: number = 0;
  loading: boolean = false;

  subscriptions: Subscription[] = [];
  OportunidadForm: FormGroup

  constructor(
    private _formBuilder: FormBuilder,
    private _seguimientoVisitaService: VisitaClientesService,
    private _chRef: ChangeDetectorRef,
    private _alert: AlertsService,
    private _auth: AuthService,
    private _confirmDialog: ConfirmDialogService,
    private _clientesService: ClientesService,
    private _listasService: ListasService,
    private _oportunidadesService: OportunidadesService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initForm() {
    this.OportunidadForm = this._formBuilder.group({
      idVisita: [ ],
      fecha: ['', Validators.required],
      descripcion: ['', Validators.required],
      idUsuarioRegistro: [], 
    });
  }

  onLineaChange(event: any) {
    if (event.value) {
      this.selectedLinea = event.value;
      this.loadClientesByLinea(event.value.id);
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

  onVisitaChange(event: any) {
    if (event.value) {
      this.selectedVisita = event.value;
      this.loadOportunidades(event.value.id);
    } else {
      this.listaOportunidades = [];
    }
  }

  private loadInitialData() {
    this.loadData(this._listasService.getListaLineas(), 'listaLineas');
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

  private loadOportunidades(idVisita: number) {
    this.loading = true;
    const subscription = this._oportunidadesService.getOportunidadByIdVisitaCliente(idVisita).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaOportunidades = data.result;
          console.log(this.listaOportunidades);          
          this._chRef.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error al cargar Oportunidades: ${err}`);
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
    this.displayModal = true;
  }

  closeModal() {
    this.displayModal = false;
    this.edit = false;
    this.OportunidadForm.reset();
  }

  RegistrarOportunidad(){
    if (this.OportunidadForm.valid) {
      this._confirmDialog.showSaveConfirm('Oportunidad Comercial').subscribe(confirmed => {
        if (confirmed) {
          const data = this.OportunidadForm.value;
          data.idUsuarioRegistro = this._auth.getUser().Id;
          data.idVisita = this.selectedVisita.id;
          console.log(data);
          this._oportunidadesService.createOportunidad(data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Oportunidad Creada con Éxito", "success");
                this.OportunidadForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                if (this.selectedVisita) {
                  this.loadOportunidades(this.selectedVisita.id);
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

  editarOportunidad(oportunidad: any) {
    this.edit = true;
    this.idOportunidad = oportunidad.id;
    const oportunidadSeleccionada = this.listaOportunidades.find(x => x.id == oportunidad.id);

    if (oportunidadSeleccionada) {
      this.displayModal = true;
      this.OportunidadForm.patchValue({
        idVisita: oportunidadSeleccionada.idVisita,
        fecha: new Date(oportunidadSeleccionada.fecha),
        descripcion: oportunidadSeleccionada.descripcion,
      });
    }
  }

    actualizarOportunidad() {
      if (this.OportunidadForm.valid) {
        this._confirmDialog.showUpdateConfirm('Oportunidad Comercial').subscribe(confirmed => {
          if (confirmed) {
            const data = this.OportunidadForm.value;
            data.idVisita = this.selectedVisita.id;
            delete data.idUsuarioRegistro;
            console.log(data);
            this._oportunidadesService.updateOportunidad(this.idOportunidad, data).subscribe({
              next: (x: any) => {
                if (x.error) {
                  this._alert.presentToast("top", x.message, "warning");
                } else {
                  this._alert.presentToast("top", "Oportunidad Actualizada con Éxito", "success");
                  this.OportunidadForm.reset();
                  this.closeModal();
                  this._chRef.detectChanges();
                  if (this.selectedVisita) {
                    this.loadOportunidades(this.selectedVisita.id);
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
