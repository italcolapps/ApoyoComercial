import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ListasService } from '../services/listas.service';
import { AlertsService } from '../services/alerts.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Listas } from '../interfaces/listas';
import { UsuariosService } from '../services/usuarios.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit, OnDestroy {
  displayModal = false;
  selectedLinea: any = null;
  listaTipoDocumento: any[] = [];
  listaRoles: any[] = [];
  listaLineas: any[] = [];
  listaPlantas: any[] = [];
  listaUsuarios: any[] = [];
  subscriptions: Subscription[] = [];
  edit = false;
  idUsuario: number;
  loading = false;
  searchTerm: string = '';
  selectedRole: any = null;
  selectedStatus: string = '';
  filteredUsers: any[] = [];

  UsuarioForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    idTipoDocumento: [0, Validators.required],
    numDocumento: ['', Validators.required],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    idRol: [, Validators.required],
    idUsuarioRegistro: [],
    linea: [[], Validators.required]
  });


  constructor(
    private fb: FormBuilder,
    private _listasService: ListasService,
    private _chRef: ChangeDetectorRef,
    private _alert: AlertsService,
    private _usuarioService: UsuariosService,
    private _auth: AuthService,
    private _confirmDialog: ConfirmDialogService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onLineaChange(event: any) {
    if (event.value) {
      this.selectedLinea = event.value.id;
      this.loadUsuariosByLinea(event.value.id);
    } else {
      this.listaUsuarios = [];
    }
  }

  private loadInitialData() {
    this.loadData(this._listasService.getListas(Listas.tipoDocumento), 'listaTipoDocumento');
    this.loadData(this._listasService.getListaRoles(), 'listaRoles');
    this.loadData(this._listasService.getListaLineas(), 'listaLineas');
  }

  private loadData(observable, propertyName: string, detectChanges: boolean = false) {
    const subscription = observable.subscribe({
      next: (data: any) => {
        if (data.error) {
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          this[propertyName] = data.result;
          if (detectChanges) {
            this._chRef.detectChanges();
          }
        }
      },
      error: (err) => {
        console.error(`Error al cargar ${propertyName}: ${err}`);
      }
    });
    this.subscriptions.push(subscription);
  }

  private loadUsuariosByLinea(idLinea: number) {
    this.loading = true;
    const subscription = this._usuarioService.getUsuarioByIdLinea(idLinea).subscribe({
      next: (response: any) => {
        if (response.error) {
          this._alert.presentToast("top", response.message, "warning");
        } else {
          this.listaUsuarios = response.result;
          console.log(this.listaUsuarios);
          this._chRef.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios por línea:', err);
        this._alert.presentToast("top", "Error al cargar los usuarios", "error");
        this.loading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  RegistrarUsuarios() {
    this.edit = false;
    if (this.UsuarioForm.valid) {
      this._confirmDialog.showSaveConfirm('usuario').subscribe(confirmed => {
        if (confirmed) {
          let data = this.UsuarioForm.value;
          data.idUsuarioRegistro = this._auth.getUser().Id;
          data.password = '0123456789';
          console.log(data);  
          
          this._usuarioService.createUsuario(data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Usuario Creado con Éxito", "success");
                this.UsuarioForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                this.loadUsuariosByLinea(this.selectedLinea);
              }
            },
            error: (err) => {
              console.error(`Error al registrar usuario: ${err}`);
              this._alert.presentToast("top", "Error al crear el usuario", "error");
            }
          });
        }
      });
    }
  }

  editarUsuario(usuario: any) {
    this.edit = true;
    this.idUsuario = usuario.id;
    const subscription = this._usuarioService.getUsuario(this.idUsuario).subscribe({
      next: (data: any) => {
        if (data.error) {
          this._alert.presentToast("top", data.message, "warning");
          console.error(`Error: ${data.message} - code: ${data.codError} - ${data.result}`);
        } else {
          const usuarioSeleccionado = data.result;
          if (usuarioSeleccionado) {
            this.displayModal = true;
            this.UsuarioForm.patchValue({
              idTipoDocumento: usuarioSeleccionado.idTipoDocumentoLista,
              numDocumento: usuarioSeleccionado.numDocumento,
              nombre: usuarioSeleccionado.nombre,
              apellido: usuarioSeleccionado.apellido,
              email: usuarioSeleccionado.email,
              telefono: usuarioSeleccionado.telefono,
              idRol: usuarioSeleccionado.idRol,
              linea: usuarioSeleccionado.lineas.map((linea: any) => linea.id)
            });
            this._chRef.detectChanges();
          }
        }
      },
      error: (err) => {
        console.error(`Error al cargar datos del usuario: ${err}`);
        this._alert.presentToast("top", "Error al cargar los datos del usuario", "error");
      }
    });
    this.subscriptions.push(subscription);
  }

  actualizarUsuario() {
    if (this.UsuarioForm.valid) {
      this._confirmDialog.showUpdateConfirm('usuario').subscribe(confirmed => {
        if (confirmed) {
          let data = this.UsuarioForm.value;
          data.id = this.idUsuario;
          this._usuarioService.updateUsuario(this.idUsuario, data).subscribe({
            next: (x: any) => {
              if (x.error) {
                this._alert.presentToast("top", x.message, "warning");
              } else {
                this._alert.presentToast("top", "Usuario Actualizado con Éxito", "success");
                this.UsuarioForm.reset();
                this.closeModal();
                this._chRef.detectChanges();
                this.loadUsuariosByLinea(this.selectedLinea);
              }
            },
            error: (err) => {
              console.error(`Error al actualizar usuario: ${err}`);
              this._alert.presentToast("top", "Error al actualizar el usuario", "error");
            }
          });
        }
      });
    }
  }

  showModal(): void {
    this.displayModal = true;
  }

  closeModal() {
    this.displayModal = false;
    this.edit = false;
    this.UsuarioForm.reset();
  }

  onSubmit(): void {
    if (this.UsuarioForm.valid) {
      console.log('Usuario agregado:', this.UsuarioForm.value);
      this.closeModal();
    }
  }

}


