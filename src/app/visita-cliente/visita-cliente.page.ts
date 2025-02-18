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
import { ClienteSelectionService } from '../services/cliente-selection.service';
import { SeguimientoStateService } from '../services/seguimiento-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-visita-cliente',
  templateUrl: './visita-cliente.page.html',
  styleUrls: ['./visita-cliente.page.scss'],
})
export class VisitaClientePage implements OnInit, OnDestroy {
  displayModal: boolean = false;

  selectedCliente: any = null;
  selectedClienteId: number | null = null;
  selectedClienteNombre: string = '';

  listaVisitaClientes: any[] = []; 
  listaSegPlantas: any[] = [];
  listaGerenteZona: any[] = [];
  listaFrecuencia: any[] = []; 
  frecuenciaOptions: any[] = [];
  listaLineas: any[] = [];
  listaPlantas: any[] = [];

  selectedPlanta: any = null;
  selectedSeguimientoPlanta: any = null;

  edit = false;
  idVisitaCliente = 0;
  loading = false;

  seguimientoId: number | null = null;
  seguimientoSeleccionado: any = null;
  private subscription = new Subscription();
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
    private _seguimientoPlantaService: SeguimientoPlantaService,
    private _gerenteZonaService: GerenteZonaService,
    private clienteSelectionService: ClienteSelectionService,
    private router: Router,
    private seguimientoState: SeguimientoStateService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as { 
        seguimientoId: number;
        seguimiento: any 
      };
      this.seguimientoId = state.seguimientoId;
      this.seguimientoSeleccionado = state.seguimiento;
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
    
    this.loadInitialData();
    this.initForm();
    this.loadVisitaClientes(this.seguimientoId);
    
    if (this.seguimientoId) {
      const plantaIds = this.seguimientoSeleccionado.plantasAsociadas
      .map((planta: any) => planta.idPlanta);
    this.loadGerenteZona(plantaIds); 
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  private initForm() {

    const fechaActual = new Date();
    
    this.VisitaClientesForm = this._formBuilder.group({
      idCliente: [0, Validators.required],
      frecuenciaLista: [0],
      toneladas: [0, Validators.required],
      actividadRealizada: ['', Validators.required],
      idSeguimientoPlanta: [0, Validators.required],
      fechaVisita: ['', Validators.required],
      fechaCompromiso: ['', Validators.required],
      idUsuarioRegistro: [0],
      idGerenteZona: [0, Validators.required],
      compromisoGerenteZona: ['', Validators.required],
      compromisoDirector: ['', Validators.required],
      calidadInformacion: ['', Validators.required]
    });
  }

  onClienteChange(event: { id: number, nombre: string }) {
    if (event && event.id) {
      console.log(this.seguimientoSeleccionado)
      this.selectedClienteId = event.id;
      this.selectedClienteNombre = event.nombre;

      this.VisitaClientesForm.patchValue({
        idCliente: this.selectedCliente.id
      });
    } else {
      this.selectedClienteId = null;
      this.selectedClienteNombre = '';
      this.listaVisitaClientes = [];
    }
  }

  getLineasNames(): string {
    if (!this.selectedCliente?.lineas) return '';
    return this.selectedCliente.lineas
      .map((linea: any) => linea.nombre)
      .join(', ');
  }



  private loadInitialData() {
    this.loadData(this._listasService.getListas(Listas.frecuenciaVisita), 'listaFrecuencia');
    this.loadData(this._listasService.getListaPlantas(), 'listaPlantas');
    const plantaIds = this.seguimientoSeleccionado.plantasAsociadas
    .map((planta: any) => planta.idPlanta);
  this.loadGerenteZona(plantaIds); 
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


  private loadVisitaClientes(idSeguimiento: number) {
    this.loading = true;
    const subscription = this._seguimientoVisitaService.getVisitaClienteBySeguimientoPlanta(idSeguimiento).subscribe({
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


  private async loadGerenteZona(idPlantas: number | number[]) {
    this.loading = true;
    this.listaGerenteZona = [];
    
    // Convertir el input a array si es un solo número
    const plantaIds = Array.isArray(idPlantas) ? idPlantas : [idPlantas];
    
    try {
      // Crear un array de promesas para cada llamada a la API
      const promises = plantaIds.map(idPlanta => 
        this._gerenteZonaService.getGerenteZonaByIdPlanta(idPlanta).toPromise()
      );
      
      // Esperar a que todas las promesas se resuelvan
      const results = await Promise.all(promises);
      
      // Procesar los resultados
      results.forEach((data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          const gerentesZona = data.result.map((gerente: any) => ({
            ...gerente,
            nombreCompleto: `${gerente.nombre} ${gerente.apellido}`
          }));
          // Añadir los gerentes al listado existente
          this.listaGerenteZona = [...this.listaGerenteZona, ...gerentesZona];
        }
      });
      
      console.log("GZ", this.listaGerenteZona);
      this._chRef.detectChanges();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      this.loading = false;
    }
  }

  showModal() {
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
          data.idSeguimientoPlanta = this.seguimientoId
          console.log(data);
          this._seguimientoVisitaService.createVisitaCliente(data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Visita de Cliente Creada con Éxito", "success");
                this.VisitaClientesForm.reset();
                this.closeModal();
                this.loadVisitaClientes(this.seguimientoId);
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

  editarVisitaCliente(visita: any) {
    this.edit = true;
    this.idVisitaCliente = visita.id;
    const visitaSeleccionada = this.listaVisitaClientes.find(v => v.id === visita.id);
    
    if (visitaSeleccionada) {

        const plantaIds = this.seguimientoSeleccionado.plantasAsociadas
        .map((planta: any) => planta.idPlanta);
        this.loadGerenteZona(plantaIds); 
        this.displayModal = true;
        
        this.VisitaClientesForm.patchValue({
            idCliente: visitaSeleccionada.idCliente,
            frecuenciaLista: visitaSeleccionada.frecuenciaLista,
            toneladas: visitaSeleccionada.toneladas,
            actividadRealizada: visitaSeleccionada.actividadRealizada,
            idSeguimientoPlantaLinea: visitaSeleccionada.idSeguimientoPlantaLinea,
            fechaCompromiso: new Date(visitaSeleccionada.fechaCompromiso),
            fechaVisita: new Date(visitaSeleccionada.fechaVisita),
            idGerenteZona: visitaSeleccionada.idGerenteZona,
            compromisoGerenteZona: visitaSeleccionada.compromisoGerenteZona,
            compromisoDirector: visitaSeleccionada.compromisoDirector,
            calidadInformacion: visitaSeleccionada.calidadInformacion
        });

        const lineaIds = this.seguimientoSeleccionado.lineasAsociadas
        .map((linea: any) => linea.idLinea);
      
      this.loadGerenteZona(lineaIds); 
    }
}

  actualizarVisitaCliente() {
    // if (this.VisitaClientesForm.valid) {
    //   this._confirmDialog.showSaveConfirm('Visita de Cliente').subscribe(confirmed => {
    //     if (confirmed) {
          debugger;
          const data = this.VisitaClientesForm.value;
          delete data.idUsuarioRegistro;
          data.idSeguimientoPlanta = this.seguimientoId
          console.log(data);
          this._seguimientoVisitaService.updateVisitaCliente(this.idVisitaCliente, data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Visita de Cliente Actualizada con Éxito", "success");
                this.VisitaClientesForm.reset();
                this.closeModal();
                this.loadVisitaClientes(this.seguimientoId);
                this._chRef.detectChanges();
              }
            },
            error: (err) => {
              this._alert.presentToast("top", err, "warning");
            }
          });
    //     }
    //   });
    // }
  }


}
