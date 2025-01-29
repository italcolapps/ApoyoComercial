import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { AlertsService } from '../services/alerts.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup= this.fb.group({
    email: ["", Validators.required],
    password: ["", Validators.required]
  })

  constructor(
    private fb: FormBuilder,
    private  _auth:AuthService,
    private _LoginService:LoginService,
    private _router: Router,
    private _utilidadService:AlertsService
  ) { 

  }
  
  ngOnInit() {
    if(this._auth.isAuthenticated()){
      this._router.navigate(['']);
      this._utilidadService.presentToast("bottom","Inicio de Sesion Exitoso!", "info");
    }
  }

  
  ionViewWillEnter() {
    if(this._auth.isAuthenticated()){
      this._router.navigate(['']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Login exitoso', this.loginForm.value);
    } else {
      console.log('Formulario inválido');
      this.loginForm.markAllAsTouched();
    }
  }

  get emailControl() {
    return this.loginForm.get('email');
  }
  
  get passwordControl() {
    return this.loginForm.get('password');
  }

  
  loginUser(){
    this._auth.cleanSession();
    if (this.loginForm.valid){
      let data = this.loginForm.value;
      this._LoginService.logIn(data).subscribe((x:any)=>{
        if(x.error){
          this._utilidadService.presentToast("bottom",`${x.message}`,"error");
        }else{
          this._auth.setUserLogin(x.result);
          this.loginForm.reset();
        }
      });
    }else{
      this._utilidadService.presentToast("bottom","Credenciales Incorrectas , Verificar informacion del Usuario", "warning");
    }
  }

}
