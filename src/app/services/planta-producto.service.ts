import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class PlantaProductoService {
  private readonly RevisionPlanta = 'RevisionPlanta';
  private readonly urlApi = this.__env.apiUrl;

  constructor(
    private __env: EnvService,
    private _http: HttpClient,
  ) { }

  getRevisionPlanta() {
    return this._http.get(`${this.urlApi}/${this.RevisionPlanta}`);
  }

  getRevisionByIdPlanta(idPlanta: number) {
    return this._http.get(`${this.urlApi}/${this.RevisionPlanta}/GetRevisionByIdPlanta/${idPlanta}`);
  }

  getRevisionByIdSeguimientoPlanta(idSeguimientoPlanta: number) {
    return this._http.get(`${this.urlApi}/${this.RevisionPlanta}/GetRevisionByIdSeguimientoPlanta/${idSeguimientoPlanta}`);
  }

  getRevisionByIdLinea(idLinea: number) {
    return this._http.get(`${this.urlApi}/${this.RevisionPlanta}/GetRevisionByIdLinea/${idLinea}`);
  }

  createRevisionPlanta(data: any) {
    return this._http.post(`${this.urlApi}/${this.RevisionPlanta}`, data);
  }

  updateRevisionPlanta(idRevision: number, data: any) {
    return this._http.put(`${this.urlApi}/${this.RevisionPlanta}/ActualizarRevision/${idRevision}`, data);
  }

}
