import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CryptoService } from './crypto.service';
import { Users } from '../interfaces/users.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  User:any;

  constructor(
    private _encryptService:CryptoService,
    private _router:Router,
    private _jwtHelper:JwtHelperService,
  ) { }

  getUser(){
    let tokenEncrypt = localStorage.getItem("jwt");
    let token = this._encryptService.decrypt(tokenEncrypt!);
    let dataForUser = this._jwtHelper.decodeToken(token);
    this.setUser(dataForUser.payLoad.user);
    return this.User;
  }

  getRol(){
    return this.getUser()?.Rol;
  }

  getLinea(){
    return this.getUser()?.Linea;
  }

  setUserLogin(data:any){
    let token = data.token;
            let tokenEncrypt = this._encryptService.encrypt(token);
            localStorage.setItem("jwt", tokenEncrypt);
            let dataForUser = this._jwtHelper.decodeToken(token);
            this.setUser(dataForUser.payLoad.user);
            this._router.navigate(["/"]);
  }

  setUser(user:Users){
    this.User = <Users>user;
  }

  isAuthenticated():boolean{
    let flag = false;
    try {
      let tokenEncrypt = localStorage.getItem("jwt");
      let token = this._encryptService.decrypt(tokenEncrypt!);
      flag = !this._jwtHelper.isTokenExpired(token);
    } catch (error) {
      flag = false;
    }
    return flag;
  }


  logOut(){
    this.cleanSession();
    this._router.navigate(['login']);
    location.reload();
  }

  cleanSession(){
    localStorage.clear();
    sessionStorage.clear();
    this.User = undefined;
  }
}
