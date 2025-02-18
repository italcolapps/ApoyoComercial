import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AnaliticaService {
  private readonly Analitica = 'Analitica'
  private readonly urlApi = this.__env.apiUrl

  constructor(
    private __env: EnvService,
    private _http: HttpClient,
  ) { }

  getReportesAnalitica() {
    return this._http.get(`${this.urlApi}/${this.Analitica}/GetReportesAnalitica`);
  }

  getReportesAnaliticaByIdVisita(idVisita: number) {
    return this._http.get(`${this.urlApi}/${this.Analitica}/GetAnaliticaByIdVisita/${idVisita}`);
  }

  getReporteAnaliticaByIdSeguimientoPlanta(idSeguimiento: number) {
    return this._http.get(`${this.urlApi}/${this.Analitica}/GetAnaliticaByIdSeguimientoPlanta/${idSeguimiento}`);
  }

  createReporteAnalitica(data: any) {
    return this._http.post(`${this.urlApi}/${this.Analitica}`, data);
  }

  updateReporteAnalitica(idReporte: number, data: any) {
    return this._http.put(`${this.urlApi}/${this.Analitica}/ActualizarAnalitica/${idReporte}`, data);
  }
}
