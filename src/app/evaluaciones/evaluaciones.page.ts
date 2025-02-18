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
import { SeguimientoStateService } from '../services/seguimiento-state.service';
import { Router } from '@angular/router';

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
  listaRespuestasEvaluacion: any[] = [];
  evaluacionesData: any[] = [];

  edit: boolean = false;
  editRespuestas: boolean = false;
  idEvaluacion: number = 0;
  loading: boolean = false;

  seguimientoId: number | null = null;
  seguimientoSeleccionado: any = null;
  private subscription = new Subscription();
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
    if (this.seguimientoId) {
      this.loadEvaluaciones(this.seguimientoId);
      this.loadGerentesZonaNoEvaluados(this.seguimientoId); 
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initForm() {
    const fechaActual = new Date();

    this.EvaluacionForm = this._formBuilder.group({
      idGerenteZonaTabla: [null, Validators.required],
      fechaRegistro: [fechaActual, Validators.required],
      idUsuarioRegistro: [null],
      observaciones: ['', Validators.required],
      idSeguimientoPlanta: [null],
      respuestas: [[]]
    });
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
          // console.log(this[propertyName]);
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

  private loadGerentesZonaNoEvaluados(idSeguimiento: number) {
    this.loading = true;
    const subscription = this._evaluacionesService.getGerentesNoEvaluadosByIdSeguimiento(idSeguimiento).subscribe({
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
        console.error(`Error al cargar evaluaciones: ${err}`);
        this.loading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  private loadEvaluaciones(idSeguimiento: number) {
    this.loading = true;
    const subscription = this._evaluacionesService.getEvaluacionByIdSeguimientoPlanta(idSeguimiento).subscribe({
      next: (data: any) => {
        if (data.error) {
          this.listaEvaluaciones = [];
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
    this.displayModal = true;
    this.initEvaluacionData();
    this._chRef.detectChanges();
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
    console.log(evaluacion.id);
    this.initEvaluacionData();
    
    this._evaluacionesService.getRespuestasByEvaluacion(evaluacion.id).subscribe({
      next: (response: any) => {
        if (response.error && response.codError === 2005) {
          this.editRespuestas = false;
        } else {
          this.editRespuestas = true;
          this.evaluacionesData = this.listaAspectos.map((aspecto: any) => {
            const respuestaExistente = response.result.find((resp: any) => resp.idAspecto === aspecto.id);
            return {
              id: aspecto.id,
              nombre: aspecto.nombre,
              respuesta: respuestaExistente ? respuestaExistente.idRespuestaLista : null
            };
          });
        }
        this.displayEvaluacionModal = true;
      },
      error: (err) => {
        console.error('Error al obtener respuestas:', err);
        this._alert.presentToast('top', 'No se pudieron obtener las respuestas de la evaluación', "error");
      }
    });
  }

  editarEvaluacion(evaluacion: any) {
    this.edit = true;
    this.idEvaluacion = evaluacion.id;
    this.selectedEvaluacion = evaluacion;
  
    // Mapear los aspectos con sus respuestas
    this.evaluacionesData = this.listaAspectos.map((aspecto: any) => {
      const respuestaExistente = evaluacion.respuestas.find(
        (resp: any) => resp.idAspecto === aspecto.id
      );
      
      return {
        id: aspecto.id,
        nombre: aspecto.nombre, // Usar el campo correcto del aspecto
        respuesta: respuestaExistente ? +respuestaExistente.idRespuestaLista : null // Asegurar que sea número
      };
    });
  
    // Actualizar el formulario
    this.EvaluacionForm.patchValue({
      idGerenteZonaTabla: evaluacion.idGerenteZonaTabla,
      fechaRegistro: new Date(evaluacion.fechaRegistro),
      observaciones: evaluacion.observaciones,
      idSeguimientoPlanta: evaluacion.idSeguimientoPlanta
    });
  
    this.selectedGZ = this.listaGerenteZona.find(gz => gz.id === evaluacion.idGerenteZonaTabla);
    this._chRef.detectChanges();
    this.showModal();
  }

  actualizarEvaluacion() {
    if (this.EvaluacionForm.valid) {
      const respuestasIncompletas = this.evaluacionesData.some(item => item.respuesta === null);
      if (respuestasIncompletas) {
        this._alert.presentToast("top", "Debe completar todas las respuestas", "warning");
        return;
      }

      this._confirmDialog.showSaveConfirm('evaluacion').subscribe(confirmed => {
        if (confirmed) {
          const formData = this.EvaluacionForm.value;
          
          // Preparar el objeto de datos según el formato de la API
          const data = {
            id: this.idEvaluacion,
            idGerenteZonaTabla: this.selectedGZ.id,
            fechaRegistro: formData.fechaRegistro,
            idUsuarioRegistro: this._auth.getUser().Id,
            observaciones: formData.observaciones,
            idSeguimientoPlanta: this.seguimientoId,
            respuestas: this.evaluacionesData.map(item => {
              const respuestaExistente = this.selectedEvaluacion.respuestas.find(
                (resp: any) => resp.idAspecto === item.id
              );
              return {
                id: respuestaExistente ? respuestaExistente.id : 0,
                idAspecto: item.id,
                idEvaluacion: this.idEvaluacion,
                idRespuestaLista: item.respuesta
              };
            })
          };

          this._evaluacionesService.updateEvaluacion(this.idEvaluacion, data).subscribe({
            next: (response: any) => {
              if (response.error) {
                this._alert.presentToast("top", response.message, "warning");
              } else {
                this._alert.presentToast("top", "Evaluación actualizada con éxito", "success");
                this.EvaluacionForm.reset();
                this.closeModal();
                this.evaluacionesData = [];
                if (this.seguimientoId) {
                  this.loadEvaluaciones(this.seguimientoId);
                }
              }
            },
            error: (err) => {
              console.error('Error al actualizar la evaluación:', err);
              this._alert.presentToast("top", "Error al actualizar la evaluación", "error");
            }
          });
        }
      });
    }
  }

  async RegistrarEvaluacion() {
    if (this.EvaluacionForm.valid) {
      const respuestasIncompletas = this.evaluacionesData.some(item => item.respuesta === null);
      if (respuestasIncompletas) {
        this._alert.presentToast("top", "Debe completar todas las respuestas", "warning");
        return;
      }

      this._confirmDialog.showSaveConfirm('evaluacion').subscribe(confirmed => {
        if (confirmed) {
          const formData = this.EvaluacionForm.value;
          
          const data = {
            idGerenteZonaTabla: formData.idGerenteZonaTabla,
            fechaRegistro: formData.fechaRegistro,
            idUsuarioRegistro: this._auth.getUser().Id,
            observaciones: formData.observaciones,
            idSeguimientoPlanta: this.seguimientoId,
            respuestas: this.evaluacionesData.map(item => ({
              idAspecto: item.id,
              idEvaluacion: 0,
              idRespuestaLista: item.respuesta,
              id: 0
            }))
          };

          this._evaluacionesService.createEvaluacionCompleta(data).subscribe({
            next: (response: any) => {
              if (response.error) {
                this._alert.presentToast("top", response.message, "warning");
              } else {
                this._alert.presentToast("top", "Evaluación registrada con éxito", "success");
                this.EvaluacionForm.reset();
                this.closeModal();
                this.evaluacionesData = [];
                if (this.seguimientoId) {
                  this.loadEvaluaciones(this.seguimientoId);
                  this.loadGerentesZonaNoEvaluados(this.seguimientoId);
                }
              }
            },
            error: (err) => {
              console.error('Error al registrar la evaluación:', err);
              this._alert.presentToast("top", "Error al registrar la evaluación", "error");
            }
          });
        }
      });
    }
  }

  async actualizarRespuestas() {
    const respuestas = await this._evaluacionesService.getRespuestasByEvaluacion(this.selectedEvaluacion.id).toPromise();
    
    if (!respuestas || respuestas['error']) {
      throw new Error('No se encontraron las respuestas para actualizar');
    }

    for (const item of this.evaluacionesData) {
      const respuestaExistente = respuestas['result'].find((resp: any) => resp.idAspecto === item.id);
      if (respuestaExistente) {
        const respuestaActualizada = {
          idAspecto: item.id,
          idEvaluacion: this.selectedEvaluacion.id,
          idRespuestaLista: item.respuesta
        };
        await this._evaluacionesService.updateRespuesta(respuestaExistente.id, respuestaActualizada).toPromise();
      }
    }
  }

  getAbreviacion(respuestaListaNombre: string): string {
    if (!this.listaEvaluaciones || this.listaEvaluaciones.length === 0) {
      return '';
    }
    
    switch (respuestaListaNombre) {
      case 'SOBRE PASA':
        return 'SP';
      case 'CUMPLE':
        return 'C';
      case 'CASI CUMPLE':
        return 'CC';
      case 'NO CUMPLE':
        return 'NC';
      default:
        return '';
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

  getEvaluacionPercentage(respuestas: any[]): string {
    let totalPoints = 0;
    let maxPossiblePoints = respuestas.length * 5; // Máximo posible: todos SOBRE PASA (5 puntos)

    respuestas.forEach(item => {
      switch(item.idRespuestaLista) {
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
