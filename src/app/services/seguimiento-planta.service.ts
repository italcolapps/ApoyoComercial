import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeguimientoPlantaService {
  private readonly SeguimientoPlanta = 'SeguimientoPlanta';
  private readonly urlApi = this.__env.apiUrl;

  constructor(
    private __env: EnvService,
    private _http: HttpClient,
  ) { }

  getListaSeguimiento() {
    return this._http.get(`${this.urlApi}/${this.SeguimientoPlanta}/`);
  }

  getSeguimientoPlantaLinea() {
    return this._http.get(`${this.urlApi}/${this.SeguimientoPlanta}/GetSeguimientoPlantaLinea`);
  }

  getSeguimientoPlanta() {
    return this._http.get(`${this.urlApi}/${this.SeguimientoPlanta}/GetSeguimientoPlanta`);
  }

  getSeguimientoById(idSeguimiento: number) {
    return this._http.get(`${this.urlApi}/${this.SeguimientoPlanta}/${idSeguimiento}`);
  }

  getSeguimientoPlantaByIdLinea(idLinea: number) {
    return this._http.get(`${this.urlApi}/${this.SeguimientoPlanta}/GetSeguimientoPlantaByIdLinea/${idLinea}`);
  }

  getSeguimientoPlantaByIdPlanta(idPlanta: number) {
    return this._http.get(`${this.urlApi}/${this.SeguimientoPlanta}/GetSeguimientoPlantaByIdPlanta/${idPlanta}`);
  }

  getSeguimientoPlantaFiltrado(idUsuario: number, data: any) {
    return this._http.post(`${this.urlApi}/${this.SeguimientoPlanta}/GetSeguimientoPlantaFiltrado?idUsuario=${idUsuario}`, data);
  }

  createSeguimientoPlanta(data: any) {
    return this._http.post(`${this.urlApi}/${this.SeguimientoPlanta}/`, data);
  }

  updateSeguimientoPlanta(idSeguimiento: number, data: any) {
    return this._http.put(`${this.urlApi}/${this.SeguimientoPlanta}/ActualizarSeguimientoPlanta/${idSeguimiento}`, data);
  }

  deleteSeguimientoPlanta(idSeguimiento: number) {
    return this._http.delete(`${this.urlApi}/${this.SeguimientoPlanta}/${idSeguimiento}`);
  }

}
