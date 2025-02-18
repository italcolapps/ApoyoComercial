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
import { ClienteSelectionService } from '../services/cliente-selection.service';
import { SeguimientoStateService } from '../services/seguimiento-state.service';
import { Router } from '@angular/router';
import { GerenteZonaService } from '../services/gerente-zona.service';

@Component({
  selector: 'app-oportunidades',
  templateUrl: './oportunidades.page.html',
  styleUrls: ['./oportunidades.page.scss'],
})
export class OportunidadesPage implements OnInit, OnDestroy {
  displayModal: boolean = false;
  selectedCliente: any = null;
  selectedClienteId: number | null = null;
  selectedClienteNombre: string = '';

  selectedVisita: any = null;
  listaVisitaClientes: any[] = [];
  listaLineas: any[] = []; 
  listaGerenteZona: any[] = []; 
  listaOportunidades: any[] = []; 

  edit: boolean = false;
  idOportunidad: number = 0;
  loading: boolean = false;

  seguimientoId: number | null = null;
  seguimientoSeleccionado: any = null;
  seguimientoPlantas: any[] = [];
  seguimientoLineas: any[] = [];
  private subscription = new Subscription();
  subscriptions: Subscription[] = [];
  OportunidadForm: FormGroup

  constructor(
    private _formBuilder: FormBuilder,
    private _seguimientoVisitaService: VisitaClientesService,
    private _chRef: ChangeDetectorRef,
    private _alert: AlertsService,
    private _auth: AuthService,
    private _confirmDialog: ConfirmDialogService,
    private _listasService: ListasService,
    private _oportunidadesService: OportunidadesService,
    private clienteSelectionService: ClienteSelectionService,
    private router: Router,
    private seguimientoState: SeguimientoStateService,
    private gerenteZonaService: GerenteZonaService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as { 
        seguimientoId: number;
        seguimiento: any 
      };
      this.seguimientoId = state.seguimientoId;
      this.seguimientoSeleccionado = state.seguimiento;
      this.seguimientoPlantas = this.seguimientoSeleccionado.plantasAsociadas;
      this.seguimientoLineas = this.seguimientoSeleccionado.lineasAsociadas;
      console.log(this.seguimientoId);
      console.log(this.seguimientoSeleccionado);
      
      // Sincronizar con el servicio
      if (state.seguimientoId) {
        this.seguimientoState.setSeguimientoId(state.seguimientoId);
      }
      if (state.seguimiento) {
        this.seguimientoState.setSeguimiento(state.seguimiento);
      }
    }
   }


  ngOnInit() {
    this.clienteSelectionService.clienteSeleccionado$.subscribe(cliente => {
      if (cliente) {
        this.selectedCliente = cliente;
        this.selectedClienteId = cliente.id;
        this.selectedClienteNombre = cliente.nombre;
      }
    });
    this.subscription.add(
      this.seguimientoState.selectedSeguimientoId$.subscribe(id => {
        this.seguimientoId = id;
        if (!id) {
          this.router.navigate(['/tabs/seguimiento-planta']);
        }
      })
    );

    this.subscription.add(
      this.seguimientoState.selectedSeguimiento$.subscribe(seguimiento => {
        this.seguimientoSeleccionado = seguimiento;
        if (!seguimiento && this.seguimientoId) {

        }
      })
    );
    
    this.initForm();
    this.loadInitialData();
    this.loadOportunidades(this.seguimientoId);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initForm() {
    const fechaActual = new Date();

    this.OportunidadForm = this._formBuilder.group({
      idSeguimientoPlanta: [this.seguimientoId],
      fecha: [fechaActual],
      idUsuarioRegistro: [], 
      idPlanta: [ ,Validators.required],
      idLinea: [ ,Validators.required],
      idCliente: [ ,Validators.required],
      idGerenteZona: [ ,Validators.required],
      contacto: ['', Validators.required],
      tonelada: [ ,Validators.required],
      compromisoGerenteZona: ['', Validators.required]
    });
  }s

  onClienteChange(event: any) {
    if (event && event.id) {
      this.selectedClienteId = event.id;
      this.selectedClienteNombre = event.nombre;
    } else {
      this.selectedClienteId = null;
      this.selectedClienteNombre = '';
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

  onPlantaChange(event: any) {
    console.log('Valor seleccionado:', event.value);
    if (event.value) {
      this.loadGerentesZonaByPlanta(event.value);
    } else {
      this.listaGerenteZona = [];
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

  private loadGerentesZonaByPlanta(idPlanta : number){
    this.loading = true;
    const subscription = this.gerenteZonaService.getGerenteZonaByIdPlanta(idPlanta).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaGerenteZona = data.result.map((gerente: any) => ({
            ...gerente,
            nombreCompleto: `${gerente.nombre} ${gerente.apellido}`
          }));
          console.log(this.listaGerenteZona);
          this._chRef.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => { 
        console.error(`Error al cargar Gerentes Zona: ${err}`);
        this.loading = false;
      }
    });
  }

  private loadOportunidades(idSeguimiento: number) {
    this.loading = true;
    const subscription = this._oportunidadesService.getOportunidadByIdSeguimientoPlanta(idSeguimiento).subscribe({
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
          data.idSeguimientoPlanta = this.seguimientoId;
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
                if (this.seguimientoId) {
                  this.loadOportunidades(this.seguimientoId);
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
      console.log(oportunidadSeleccionada);
      this.displayModal = true;
      
      // Primero cargamos los gerentes de zona según la planta
      this.loadGerentesZonaByPlanta(oportunidadSeleccionada.idPlanta);
      
      this.OportunidadForm.patchValue({
        idCliente: oportunidadSeleccionada.idCliente,
        idPlanta: oportunidadSeleccionada.idPlanta,
        idLinea: oportunidadSeleccionada.idLinea,
        contacto: oportunidadSeleccionada.contacto,
        tonelada: oportunidadSeleccionada.tonelada,
        compromisoGerenteZona: oportunidadSeleccionada.compromisoGerenteZona,
        fecha: oportunidadSeleccionada.fecha,
        idGerenteZona: oportunidadSeleccionada.idGerenteZona
      });
    }
  }

    actualizarOportunidad() {
      if (this.OportunidadForm.valid) {
        this._confirmDialog.showUpdateConfirm('Oportunidad Comercial').subscribe(confirmed => {
          if (confirmed) {
            const data = this.OportunidadForm.value;
            data.idSeguimientoPlanta = this.seguimientoId;
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
                  if (this.seguimientoId) {
                    this.loadOportunidades(this.seguimientoId);
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
