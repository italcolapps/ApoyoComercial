import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AlertsService } from '../services/alerts.service';
import { ReportesService } from '../services/reportes.service';
import { ClienteSelectionService } from '../services/cliente-selection.service';

interface ReporteVisita {
  fecharecorrido: string;
  fechaDia: string;
  regional: string;
  planta: string;
  linea: string;
  directorlinea: string;
  fechadia: string;
  cliente: string;
  canal: string;
  ubicacion: string;
  tipocliente: string;
  lineacliente: string;
  toneladas: number;
  actividadesrealizadas: string;
  compromisogerentezona: string;
  compromisodirector: string;
  frecuencia: string;
  calidadinformacion: string;
}

interface ReporteOportunidad {
  idVisita: number;
  canal: string;
  cliente: string;
  ubicacion: string;
  contacto: string;
  toneladas: number;
  descripcionycompromisogerentezona: string;
}

@Component({
  selector: 'app-reporte-actividades',
  templateUrl: './reporte-actividades.page.html',
  styleUrls: ['./reporte-actividades.page.scss'],
})
export class ReporteActividadesPage implements OnInit, OnDestroy {
  selectedCliente: any = null;
  selectedClienteId: number | null = null;
  selectedClienteNombre: string = '';
  listadoReporteVisitas: ReporteVisita[] = [];
  listadoReporteOportunidades: ReporteOportunidad[] = [];
  loading = false;

  subscriptions: Subscription[] = [];
  reporteForm: FormGroup;
  reporteData: ReporteVisita;
  reporteDataOportunidad: ReporteOportunidad;

  constructor(
    private _formBuilder: FormBuilder,
    private _chRef: ChangeDetectorRef,
    private _alert: AlertsService,
    private _auth: AuthService,
    private _reportesService: ReportesService,
    private clienteSelectionService: ClienteSelectionService
  ) { }

  ngOnInit() {
    this.clienteSelectionService.clienteSeleccionado$.subscribe(cliente => {
      if (cliente) {
        this.selectedCliente = cliente;
        this.selectedClienteId = cliente.id;
        this.selectedClienteNombre = cliente.nombre;
      }
    });
    this.initForm();
  }

  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initForm() {
    this.reporteForm = this._formBuilder.group({
      idCliente: [null],
      idUsuario: [null],
      idPlanta: [null],
      fechaInicio: [''],
      fechaFin: [''],
    });
  }

  onClienteChange(event: { id: number, nombre: string }) {
    if (event && event.id) {
      this.selectedClienteId = event.id;
      this.selectedClienteNombre = event.nombre;
      this.getReporteSeguimiento();
      this.getReporteOportunidad();
    } else {
      this.selectedClienteId = null;
      this.selectedClienteNombre = '';
    }
  }

  private getDayName(date: string): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dateObj = new Date(date);
    return days[dateObj.getDay()];
  }

  getReporteSeguimiento() {
    if (this.reporteForm.valid) {
      this.loading = true;
      let data = this.reporteForm.value;
      console.log(data);
      this._reportesService.getReporteVisita(data).subscribe({
        next: (resp: any) => {
          if (resp.error) {
            console.error(`Error: ${resp.message} - code: ${resp.codError} - ${resp.result}`);
            this._alert.presentAlert('Error', resp.message);
          } else {
            this.listadoReporteVisitas = (resp.result as any[]).map((reporte): ReporteVisita => ({
              ...reporte,
              fechaDia: this.getDayName(reporte.fecharecorrido)
            }));
            this.reporteData = this.listadoReporteVisitas[0]; 
            console.log(this.listadoReporteVisitas);
          }
          this.loading = false;
        },
        error: (err) => {
          console.error(`Error al cargar reporte: ${err}`);  
          this.loading = false;
        }
      });
    }
  }

  getReporteOportunidad(){
    if (this.reporteForm.valid) {
      this.loading = true;
      let data = this.reporteForm.value;
      console.log(data);
      this._reportesService.getReporteOportunidad(data).subscribe({
        next: (resp: any) => {
          if (resp.error) {
            console.error(`Error: ${resp.message} - code: ${resp.codError} - ${resp.result}`);
            this._alert.presentAlert('Error', resp.message);
          } else {
            this.listadoReporteOportunidades = resp.result
            this.reporteDataOportunidad = this.listadoReporteOportunidades[0]; 
            console.log(this.listadoReporteOportunidades);
          }
          this.loading = false;
        },
        error: (err) => {
          console.error(`Error al cargar reporte: ${err}`);  
          this.loading = false;
        }
      });
    }
  }

}
