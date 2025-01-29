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
        path: 'planta-producto',
        loadChildren: () => import('../planta-producto/planta-producto.module').then( m => m.PlantaProductoPageModule)
      },
      {
        path: 'visita-cliente',
        loadChildren: () => import('../visita-cliente/visita-cliente.module').then( m => m.VisitaClientePageModule)
      },
      {
        path: 'oportunidades',
        loadChildren: () => import('../oportunidades/oportunidades.module').then( m => m.OportunidadesPageModule)
      },
      {
        path: 'evaluaciones',
        loadChildren: () => import('../evaluaciones/evaluaciones.module').then( m => m.EvaluacionesPageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/visita-cliente',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
