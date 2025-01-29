import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {
  private readonly Evaluacion = 'Evaluacion'
  private readonly Aspecto = 'Aspecto'
  private readonly Respuesta = 'Respuesta'
  private readonly urlApi = this.__env.apiUrl

  constructor(
    private __env: EnvService,
    private _http: HttpClient,
  ) { }

  getEvaluaciones() {
    return this._http.get(`${this.urlApi}/${this.Evaluacion}/`);
  }

  getEvaluacionWithDetails(idEvaluacion: number) {
    return this._http.get(`${this.urlApi}/${this.Evaluacion}/GetEvaluacionWithDetails/${idEvaluacion}`);
  }

  getEvaluacionByIdGerenteZona(idGerenteZona: number) {
    return this._http.get(`${this.urlApi}/${this.Evaluacion}/GetEvaluacionByIdGerenteZona/${idGerenteZona}`);
  }

  createEvaluacion(data: any) {
    return this._http.post(`${this.urlApi}/${this.Evaluacion}/`, data);
  }

  updateEvaluacion(idEvaluacion: number, data: any) {
    return this._http.put(`${this.urlApi}/${this.Evaluacion}/ActualizarEvaluacion/${idEvaluacion}`, data);
  }

  getAspectos() {
    return this._http.get(`${this.urlApi}/${this.Aspecto}/`);
  }

  getRespuestaByIdAspecto(idAspecto: number) {
    return this._http.get(`${this.urlApi}/${this.Respuesta}/GetRespuestaByIdAspecto/${idAspecto}`);
  }

  getRespuestasByEvaluacion(idEvaluacion: number) {
    return this._http.get(`${this.urlApi}/${this.Respuesta}/GetRespuestasByIdEvaluacion/${idEvaluacion}`);
  }

  getRespuestasByEvaluacionAndAspecto(idEvaluacion: number, idAspecto: number) {
    return this._http.get(`${this.urlApi}/${this.Respuesta}/GetRespuestasByEvaluacionAndAspecto/${idEvaluacion}/${idAspecto}`);
  }

  createRespuesta(data: any) {
    return this._http.post(`${this.urlApi}/${this.Respuesta}/`, data);
  }

  updateRespuesta(idRespuesta: number, data: any) {
    return this._http.put(`${this.urlApi}/${this.Respuesta}/ActualizarRespuesta/${idRespuesta}`, data);
  }

  

}
