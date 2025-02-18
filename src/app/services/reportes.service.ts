import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly Reportes = 'Reportes'
  private readonly urlApi = this.__env.apiUrl

  constructor(
    private __env: EnvService,
    private _http: HttpClient,
  ) { }

  getReporteVisita(data:any){
    return this._http.post(`${this.urlApi}/${this.Reportes}/getReporteVisita`,data);
  }

  getReporteOportunidad(data:any){
    return this._http.post(`${this.urlApi}/${this.Reportes}/getReporteOportunidad`,data);
  }



}
