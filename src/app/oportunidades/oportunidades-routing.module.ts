import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OportunidadesPage } from './oportunidades.page';

const routes: Routes = [
  {
    path: '',
    component: OportunidadesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OportunidadesPageRoutingModule {}
