import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EvaluacionService } from '../services/evaluacion.service';
import { AlertsService } from '../services/alerts.service';
import { AuthService } from '../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { ListasService } from '../services/listas.service';
import { GerenteZonaService } from '../services/gerente-zona.service';
import { Listas } from '../interfaces/listas';

@Component({
  selector: 'app-evaluaciones',
  templateUrl: './evaluaciones.page.html',
  styleUrls: ['./evaluaciones.page.scss'],
})
export class EvaluacionesPage implements OnInit, OnDestroy {
  displayModal: boolean = false;
  displayEvaluacionModal: boolean = false;
  
  selectedLinea: any = null;
  selectedGZ: any = null;
  selectedEvaluacion: any = null;
  

  listaGerenteZona: any[] = [];
  listaLineas: any = [];
  listaEvaluaciones: any[] = [];
  listaAspectos: any[] = [];
  listaRespuestas: any[] = [];
  evaluacionesData: any[] = [];

  edit: boolean = false;
  idEvaluacion: number = 0;
  loading: boolean = false;
  subscriptions: Subscription[] = [];
  EvaluacionForm: FormGroup

  constructor(
    private _formBuilder: FormBuilder,
    private _chRef: ChangeDetectorRef,
    private _alert: AlertsService,
    private _auth: AuthService,
    private _confirmDialog: ConfirmDialogService,
    private _evaluacionesService: EvaluacionService,
    private _listasService: ListasService,
    private _gerenteZonaService: GerenteZonaService
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initForm() {
    this.EvaluacionForm = this._formBuilder.group({
      idGerenteZonaTabla: [ ],
      fechaRegistro: [,Validators.required],
      idUsuarioRegistro: [], 
      observaciones: ['', Validators.required],   
    });
  }

  onLineaChange(event: any) {
    if (event.value) {
      this.selectedLinea = event.value;
      this.loadGerenteZona(event.value.id);
    } else {
      this.listaGerenteZona = [];
    }
  }

  onGerenteZonaChange(event: any) {
    if (event.value) {
      this.selectedGZ = event.value;
      this.loadEvaluaciones(event.value.id);
    } else {
      this.listaEvaluaciones = [];
    }
  }

  private loadInitialData() {
    this.loadData(this._listasService.getListaLineas(), 'listaLineas');
    this.loadData(this._evaluacionesService.getAspectos(), 'listaAspectos');
    this.loadData(this._listasService.getListas(Listas.tipoRespuesta), 'listaRespuestas');
  }

  private loadData(observable: any, propertyName: string, detectChanges: boolean = false) {
    const subscription = observable.subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this[propertyName] = data.result;
          console.log(this[propertyName]);
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

  private loadEvaluaciones(idGerenteZona: number) {
    this.loading = true;
    const subscription = this._evaluacionesService.getEvaluacionByIdGerenteZona(idGerenteZona).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaEvaluaciones = data.result;
          console.log(this.listaEvaluaciones);
          this._chRef.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error al cargar evaluaciones: ${err}`);
        this.loading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  showModal() {
    if (!this.selectedGZ) {
      this._alert.presentToast("top", "Debe seleccionar un Gerente de Zona", "warning");
      return;
    }
    this.displayModal = true;
  }

  closeModal() {
    this.displayModal = false;
    this.edit = false;
    this.EvaluacionForm.reset();
  }

  closeEvaluacionModal() {
    this.displayEvaluacionModal = false;
    this.evaluacionesData = [];
    this.selectedEvaluacion = null;
  }

  initEvaluacionData() {
    this.evaluacionesData = this.listaAspectos.map((aspecto: any) => ({
      id: aspecto.id,
      nombre: aspecto.nombre,
      respuesta: null
    }));
  }

  abrirEvaluacion(evaluacion: any) {
    this.selectedEvaluacion = evaluacion;
    this.initEvaluacionData();
    this.displayEvaluacionModal = true;
  }

  RegistrarEvaluacion(){
    if (this.EvaluacionForm.valid) {
      this._confirmDialog.showSaveConfirm('evaluacion').subscribe(confirmed => {
        if (confirmed) {
          const data = this.EvaluacionForm.value;
          data.idGerenteZonaTabla = this.selectedGZ.id;  
          data.idUsuarioRegistro = this._auth.getUser().Id;
          console.log(data);
          this._evaluacionesService.createEvaluacion(data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Evaluacion Creada con Éxito", "success");
                this.EvaluacionForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                if (this.selectedGZ) {
                  this.loadEvaluaciones(this.selectedGZ.id);
                  // Mostrar confirmación para evaluar
                  this._confirmDialog.showConfirm(
                    '¿Desea Evaluar al gerente de Zona?',
                    'Confirmación',
                    'Sí',
                    'No'
                  ).subscribe((confirmed: boolean) => {
                    if (confirmed) {
                      this.initEvaluacionData();
                      this.displayEvaluacionModal = true;
                    }
                  });
                }
              }
            },
            error: (err) => {
              console.error(`Error al registrar evaluacion: ${err}`);
              this._alert.presentToast("top", "Error al crear la evaluacion", "error");
            }
          });
        }
      });
    }
  }

  editarEvaluacion(evaluacion: any) {
    this.edit = true;
    this.idEvaluacion = evaluacion.id;
    this.EvaluacionForm.patchValue({
      idGerenteZona: evaluacion.idGerenteZona,
      fechaRegistro: new Date(evaluacion.fechaRegistro),
      observaciones: evaluacion.observaciones,
    });
    this.showModal();
  }

  actualizarEvaluacion() {
    if (this.EvaluacionForm.valid) {
      this._confirmDialog.showSaveConfirm('evaluacion').subscribe(confirmed => {
        if (confirmed) {
          const data = this.EvaluacionForm.value;
          data.idGerenteZonaTabla = this.selectedGZ.id;
          delete data.idUsuarioRegistro;
          this._evaluacionesService.updateEvaluacion(this.idEvaluacion, data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Evaluacion Actualizada con Éxito", "success");
                this.EvaluacionForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                if (this.selectedGZ) {
                  this.loadEvaluaciones(this.selectedGZ.id);
                }
              }
            },
            error: (err) => { 
              console.error(`Error al actualizar evaluacion: ${err}`);
              this._alert.presentToast("top", "Error al actualizar la evaluacion", "error");
            }
          });
        }
      });
    }
  }

  async guardarEvaluacion() {
    const respuestasIncompletas = this.evaluacionesData.some(item => item.respuesta === null);
    if (respuestasIncompletas) {
      this._alert.presentToast("top", "Debe completar todas las respuestas", "warning");
      return;
    }

    try {
      for (const item of this.evaluacionesData) {
        const respuesta = {
          idAspecto: item.id,
          idEvaluacion: this.selectedEvaluacion.id,
          idRespuestaLista: item.respuesta
        };
        console.log(respuesta);
        await this._evaluacionesService.createRespuesta(respuesta).toPromise();
      }

      this._alert.presentToast("top", "Evaluación Creada con éxito", "success");
      this.closeEvaluacionModal();
      if (this.selectedGZ) {
        this.loadEvaluaciones(this.selectedGZ.id);
      }
    } catch (error) {
      console.error('Error al guardar las respuestas:', error);
      this._alert.presentToast("top", "Error al guardar la evaluación", "error");
    }
  }

  getPercentageForResponse(responseId: number): string {
    switch(responseId) {
      case 7: // SOBRE PASA
        return '100,0%';
      case 8: // CUMPLE
        return '80,0%';
      case 9: // CASI CUMPLE
        return '60,0%';
      case 10: // NO CUMPLE
        return '0,0%';
      default:
        return '0,0%';
    }
  }

  getTotalForResponse(responseId: number): number {
    const count = this.evaluacionesData.filter(item => item.respuesta === responseId).length;
    switch(responseId) {
      case 7: // SOBRE PASA
        return count * 5;
      case 8: // CUMPLE
        return count * 4;
      case 9: // CASI CUMPLE
        return count * 3;
      case 10: // NO CUMPLE
        return count * 0;
      default:
        return 0;
    }
  }

  getTotalPercentage(): string {
    let totalPoints = 0;
    let maxPossiblePoints = this.evaluacionesData.length * 5; // Máximo posible: todos SOBRE PASA (5 puntos)

    this.evaluacionesData.forEach(item => {
      switch(item.respuesta) {
        case 7: // SOBRE PASA
          totalPoints += 5;
          break;
        case 8: // CUMPLE
          totalPoints += 4;
          break;
        case 9: // CASI CUMPLE
          totalPoints += 3;
          break;
        case 10: // NO CUMPLE
          totalPoints += 0;
          break;
      }
    });

    const percentage = (totalPoints / maxPossiblePoints) * 100;
    return percentage.toFixed(1).replace('.', ',');
  }
}
