import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VisitaClientesService {
  private readonly VisitaCliente = 'VisitaCliente';
  private readonly urlApi = this.__env.apiUrl;

  constructor(
    private __env: EnvService,
    private _http: HttpClient,
  ) { }

  getListaSeguimiento() {
    return this._http.get(`${this.urlApi}/${this.VisitaCliente}/`);
  }

  getVisitaClienteBySeguimientoPlanta(idSeguimiento: number) {
    return this._http.get(`${this.urlApi}/${this.VisitaCliente}/GetVisitaClienteBySeguimientoPlanta/${idSeguimiento}`);
  }

  getVisitaClienteByIdCliente(idCliente: number) {
    return this._http.get(`${this.urlApi}/${this.VisitaCliente}/GetVisitaClienteByIdCliente/${idCliente}`);
  }

  createVisitaCliente(data: any) {
    return this._http.post(`${this.urlApi}/${this.VisitaCliente}/`, data);
  }

  updateVisitaCliente(idVisita: number, data: any) {
    return this._http.put(`${this.urlApi}/${this.VisitaCliente}/ActualizarVisita/${idVisita}`, data);
  }

  deleteVisitaCliente(idVisita: number) {
    return this._http.delete(`${this.urlApi}/${this.VisitaCliente}/${idVisita}`);
  }


}
