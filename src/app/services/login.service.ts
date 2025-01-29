import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly Login = 'Login';
  private urlApi = this.__env.apiUrl;

  constructor(
    private __env:EnvService,
    private _http: HttpClient
  ) {
    this.urlApi = this.__env.apiUrl;
    }

    logIn(data:any){
      return this._http.post(`${this.urlApi}/${this.Login}`,data);
    }
}
