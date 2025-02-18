import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SeguimientoStateService } from '../services/seguimiento-state.service';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AlertsService } from '../services/alerts.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss']
})
export class TabsPage implements OnInit {
  menuCollapsed = false;
  showLateralMenu = false;
  seguimientoId: string | null = null;
  userData: any = {};
  RolText: string = '';

  tabs = [
    { label: 'Seguimiento', route: 'seguimiento-planta', icon: 'pi pi-calendar-clock', isSubMenuTrigger: false },
    { label: 'Clientes',    route: 'clientes',   icon: 'pi pi-users', isSubMenuTrigger: false },
    { label: 'Reportes',    route: '',   icon: 'pi pi-chart-line', isSubMenuTrigger: false },
    { label: 'Usuarios',    route: 'usuarios',   icon: 'pi pi-user', isSubMenuTrigger: false },
    { label: 'Salir',       action: 'signOut',   icon: 'pi pi-power-off', isSubMenuTrigger: false }
  ];

  subMenuItems = [
    { label: 'Visita Planta',    route: 'seguimiento-planta',  icon: 'pi pi-building' },
    { label: 'Visita Clientes',  route: 'visita-cliente',      icon: 'pi pi-users' },
    { label: 'Oportunidades',    route: 'oportunidades',       icon: 'pi pi-briefcase' },
    { label: 'Evaluación',       route: 'evaluaciones',       icon: 'pi pi-star' },
    { label: 'Planta-Prod',      route: 'planta-producto',     icon: 'pi pi-check-square' },
    { label: 'Ventas',      route: 'analitica',     icon: 'custom-peso' },
    { label: 'Informe',      route: 'reporte-actividades',     icon: 'pi pi-file-check' }
  ];

  menuItems = [
    { label: 'Visita Clientes',  route: 'visita-cliente',      icon: 'pi pi-users' },
    { label: 'Oportunidades',    route: 'oportunidades',       icon: 'pi pi-briefcase' },
    { label: 'Evaluación',       route: 'evaluaciones',        icon: 'pi pi-star' },
    { label: 'Planta-Prod',      route: 'planta-producto',     icon: 'pi pi-check-square' },
    { label: 'Ventas',           route: 'analitica',           icon: 'custom-peso' },
    { label: 'Informe',          route: 'reporte-actividades', icon: 'pi pi-file-check' }
  ];

  showSubMenu = false;

  constructor(
    private router: Router,
    private _auth: AuthService,
    private seguimientoState: SeguimientoStateService,
    private _utilidadService: AlertsService
  ) {}

  ngOnInit() {
    this.userData = this._auth.getUser();
    this.RolText = this._auth.getUser().Rol === 1 ? 'ADMINISTRADOR' : 'DIRECTOR DE LINEA';


    // Mostrar/ocultar menú lateral según la ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showLateralMenu = event.url.includes('/menu-seguimiento');
    });

    // Suscribirse a los eventos de navegación
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // No modificar showSubMenu durante la navegación entre opciones del submenú
        const currentRoute = event.urlAfterRedirects;
        const isSubMenuRoute = this.subMenuItems.some(item => 
          currentRoute.includes(`/tabs/${item.route}`)
        );
        
        // Solo ocultar el menú si navegamos fuera de las rutas del submenú
        if (!isSubMenuRoute && !currentRoute.includes('/tabs/seguimiento')) {
          this.showSubMenu = false;
        }
      });
  }

  trackByRoute(index: number, tab: any) {
    return tab.route || tab.action;
  }

  trackBySubRoute(index: number, item: any) {
    return item.route;
  }

  toggleSubMenu() {
    this.showSubMenu = !this.showSubMenu;
  }

  handleAction(action: string) {
    switch(action) {
      case 'signOut':
        this.signOut();
        break;
      // Puedes agregar más casos si tienes otras acciones
      default:
        break;
    }
  }

  signOut(){
    this._auth.cleanSession();
    this.router.navigate(['/login']).then(() => {
      this._utilidadService.presentToast("bottom", "Sesión cerrada exitosamente.", "info");
    });

  }
}
