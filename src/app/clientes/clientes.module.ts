import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ClientesPage } from './clientes.page';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { BadgeModule } from 'primeng/badge';
import { ClientesPageRoutingModule } from './clientes-routing.module';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { TabMenuModule } from 'primeng/tabmenu';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientesPageRoutingModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    MultiSelectModule,
    FloatLabelModule,
    BadgeModule,
    ToolbarModule,
    SplitButtonModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    TriStateCheckboxModule,
    TabMenuModule
  ],
  declarations: [ClientesPage]
})
export class ClientesPageModule {}
