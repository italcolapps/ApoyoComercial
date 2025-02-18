import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlantaProductoService } from '../services/planta-producto.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ListasService } from '../services/listas.service';
import { ChangeDetectorRef } from '@angular/core';
import { AlertsService } from '../services/alerts.service';
import { AuthService } from '../services/auth.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { Router } from '@angular/router';
import { SeguimientoStateService } from '../services/seguimiento-state.service';

@Component({
  selector: 'app-planta-producto',
  templateUrl: './planta-producto.page.html',
  styleUrls: ['./planta-producto.page.scss']
})
export class PlantaProductoPage implements OnInit, OnDestroy {
  displayModal = false;
  selectedPlanta: any = null;
  listaPlantas: any[] = [];
  listaLineas: any[] = [];
  listaRevisiones: any[] = [];

  edit = false;
  selectedRevision: any = null;
  loading = false;

  seguimientoId: number | null = null;
  seguimientoSeleccionado: any = null;
  seguimientoPlantas: any[] = [];
  seguimientoLineas: any[] = [];
  private subscription = new Subscription();
  subscriptions: Subscription[] = [];

  plantaProductoForm: FormGroup;
  idRevision: number = 0;

  constructor(
    private _fb: FormBuilder,
    private _plantaProductoService: PlantaProductoService,
    private _listasService: ListasService,
    private _chRef: ChangeDetectorRef,
    private _alert: AlertsService,
    private _auth: AuthService,
    private _confirmDialog: ConfirmDialogService,
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
    this.loadRevisionesPlanta(this.seguimientoId);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initForm() {
    const fechaActual = new Date();

    this.plantaProductoForm = this._fb.group({
      idUsuarioRegistro: [0],
      idPlanta: [],
      idLinea: [],
      fechaRegistro: [fechaActual],
      producto: ['', Validators.required],
      area: ['', Validators.required],
      observacion: ['', Validators.required],
      compromiso: ['', Validators.required],
      idSeguimientoPlanta: [0, Validators.required],
    });
  }


  private loadInitialData() {
    this.loadData(this._listasService.getListaLineas(), 'listaLineas');
    this.loadData(this._listasService.getListaPlantas(), 'listaPlantas');
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

  private loadRevisionesPlanta(idSeguimiento: number) {
    this.loading = true;
    const subscription = this._plantaProductoService.getRevisionByIdSeguimientoPlanta(idSeguimiento).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaRevisiones = data.result;
          console.log(this.listaRevisiones);
          this._chRef.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error al cargar revisiones: ${err}`);
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
    this.plantaProductoForm.reset();
  }

  RegistrarRevisionesPlanta() {
    if (this.plantaProductoForm.valid) {
      this._confirmDialog.showSaveConfirm('Seguimiento de Planta').subscribe(confirmed => {
        if (confirmed) {
          const data = this.plantaProductoForm.value;
          data.idUsuarioRegistro = this._auth.getUser().Id;
          data.idSeguimientoPlanta = this.seguimientoId;
          console.log(data);
          this._plantaProductoService.createRevisionPlanta(data).subscribe({
            next: (data: any) => {
              if (data.error) {
                this._alert.presentToast("top", data.message, "warning");
              } else {
                this._alert.presentToast("top", "Registro exitoso", "success");
                this.plantaProductoForm.reset();
                this.closeModal();
                this.loadRevisionesPlanta(this.seguimientoId);
                this.initForm();
                this._chRef.detectChanges();
              }
            },
            error: (err) => {
              console.error(`Error al registrar revisiones: ${err}`);
            }
          });
        }
      });
    } else {
      this._alert.presentToast("top", "Debe llenar todos los campos", "warning");
    }
  }

  editarRevisionPlanta(revision: any) {
    this.edit = true;
    this.idRevision = revision.id;
    const revisionSeleccionada = this.listaRevisiones.find(x => x.id == revision.id);
    
    if(revisionSeleccionada) {
      this.displayModal = true;
      this.plantaProductoForm.patchValue({
        idPlanta: revisionSeleccionada.idPlanta,
        idLinea: revisionSeleccionada.idLinea,
        producto: revisionSeleccionada.producto,
        area: revisionSeleccionada.area,
        observacion: revisionSeleccionada.observacion,
        compromiso: revisionSeleccionada.compromiso
      });
    }
  }

  actualizarRevisionPlanta() {
    if (this.plantaProductoForm.valid) {
      this._confirmDialog.showUpdateConfirm('Seguimiento de Planta').subscribe(confirmed => {
        if (confirmed) {
          const data = this.plantaProductoForm.value;
          data.id = this.idRevision;
          data.idSeguimientoPlanta = this.seguimientoId;
          console.log(data);
          this._plantaProductoService.updateRevisionPlanta(this.idRevision, data).subscribe({
            next: (data: any) => {
              if (data.error) {
                this._alert.presentToast("top", data.message, "warning");
              } else {
                this._alert.presentToast("top", "Actualización exitosa", "success");
                this.closeModal();
                this.loadRevisionesPlanta(this.seguimientoId);
                this._chRef.detectChanges();
                this.plantaProductoForm.reset();
                this.initForm();
              }
            },
            error: (err) => {
              console.error(`Error al actualizar revisiones: ${err}`);
            }
          });
        }
      });
    }
  }
  

}
