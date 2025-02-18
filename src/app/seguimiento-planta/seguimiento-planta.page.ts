import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SeguimientoPlantaService } from '../services/seguimiento-planta.service';
import { AlertsService } from '../services/alerts.service';
import { AuthService } from '../services/auth.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { ListasService } from '../services/listas.service';
import { TipoEstado } from '../interfaces/tipoEstado.enum';
import { Router } from '@angular/router';
import { SeguimientoStateService } from '../services/seguimiento-state.service';

@Component({
  selector: 'app-seguimiento-planta',
  templateUrl: './seguimiento-planta.page.html',
  styleUrls: ['./seguimiento-planta.page.scss'],
})

export class SeguimientoPlantaPage implements OnInit, OnDestroy {
  displayModal = false;
  selectedPlanta: any = null;
  listaPlantas: any[] = [];
  listaLineas: any[] = [];
  listaSegPlantas: any[] = [];
  listaEstados: any[] = [];
  edit = false;
  idSeguimientoPlanta = 0;
  loading = false;
  subscriptions: Subscription[] = [];

  SeguimientoPlantaForm: FormGroup;
  filtroSeguimientoPlantaForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _seguimientoPlantaService: SeguimientoPlantaService,
    private _listasService: ListasService,
    private _chRef: ChangeDetectorRef,
    private _alert: AlertsService,
    private _auth: AuthService,
    private _confirmDialog: ConfirmDialogService,
    private router: Router,
    private seguimientoState: SeguimientoStateService
  ) {

  }

  ngOnInit() {
    this.initForm();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initForm() {
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaFin.getDate() - 30);
  
    this.SeguimientoPlantaForm = this._formBuilder.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      observaciones: [''],
      nombre: ['', Validators.required],
      idUsuarioRegistro: [0],
      linea: [[], Validators.required],
      planta: [[], Validators.required],
      idEstado: [[]]
    });
  
    this.filtroSeguimientoPlantaForm = this._formBuilder.group({
      fechaInicio: [fechaInicio, Validators.required],
      fechaFin: [fechaFin, Validators.required],
      idEstado: [0],
      idLineas: [[], Validators.required],
      idPlantas: [[], Validators.required]
    });
  }
   
  buscarSeguimientosPlanta() {
    if (!this.hayAlgunaCondicionDeFiltro()) {
      this.mostrarAdvertenciaSinFiltros();
      return;
    }
    const usuarioActual = this._auth.getUser().Id;
    const formValues = this.filtroSeguimientoPlantaForm.getRawValue();
    const filtro: any = {
      fechaInicio: formValues.fechaInicio,
      fechaFin: formValues.fechaFin,
      idEstado: formValues.idEstado,
      idLineas: formValues.idLineas.map((linea: any) => linea.id),
      idPlantas: formValues.idPlantas.map((planta: any) => planta.id)
    };
    console.log(filtro);
    this._seguimientoPlantaService.getSeguimientoPlantaFiltrado(usuarioActual, filtro).subscribe((data: any) => {
      this.manejarRespuestaSeguimientos(data);
    });
  }

  private mostrarAdvertenciaSinFiltros() {
    console.warn('Debe utilizar al menos un criterio de búsqueda');
    this._alert.presentToast("top", 'Debe utilizar al menos un criterio de búsqueda', "error");
  }

  private manejarRespuestaSeguimientos(data:any){
    if (data.error) {
      console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
    } else {
      this.listaSegPlantas = data.result;
      console.log(this.listaSegPlantas);
      this._chRef.detectChanges();
    }
  }


  private loadInitialData() {
    this.loadData(this._listasService.getListaLineas(), 'listaLineas');
    this.loadData(this._listasService.getListaPlantas(), 'listaPlantas');
    this.loadData(this._listasService.getEstadoByIdEstado(TipoEstado.estadoSeguimientoPlanta), 'listaEstados');
  }

  private hayAlgunaCondicionDeFiltro(): boolean {
    const filtros = this.filtroSeguimientoPlantaForm.getRawValue(); 
    return Object.keys(filtros).some(key => {
      const valor = filtros[key];
      return valor !== 0 && valor !== '' && valor !== null;
    });
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

  showModal() {
    this.displayModal = true;
  }

  closeModal() {
    this.displayModal = false;
    this.edit = false;
    this.SeguimientoPlantaForm.reset();
  }

  RegistrarSeguimientoPlanta() {
    if (this.SeguimientoPlantaForm.valid) {
      this._confirmDialog.showSaveConfirm('Seguimiento de Planta').subscribe(confirmed => {
        if (confirmed) {
          const data = this.SeguimientoPlantaForm.value;
          data.idUsuarioRegistro = this._auth.getUser().Id;

          delete data.idEstado;
          console.log(data);
          this._seguimientoPlantaService.createSeguimientoPlanta(data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Seguimiento de planta Creado con Éxito", "success");
                this.SeguimientoPlantaForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                this.buscarSeguimientosPlanta();
              }
            },
            error: (err) => {
              console.error(`Error al crear Seguimiento de planta: ${err}`);
              this._alert.presentToast("top", "Error al crear el seguimiento de planta", "error");
            }
          });
        }
      });
    } else {
      this._alert.presentToast("top", "Por favor, complete todos los campos requeridos", "warning");
    }
  }

  editarSeguimientoPlanta(seguimiento: any) {
    this.edit = true;
    this.idSeguimientoPlanta = seguimiento.id;
    const subscription = this._seguimientoPlantaService.getSeguimientoById(this.idSeguimientoPlanta).subscribe({
      next: (data: any) => {
        if (data.error) {
          this._alert.presentToast("top", data.message, "warning");
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          const seguimientoSeleccionado = data.result;
          console.log(seguimientoSeleccionado);
          if (seguimientoSeleccionado) {
            const fechaInicio = new Date(seguimientoSeleccionado.fechaInicio);
            const fechaFin = seguimientoSeleccionado.fechaFin ? new Date(seguimientoSeleccionado.fechaFin) : null;
            
            const lineasSeleccionadas = seguimientoSeleccionado.lineasAsociadas.map(linea => linea.idLinea);
            const plantasSeleccionadas = seguimientoSeleccionado.plantasAsociadas.map(planta => planta.idPlanta);
            
            this.displayModal = true;
            this.SeguimientoPlantaForm.patchValue({
              fechaInicio: fechaInicio,
              fechaFin: fechaFin,
              codigo: seguimientoSeleccionado.codigo,
              nombre: seguimientoSeleccionado.nombre,
              observaciones: seguimientoSeleccionado.observaciones,
              linea: lineasSeleccionadas,
              planta: plantasSeleccionadas,
              idEstado: seguimientoSeleccionado.idEstado
            });
            this._chRef.detectChanges();
          }
        }
      },
      error: (err) => {
        console.error(`Error al registrar Seguimiento de planta: ${err}`);
        this._alert.presentToast("top", "Error al obtener el seguimiento de planta", "error");
      }
    });
    this.subscriptions.push(subscription);
  }
    

  actualizarSeguimientoPlanta() {
    if (this.SeguimientoPlantaForm.valid) {
      this._confirmDialog.showSaveConfirm('Seguimiento de Planta').subscribe(confirmed => {
        if (confirmed) {
          const data = this.SeguimientoPlantaForm.value;
          data.idUsuarioRegistro = this._auth.getUser().Id;
          console.log(data);
          this._seguimientoPlantaService.updateSeguimientoPlanta(this.idSeguimientoPlanta, data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Seguimiento de planta Actualizado con Éxito", "success");
                this.SeguimientoPlantaForm.reset();
                this.closeModal();
                this.buscarSeguimientosPlanta();
                this._chRef.detectChanges();
              }
            },
            error: (err) => {
              console.error(`Error al actualizar Seguimiento de planta: ${err}`);
              this._alert.presentToast("top", "Error al actualizar el seguimiento de planta", "error");
            }
          });
        }
      });
    } else {
      this._alert.presentToast("top", "Por favor, complete todos los campos requeridos", "warning");
    }
  }

  navigateToMenuSeguimiento(id: number) {
    this.seguimientoState.setSeguimientoId(id);
    this.router.navigate(['/tabs/menu-seguimiento'], {
      state: { seguimientoId: id }
    });
  }
}
