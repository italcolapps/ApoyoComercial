import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'usuarios',
        loadChildren: () => import('../usuarios/usuarios.module').then( m => m.UsuariosPageModule)
      },
      {
        path: 'clientes',
        loadChildren: () => import('../clientes/clientes.module').then( m => m.ClientesPageModule)
      },
      {
        path: 'seguimiento-planta',
        loadChildren: () => import('../seguimiento-planta/seguimiento-planta.module').then( m => m.SeguimientoPlantaPageModule)
      },
      {
        path: 'menu-seguimiento',
        loadChildren: () => import('../menu-seguimiento/menu-seguimiento.module').then( m => m.MenuSeguimientoPageModule)
      },
      {
        path: 'visita-cliente',
        loadChildren: () => import('../visita-cliente/visita-cliente.module').then( m => m.VisitaClientePageModule)
      },
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/seguimiento-planta',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
