import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly Usuario = 'Usuario';
  private readonly urlApi = this.__env.apiUrl;

  constructor(
    private __env: EnvService,
    private _http: HttpClient,
  ) { }

  getListaUsuarios() {
    return this._http.get(`${this.urlApi}/${this.Usuario}/`);
  }

  getUsuario(idUsuario: number) {
    return this._http.get(`${this.urlApi}/${this.Usuario}/${idUsuario}`);
  }

  getUsuarioByIdLinea(idLinea: number) {
    return this._http.get(`${this.urlApi}/${this.Usuario}/GetUsuarioByIdLinea/${idLinea}`);
  }

  createUsuario(data:any){
    return this._http.post(`${this.urlApi}/${this.Usuario}/`,data);
  }

  updateUsuario(idUsuario: number, data: any) {
    return this._http.put(`${this.urlApi}/${this.Usuario}/ActualizarUsuario/${idUsuario}`, data);
  }

  desactivateUsuario(idUsuario: number, data:any) {
    return this._http.put(`${this.urlApi}/${this.Usuario}/InactivarUsers/${idUsuario}`, data);
  }

  changePassword(data:any){
    return this._http.post(`${this.urlApi}/${this.Usuario}/ChangePassword/`,data);
  }

  validateToken(token:string){
    return this._http.get(`${this.urlApi}/${this.Usuario}/ValidateToken/${token}`);
  }

  SendEmailRecoveryPass(idUser:number){
    return this._http.get(`${this.urlApi}/${this.Usuario}/SendEmailRecoveryPass/${idUser}`);
  }


}

