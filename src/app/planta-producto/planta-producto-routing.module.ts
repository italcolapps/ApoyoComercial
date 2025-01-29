import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlantaProductoPage } from './planta-producto.page';

const routes: Routes = [
  {
    path: '',
    component: PlantaProductoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlantaProductoPageRoutingModule {}
