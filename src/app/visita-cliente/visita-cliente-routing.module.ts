import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitaClientePage } from './visita-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: VisitaClientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitaClientePageRoutingModule {}
