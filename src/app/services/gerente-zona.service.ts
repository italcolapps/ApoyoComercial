import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GerenteZonaService {
  private readonly GerenteZona = 'GerenteZona'
  private readonly urlApi = this.__env.apiUrl

  constructor(
    private __env: EnvService,
    private _http: HttpClient,
  ) { }

  getListaGerenteZona() {
    return this._http.get(`${this.urlApi}/${this.GerenteZona}/`);
  }

  getGerenteZonaByIdPlanta(idPlanta: number) {
    return this._http.get(`${this.urlApi}/${this.GerenteZona}/GetGerenteZonaByIdPlanta/${idPlanta}`);
  }

  getGerenteZonaByidZona(idZona: number) {
    return this._http.get(`${this.urlApi}/${this.GerenteZona}/GetGerenteZonaByidZona/${idZona}`);
  }

  createGerenteZona(data: any) {
    return this._http.post(`${this.urlApi}/${this.GerenteZona}`, data);
  }
  
  updateGerenteZona(idGerenteZona: number, data: any) {
    return this._http.put(`${this.urlApi}/${this.GerenteZona}/ActualizarGerenteZona/${idGerenteZona}`, data);
  }


}
