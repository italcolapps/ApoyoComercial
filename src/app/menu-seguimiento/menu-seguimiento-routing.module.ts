import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuSeguimientoPage } from './menu-seguimiento.page';

const routes: Routes = [
  {
    path: '',
    component: MenuSeguimientoPage
  },
  {
    path: 'visita-cliente',
    loadChildren: () => import('../visita-cliente/visita-cliente.module').then(m => m.VisitaClientePageModule)
  },
  {
    path: 'oportunidades',
    loadChildren: () => import('../oportunidades/oportunidades.module').then(m => m.OportunidadesPageModule)
  },
  {
    path: 'evaluaciones',
    loadChildren: () => import('../evaluaciones/evaluaciones.module').then(m => m.EvaluacionesPageModule)
  },
  {
    path: 'planta-producto',
    loadChildren: () => import('../planta-producto/planta-producto.module').then(m => m.PlantaProductoPageModule)
  },
  {
    path: 'analitica',
    loadChildren: () => import('../analitica/analitica.module').then(m => m.AnaliticaPageModule)
  },
  {
    path: 'reporte-actividades',
    loadChildren: () => import('../reporte-actividades/reporte-actividades.module').then(m => m.ReporteActividadesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuSeguimientoPageRoutingModule {}
