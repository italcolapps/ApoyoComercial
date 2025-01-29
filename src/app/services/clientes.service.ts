import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private readonly Cliente = 'Cliente';
  private readonly urlApi = this.__env.apiUrl;

  constructor(
    private __env: EnvService,
    private _http: HttpClient,
  ) { }

  getListaClientes() {
    return this._http.get(`${this.urlApi}/${this.Cliente}/`);
  }

  getCliente(idCliente: number) {
    return this._http.get(`${this.urlApi}/${this.Cliente}/${idCliente}`);
  }

  getClienteByIdLinea(idLinea: number) {
    return this._http.get(`${this.urlApi}/${this.Cliente}/GetClienteByIdLinea/${idLinea}`);
  }

  createCliente(data:any){
    return this._http.post(`${this.urlApi}/${this.Cliente}/`,data);
  }

  updateCliente(idCliente: number, data: any) {
    return this._http.put(`${this.urlApi}/${this.Cliente}/ActualizarCliente/${idCliente}`, data);
  }
}
