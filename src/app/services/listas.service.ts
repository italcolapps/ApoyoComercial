import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ListasService {
  private readonly Lista='Lista';
  private readonly Sublista='Sublista';
  private readonly Estado='Estado';
  private readonly Pais = 'Pais';
  private readonly Departamento = 'Departamento';
  private readonly Municipio = 'Municipio';
  private readonly Rol = 'Rol';
  private readonly Planta = 'Planta';
  private readonly Linea = 'Linea';
  private readonly Zona = 'Zona';
  private readonly urlApi = this.__env.apiUrl;

  constructor(
    private __env: EnvService,
    private _http: HttpClient,
  ) { }

  getListaPais() {
    return this._http.get(`${this.urlApi}/${this.Pais}/`);
  }

  getListaDepartamento(id:number){
    return this._http.get(`${this.urlApi}/${this.Departamento}/GetDepartamentoByIdPais/${id}`);
  }

  getListaMunicipio(id:number){
    return this._http.get(`${this.urlApi}/${this.Municipio}/GetMunicipioByIdDepartamento/${id}`);
  }

  getListas(id:number){
    return this._http.get(`${this.urlApi}/${this.Lista}/GetListaByIdTipoLista/${id}`);
  }

  getEstadoByIdEstado(id:number){
    return this._http.get(`${this.urlApi}/${this.Estado}/GetEstadoByIdTipoEstado/${id}`);
  }

  getListaRoles() {
    return this._http.get(`${this.urlApi}/${this.Rol}/`);
  }

  getListaPlantas() {
    return this._http.get(`${this.urlApi}/${this.Planta}/`);
  }

  getListaLineas() {
    return this._http.get(`${this.urlApi}/${this.Linea}/`);
  }

  getListaZonas() {
    return this._http.get(`${this.urlApi}/${this.Zona}/`);
  }

}
