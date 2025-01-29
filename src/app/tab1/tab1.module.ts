import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Tab1PageRoutingModule,
    InputGroupModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    CardModule,
    InputGroupAddonModule
  ],
  declarations: [Tab1Page],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab1PageModule {}
