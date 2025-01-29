import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  constructor(
    private _toast: ToastController,
    private _alert: AlertController) { }

  async presentAlert(message: string, title: string = message) {
    const alert = await this._alert.create({
      header: title,
      message: message,
      buttons: ["Ok"]
    });
    await alert.present();
  }

  // async presentSwalAlert(options: SweetAlertOptions) {
  //   return await Swal.fire(options);
  // }

  // async showConfirmation(): Promise<boolean> {
  //   const result = await this.presentSwalAlert({
  //     title: '¡Atención!',
  //     text: '¿Deseas continuar?',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Sí, continuar',
  //     cancelButtonText: 'No, cancelar'
  //   });

  //   if (result.isConfirmed) {
  //     await Swal.fire('¡Hecho!', 'Has elegido continuar.', 'success');
  //     return true;
  //   } else if (result.isDismissed) {
  //     await Swal.fire('Cancelado', 'Has elegido no continuar.', 'error');
  //     return false;
  //   }

  //   return false;
  // }

  // async success(message: string, title: string = 'Success') {
  //   return this.presentSwalAlert({
  //     title: title,
  //     text: message,
  //     icon: 'success'
  //   });
  // }

  // async warning(message: string, title: string = 'Warning') {
  //   return this.presentSwalAlert({
  //     title: title,
  //     text: message,
  //     icon: 'warning'
  //   });
  // }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string, type: 'info' | 'error' | 'warning' | 'success') {
    let colorMessage = { info: "primary", error: "danger", warning: "warning", success: "success" };

    const toast = await this._toast.create({
      message: message,
      duration: 10000,
      position: position,
      color: colorMessage[type],
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
