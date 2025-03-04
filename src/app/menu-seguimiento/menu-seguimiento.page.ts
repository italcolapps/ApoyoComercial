import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SeguimientoStateService } from '../services/seguimiento-state.service';
import { Subscription } from 'rxjs';
import { SeguimientoPlantaService } from '../services/seguimiento-planta.service';
import { VisitaClientesService } from '../services/visita-clientes.service';
import { EvaluacionService } from '../services/evaluacion.service';
import { PlantaProductoService } from '../services/planta-producto.service';
import { OportunidadesService } from '../services/oportunidades.service';
import { AnaliticaService } from '../services/analitica.service';

interface MenuItem {
  tooltip: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-menu-seguimiento',
  templateUrl: './menu-seguimiento.page.html',
  styleUrls: ['./menu-seguimiento.page.scss'],
})
export class MenuSeguimientoPage implements OnInit, OnDestroy {
  seguimientoId: number | null = null;
  seguimientoPlanta: any = null;
  seguimientoSeleccionado: any = null;
  private subscription: Subscription = new Subscription();
  menuItems: MenuItem[] = [
    { tooltip: 'Visita Clientes',    route: 'visita-cliente',      icon: 'pi pi-users' },
    { tooltip: 'Oportunidades',      route: 'oportunidades',       icon: 'pi pi-briefcase' },
    { tooltip: 'Evaluación GDZ',     route: 'evaluaciones',        icon: 'test-icon' },
    { tooltip: 'Planta-Prod',        route: 'planta-producto',     icon: 'factory-icon' },
    { tooltip: 'Ventas',             route: 'analitica',           icon: 'peso-icon' },
    { tooltip: 'Plan de Mercadeo',   route: 'plan-mercadeo',       icon: 'marketing-icon' },
  ];

  menuCollapsed = false;

  listaVisitaClientes: any = [];
  listaEvaluaciones: any[] = [];
  listaRevisiones: any[] = [];
  listaOportunidades: any[] = [];
  listaReportesAnalitica: any[] = [];
  
  listaEvaluacionMercadeo: any[] = []; 

  toggleMenu() {
    this.menuCollapsed = !this.menuCollapsed;
  }

  constructor(
    private router: Router,
    private seguimientoState: SeguimientoStateService,
    private _evaluacionesService: EvaluacionService,
    private seguimientoPlantaService: SeguimientoPlantaService,
    private _plantaProductoService: PlantaProductoService,
    private _oportunidadesService: OportunidadesService,
    private _seguimientoVisitaService: VisitaClientesService,
    private analiticaService: AnaliticaService,
    private _chRef: ChangeDetectorRef
  ) {
    this.subscription.add(
      this.seguimientoState.selectedSeguimientoId$.subscribe(
        id => {
          this.seguimientoId = id;
          console.log('ID del seguimiento seleccionado:', this.seguimientoId);
          if (!id) {
            // Si no hay ID, redirigir de vuelta a la lista
            this.router.navigate(['/tabs/seguimiento-planta']);
          }
        }
      )
    );

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as { seguimientoId: number };
      if (state.seguimientoId) {
        this.seguimientoId = state.seguimientoId;
      }
    }
  }

  ngOnInit() {
    // Primero intentamos obtener el seguimiento del state service
    this.subscription.add(
      this.seguimientoState.selectedSeguimiento$.subscribe(seguimiento => {
        if (seguimiento) {
          this.seguimientoSeleccionado = seguimiento;
          this._chRef.detectChanges();
        }
      })
    );

    if (!this.seguimientoId) {
      this.router.navigate(['/tabs/seguimiento-planta']);
    } else {
      this.getSeguimientoPlanta();
    }
  }
  
  ngAfterViewInit() {
    if (this.seguimientoId) {
      this.loadVisitaClientes(this.seguimientoId);
      this.loadOportunidades(this.seguimientoId);
      this.loadEvaluaciones(this.seguimientoId);
      this.loadRevisionesPlanta(this.seguimientoId);
      this.loadReportesAnalitica(this.seguimientoId);
      this.loadEvaluacionesMercadeo(this.seguimientoId);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  navigateTo(route: string) {
    if (this.seguimientoId) {
      this.seguimientoState.setSeguimientoId(this.seguimientoId);
      this.seguimientoState.setSeguimiento(this.seguimientoSeleccionado);
      
      this.router.navigate(['/tabs/' + 'menu-seguimiento/' + route], { 
        state: { 
          seguimientoId: this.seguimientoId,
          seguimiento: this.seguimientoSeleccionado 
        } 
      });
    }
  }

  getSeguimientoPlanta(): Subscription | undefined {
    if (!this.seguimientoId) {
      return undefined;
    }
    
    const subscription = this.seguimientoPlantaService.getSeguimientoPlanta().subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.seguimientoPlanta = data.result;
          console.log('Seguimientos cargados:', this.seguimientoPlanta);
          
          if (this.seguimientoId && this.seguimientoPlanta) {
            this.seguimientoSeleccionado = this.seguimientoPlanta.find(
              (seguimiento: any) => seguimiento.id === this.seguimientoId
            );
            
            if (this.seguimientoSeleccionado) {
              console.log('Seguimiento seleccionado:', this.seguimientoSeleccionado);
              this.seguimientoState.setSeguimiento(this.seguimientoSeleccionado);
            } else {
              console.error('No se encontró el seguimiento con ID:', this.seguimientoId);
              this.router.navigate(['/tabs/seguimiento-planta']);
            }
          }
          
          this._chRef.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('Error al obtener seguimientos:', error);
        this.router.navigate(['/tabs/seguimiento-planta']);
      }
    });


    this.subscription.add(subscription);
    return subscription;
  }

  private loadVisitaClientes(idSeguimiento: number) {
    const subscription = this._seguimientoVisitaService.getVisitaClienteBySeguimientoPlanta(idSeguimiento).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaVisitaClientes = data.result;
          console.log(this.listaVisitaClientes);
          this._chRef.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error al cargar Visita del Cliente: ${err}`);
      }
    });

  }

  private loadOportunidades(idSeguimiento: number) {
    const subscription = this._oportunidadesService.getOportunidadByIdSeguimientoPlanta(idSeguimiento).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaOportunidades = data.result;
          console.log(this.listaOportunidades);          
          this._chRef.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error al cargar Oportunidades: ${err}`);
      }
    });
    // this.subscriptions.push(subscription);
  }

  private loadEvaluaciones(idSeguimiento: number) {
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
        // this.loading = false;
      },
      error: (err) => {
        console.error(`Error al cargar evaluaciones: ${err}`);
        // this.loading = false;
      }
    });
    // this.subscriptions.push(subscription);
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
      case 'CUMPLE PARCIAL':
        return 'CP';
      case 'NO CUMPLE':
        return 'NC';
      default:
        return '';
    }
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

  getTooltipText(respuesta: string): string {
    switch (respuesta) {
      case 'SOBRE PASA':
        return 'SOBRE PASA';
      case 'CUMPLE':
        return 'CUMPLE';
      case 'CUMPLE PARCIAL':
        return 'CUMPLE PARCIAL';
      case 'NO CUMPLE':
        return 'NO CUMPLE';
      default:
        return '';
    }
  }

  private loadRevisionesPlanta(idSeguimiento: number) {
    const subscription = this._plantaProductoService.getRevisionByIdSeguimientoPlanta(idSeguimiento).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaRevisiones = data.result;
          console.log(this.listaRevisiones);
          this._chRef.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error al cargar revisiones: ${err}`);
      }
    });
    // this.subscriptions.push(subscription);
  }

  private loadReportesAnalitica(idSeguimiento: number) {
    const subscription = this.analiticaService.getReporteAnaliticaByIdSeguimientoPlanta(idSeguimiento).subscribe({
      next: (data: any) => {
        if (data.error) { 
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaReportesAnalitica = data.result;
          console.log(this.listaReportesAnalitica);  
          this._chRef.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error al cargar reportes: ${err}`);
      }
    });
  }

  loadEvaluacionesMercadeo(idSeguimiento: number) {
    const subscription = this._evaluacionesService.getEvaluacionMercadeoByIdSeguimientoPlanta(idSeguimiento).subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this.listaEvaluacionMercadeo = data.result;
          console.log(this.listaEvaluacionMercadeo);
          this._chRef.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error al cargar evaluaciones: ${err}`);
      }
    });
  }



}
