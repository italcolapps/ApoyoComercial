import { NgModule } from '@angular/core';
import { BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { InputGroupModule } from 'primeng/inputgroup';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SplitterModule } from 'primeng/splitter';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { CryptoService } from './services/crypto.service';
import { JwtModule } from '@auth0/angular-jwt';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { MessageService } from 'primeng/api';

registerLocaleData(localeEs, 'es');

export function getToken():string{
  let crypto = new CryptoService();
  let trytoken = localStorage.getItem("jwt")
  let token = "";
  if(trytoken != null){
    token = crypto.decrypt(trytoken)
  }
  return token;
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,  
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    ToolbarModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    TabMenuModule,
    InputGroupModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    CardModule,
    ToastModule,
    InputGroupAddonModule,
    SplitterModule,
    JwtModule.forRoot({
      config:{
        tokenGetter: getToken
      }
    }),
  ],
  providers: [
      MessageService,
      ConfirmationService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
