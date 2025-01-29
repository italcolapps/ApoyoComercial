import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeguimientoPlantaPage } from './seguimiento-planta.page';

const routes: Routes = [
  {
    path: '',
    component: SeguimientoPlantaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeguimientoPlantaPageRoutingModule {}
