import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class OportunidadesService {
  private readonly Oportunidad = 'Oportunidad'
  private readonly urlApi = this.__env.apiUrl

  constructor(
    private __env: EnvService,
    private _http: HttpClient,
  ) { }

  getOportunidades() {
    return this._http.get(`${this.urlApi}/${this.Oportunidad}`);
  }

  getOportunidadByIdVisitaCliente(idVisita: number) {
    return this._http.get(`${this.urlApi}/${this.Oportunidad}/GetOportunidadByIdVisita/${idVisita}`);
  }

  getOportunidadByIdSeguimientoPlanta(idSeguimiento: number) {
    return this._http.get(`${this.urlApi}/${this.Oportunidad}/GetOportunidadByIdSeguimientoPlanta/${idSeguimiento}`);
  }

  createOportunidad(data: any) {
    return this._http.post(`${this.urlApi}/${this.Oportunidad}`, data);
  }

  updateOportunidad(idOportunidad: number, data: any) {
    return this._http.put(`${this.urlApi}/${this.Oportunidad}/ActualizarOportunidad/${idOportunidad}`, data);
  }
}
