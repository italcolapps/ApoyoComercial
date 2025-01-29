import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AlertsService } from '../services/alerts.service'; // Asegúrate de importar AlertsService si no lo has hecho

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss']
})
export class TabsPage implements OnInit {
  userData: any = {};
  RolText: string = '';

  tabs = [
    { label: 'Seguimiento', route: '', icon: 'pi pi-calendar-clock', isSubMenuTrigger: true },
    { label: 'Clientes',    route: 'clientes',   icon: 'pi pi-users', isSubMenuTrigger: false },
    { label: 'Reportes',    route: 'reportes',   icon: 'pi pi-chart-line', isSubMenuTrigger: false },
    { label: 'Usuarios',    route: 'usuarios',   icon: 'pi pi-user', isSubMenuTrigger: false },
    { label: 'Salir',       action: 'signOut',   icon: 'pi pi-power-off', isSubMenuTrigger: false }
  ];

  subMenuItems = [
    { label: 'Visita Planta',    route: 'seguimiento-planta',  icon: 'pi pi-building' },
    { label: 'Visita Clientes',  route: 'visita-cliente',      icon: 'pi pi-users' },
    { label: 'Oportunidades',    route: 'oportunidades',       icon: 'pi pi-briefcase' },
    { label: 'Evaluación',       route: 'evaluaciones',       icon: 'pi pi-star' },
    { label: 'Planta-Prod',      route: 'planta-producto',     icon: 'pi pi-check-square' }
  ];
  

  showSubMenu = false;

  constructor(
    private router: Router,
    private _auth: AuthService,
    private _chRef: ChangeDetectorRef,
    private _utilidadService: AlertsService // Inyecta el servicio de alertas si no lo has hecho
  ) {
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

  ngOnInit() {
    this.userData = this._auth.getUser();
    this.RolText = this._auth.getUser().Rol === 1 ? 'ADMINISTRADOR' : 'DIRECTOR DE LINEA';
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
