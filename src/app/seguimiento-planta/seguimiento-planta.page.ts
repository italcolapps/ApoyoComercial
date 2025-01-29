import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SeguimientoPlantaService } from '../services/seguimiento-planta.service';
import { AlertsService } from '../services/alerts.service';
import { AuthService } from '../services/auth.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { ListasService } from '../services/listas.service';
import { TipoEstado } from '../interfaces/tipoEstado.enum';

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

  constructor(
    private _formBuilder: FormBuilder,
    private _seguimientoPlantaService: SeguimientoPlantaService,
    private _listasService: ListasService,
    private _chRef: ChangeDetectorRef,
    private _alert: AlertsService,
    private _auth: AuthService,
    private _confirmDialog: ConfirmDialogService
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
    this.SeguimientoPlantaForm = this._formBuilder.group({
      idPlanta: [ ,Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      observaciones: ['', Validators.required],
      idUsuarioRegistro: [0],
      linea: [[], Validators.required],
      idEstado: [''] 
    });
  }

  onPlantaChange(event: any) {
    if (event.value) {
      this.selectedPlanta = event.value;
      this.loadSeguimientosPlanta(event.value.id);
    } else {
      this.listaSegPlantas = [];
    }
  }

  private loadInitialData() {
    this.loadData(this._listasService.getListaLineas(), 'listaLineas');
    this.loadData(this._listasService.getListaPlantas(), 'listaPlantas');
    this.loadData(this._listasService.getEstadoByIdEstado(TipoEstado.estadoSeguimientoPlanta), 'listaEstados');
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

  private loadSeguimientosPlanta(idPlanta: number) {
    this.loading = true;
    const subscription = this._seguimientoPlantaService.getSeguimientoPlantaByIdPlanta(idPlanta).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaSegPlantas = data.result;
          // console.log(this.listaSegPlantas);
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

  showModal() {
    if (!this.selectedPlanta) {
      this._alert.presentToast("top", "Debe seleccionar una planta", "warning");
      return;
    }
    this.SeguimientoPlantaForm.patchValue({
      idPlanta: this.selectedPlanta.id
    });
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
          data.idPlanta = this.selectedPlanta.id;
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
                if (this.selectedPlanta) {
                  this.loadSeguimientosPlanta(this.selectedPlanta.id);
                }
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
          // Formatear las fechas para el calendario
            const fechaInicio = new Date(seguimientoSeleccionado.fechaInicio);
            const fechaFin = seguimientoSeleccionado.fechaFin ? new Date(seguimientoSeleccionado.fechaFin) : null;
            
          // Mapear los IDs de las líneas seleccionadas
            const lineasSeleccionadas = seguimientoSeleccionado.lineasAsociadas.map(linea => linea.idLinea);
            
            this.displayModal = true;
            this.SeguimientoPlantaForm.patchValue({
              idPlanta: seguimientoSeleccionado.idPlanta,
              fechaInicio: fechaInicio,
              fechaFin: fechaFin,
              observaciones: seguimientoSeleccionado.observaciones,
              linea: lineasSeleccionadas,
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
          data.id = this.idSeguimientoPlanta;
          data.idPlanta = this.selectedPlanta.id;
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
                this._chRef.detectChanges();
                if (this.selectedPlanta) {
                  this.loadSeguimientosPlanta(this.selectedPlanta.id);
                }
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

}
