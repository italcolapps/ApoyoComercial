import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlertsService } from '../services/alerts.service';
import { AuthService } from '../services/auth.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { ListasService } from '../services/listas.service';
import { VisitaClientesService } from '../services/visita-clientes.service';
import { ClienteSelectionService } from '../services/cliente-selection.service';
import { ChangeDetectorRef } from '@angular/core';
import { AnaliticaService } from '../services/analitica.service';
import { Router } from '@angular/router';
import { SeguimientoStateService } from '../services/seguimiento-state.service';

@Component({
  selector: 'app-analitica',
  templateUrl: './analitica.page.html',
  styleUrls: ['./analitica.page.scss'],
})
export class AnaliticaPage implements OnInit, OnDestroy {
  displayModal: boolean = false;
  selectedCliente: any = null;
  selectedClienteId: number | null = null;
  selectedClienteNombre: string = '';

  selectedVisita: any = null;
  selectedReporte: any = null;
  listaVisitaClientes: any[] = [];
  listaReportesAnalitica: any[] = [];

  edit: boolean = false;
  idReporte: number = 0;
  loading: boolean = false;

  seguimientoId: number | null = null;
  seguimientoSeleccionado: any = null;
  seguimientoPlantas: any[] = [];
  private subscription = new Subscription();
  subscriptions: Subscription[] = [];

  AnaliticaForm: FormGroup

  constructor(
    private _formBuilder: FormBuilder,
    private _seguimientoVisitaService: VisitaClientesService,
    private _chRef: ChangeDetectorRef,
    private _alert: AlertsService,
    private _auth: AuthService,
    private _confirmDialog: ConfirmDialogService,
    private _listasService: ListasService,
    private clienteSelectionService: ClienteSelectionService,
    private analiticaService: AnaliticaService,
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

    this.loadReportesAnalitica(this.seguimientoId);
    this.initForm();

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initForm() {
    this.AnaliticaForm = this._formBuilder.group({
      idSeguimientoPlanta: [],
      idPlanta: [, Validators.required],
      idUsuarioRegistro: [],
      fechaRegistro: ['', Validators.required],
      presupuestoDirectoMes: [0],
      presupuestoDistribucionMes: [0],
      presupuestoDirectoAno: [0],
      prsupuestoDistribucionAno: [0],
      ventaDirectoMes: [0],
      ventaDistribucionMes: [0],
      ventaDirectoAno: [0],
      ventaDistribucionAno: [0],
      observacion: ['', Validators.required],
    });
  }

  private loadReportesAnalitica(idSeguimiento: number) {
    this.loading = true;
    const subscription = this.analiticaService.getReporteAnaliticaByIdSeguimientoPlanta(idSeguimiento).subscribe({
      next: (data: any) => {
        if (data.error) { 
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaReportesAnalitica = data.result;
          console.log(this.listaReportesAnalitica);  
          this._chRef.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error al cargar reportes: ${err}`);
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
    this.AnaliticaForm.reset();
  }

  RegistrarReporteAnalitica() {
    if (this.AnaliticaForm.valid) {
      this._confirmDialog.showSaveConfirm('Reporte Analitica').subscribe(confirmed => {
        if (confirmed) {
          const data = this.AnaliticaForm.value;
          data.idUsuarioRegistro = this._auth.getUser().Id;
          data.idSeguimientoPlanta = this.seguimientoId;
          console.log(data);
          this.analiticaService.createReporteAnalitica(data).subscribe({
            next: (data: any) => {
              if (data.error) {
                this._alert.presentToast("top", data.message, "warning");
              } else {
                this._alert.presentToast("top", "Reporte Analitica Registrado con Éxito", "success");
                this.AnaliticaForm.reset();
                this.closeModal();
                this.loadReportesAnalitica(this.seguimientoId);
                this._chRef.detectChanges();

              }
            },
            error: (err) => {
              console.error(`Error al registrar reporte: ${err}`);
            }
          });
        }
      });
    }
  }

  editarReporteAnalitica(reporte: any) {
    this.edit = true;
    this.idReporte = reporte.id;
    const reporteSeleccionado = this.listaReportesAnalitica.find((r: any) => r.id === reporte.id);

    if (reporteSeleccionado) {
      this.displayModal = true;
      console.log(reporteSeleccionado);
      this.AnaliticaForm.patchValue({
        idVisita: reporteSeleccionado.idVisita,
        idUsuarioRegistro: reporteSeleccionado.idUsuarioRegistro,
        fechaRegistro: reporteSeleccionado.fechaRegistro,
        presupuestoDirectoMes: reporteSeleccionado.presupuestoDirectoMes,
        presupuestoDistribucionMes: reporteSeleccionado.presupuestoDistribucionMes,
        presupuestoDirectoAno: reporteSeleccionado.presupuestoDirectoAno,
        prsupuestoDistribucionAno: reporteSeleccionado.prsupuestoDistribucionAno,
        ventaDirectoMes: reporteSeleccionado.ventaDirectoMes,
        ventaDistribucionMes: reporteSeleccionado.ventaDistribucionMes,
        ventaDirectoAno: reporteSeleccionado.ventaDirectoAno,
        ventaDistribucionAno: reporteSeleccionado.ventaDistribucionAno,
        observacion: reporteSeleccionado.observacion,
      });
    }
  }

  actualizarReporteAnalitica() {
    if (this.AnaliticaForm.valid) {
      this._confirmDialog.showSaveConfirm('Reporte Analitica').subscribe(confirmed => {
        if (confirmed) {
          const data = this.AnaliticaForm.value;
          data.id = this.idReporte;
          console.log(data);
          this.analiticaService.updateReporteAnalitica(this.idReporte,data).subscribe({
            next: (data: any) => {
              if (data.error) {
                this._alert.presentToast("top", data.message, "warning");
              } else {
                this._alert.presentToast("top", "Reporte Analitica Actualizado con Éxito", "success");
                this.AnaliticaForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                this.loadReportesAnalitica(this.seguimientoId);
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

      // Método para calcular totales
    getTotal(tipo: string): number {
      const form = this.AnaliticaForm.value;
      
      switch(tipo) {
        case 'presupuestoMes':
          return (form.presupuestoDirectoMes || 0) + (form.presupuestoDistribucionMes || 0);
        case 'presupuestoAno':
          return (form.presupuestoDirectoAno || 0) + (form.prsupuestoDistribucionAno || 0);
        case 'ventaMes':
          return (form.ventaDirectoMes || 0) + (form.ventaDistribucionMes || 0);
        case 'ventaAno':
          return (form.ventaDirectoAno || 0) + (form.ventaDistribucionAno || 0);
        default:
          return 0;
      }
    }

    // Método para calcular toneladas faltantes
    getToneladasFaltantes(canal: string, periodo: string): number {
      const form = this.AnaliticaForm.value;
      let presupuesto = 0;
      let venta = 0;

      if (periodo === 'mes') {
        if (canal === 'directo') {
          presupuesto = form.presupuestoDirectoMes || 0;
          venta = form.ventaDirectoMes || 0;
        } else if (canal === 'distribucion') {
          presupuesto = form.presupuestoDistribucionMes || 0;
          venta = form.ventaDistribucionMes || 0;
        } else if (canal === 'total') {
          presupuesto = this.getTotal('presupuestoMes');
          venta = this.getTotal('ventaMes');
        }
      } else if (periodo === 'ano') {
        if (canal === 'directo') {
          presupuesto = form.presupuestoDirectoAno || 0;
          venta = form.ventaDirectoAno || 0;
        } else if (canal === 'distribucion') {
          presupuesto = form.prsupuestoDistribucionAno || 0;
          venta = form.ventaDistribucionAno || 0;
        } else if (canal === 'total') {
          presupuesto = this.getTotal('presupuestoAno');
          venta = this.getTotal('ventaAno');
        }
      }

      return presupuesto - venta;
    }

    // Método para calcular porcentaje de cumplimiento
    getCumplimiento(canal: string, periodo: string): number {
      const form = this.AnaliticaForm.value;
      let presupuesto = 0;
      let venta = 0;

      if (periodo === 'mes') {
        if (canal === 'directo') {
          presupuesto = form.presupuestoDirectoMes || 0;
          venta = form.ventaDirectoMes || 0;
        } else if (canal === 'distribucion') {
          presupuesto = form.presupuestoDistribucionMes || 0;
          venta = form.ventaDistribucionMes || 0;
        } else if (canal === 'total') {
          presupuesto = this.getTotal('presupuestoMes');
          venta = this.getTotal('ventaMes');
        }
      } else if (periodo === 'ano') {
        if (canal === 'directo') {
          presupuesto = form.presupuestoDirectoAno || 0;
          venta = form.ventaDirectoAno || 0;
        } else if (canal === 'distribucion') {
          presupuesto = form.prsupuestoDistribucionAno || 0;
          venta = form.ventaDistribucionAno || 0;
        } else if (canal === 'total') {
          presupuesto = this.getTotal('presupuestoAno');
          venta = this.getTotal('ventaAno');
        }
      }

      return presupuesto === 0 ? 0 : Math.round((venta / presupuesto * 100) * 100) / 100;
    }

}
