import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnaliticaPage } from './analitica.page';

const routes: Routes = [
  {
    path: '',
    component: AnaliticaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnaliticaPageRoutingModule {}
