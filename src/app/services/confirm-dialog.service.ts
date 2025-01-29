import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  constructor(private confirmationService: ConfirmationService) { }

  /**
   * Muestra un diálogo de confirmación personalizado
   * @param header Título del diálogo
   * @param message Mensaje del diálogo
   * @param acceptLabel Texto del botón de aceptar (opcional)
   * @param rejectLabel Texto del botón de rechazar (opcional)
   * @returns Observable que emite true si se acepta, false si se rechaza
   */
  showConfirm(
    header: string,
    message: string,
    acceptLabel: string = 'Sí',
    rejectLabel: string = 'No'
  ): Observable<boolean> {
    return new Observable(observer => {
      this.confirmationService.confirm({
        header,
        message,
        acceptLabel,
        rejectLabel,
        accept: () => {
          observer.next(true);
          observer.complete();
        },
        reject: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  /**
   * Muestra un diálogo de confirmación para eliminar
   * @param entityName Nombre de la entidad a eliminar
   * @returns Observable que emite true si se acepta, false si se rechaza
   */
  showDeleteConfirm(entityName: string): Observable<boolean> {
    return this.showConfirm(
      'Confirmar Eliminación',
      `¿Está seguro que desea eliminar este ${entityName}?`,
      'Eliminar',
      'Cancelar'
    );
  }

  /**
   * Muestra un diálogo de confirmación para guardar
   * @param entityName Nombre de la entidad a guardar
   * @returns Observable que emite true si se acepta, false si se rechaza
   */
  showSaveConfirm(entityName: string): Observable<boolean> {
    return this.showConfirm(
      'Confirmar Guardar',
      `¿Está seguro que desea guardar este ${entityName}?`,
      'Guardar',
      'Cancelar'
    );
  }

  /**
   * Muestra un diálogo de confirmación para actualizar
   * @param entityName Nombre de la entidad a actualizar
   * @returns Observable que emite true si se acepta, false si se rechaza
   */
  showUpdateConfirm(entityName: string): Observable<boolean> {
    return this.showConfirm(
      'Confirmar Actualización',
      `¿Está seguro que desea actualizar este ${entityName}?`,
      'Actualizar',
      'Cancelar'
    );
  }
}
