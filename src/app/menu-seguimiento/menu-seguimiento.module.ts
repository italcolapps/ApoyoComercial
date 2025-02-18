import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MenuSeguimientoPageRoutingModule } from './menu-seguimiento-routing.module';
import { MenuSeguimientoPage } from './menu-seguimiento.page';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuSeguimientoPageRoutingModule,
    CardModule,
    TableModule,
    TagModule,
    MessageModule,
    PanelModule,
    ToolbarModule,
    ButtonModule,
    TabMenuModule,
    AvatarModule,
    MenuModule
  ],
  declarations: [MenuSeguimientoPage]
})
export class MenuSeguimientoPageModule {}
