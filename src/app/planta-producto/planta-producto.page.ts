import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-planta-producto',
  templateUrl: './planta-producto.page.html',
  styleUrls: ['./planta-producto.page.scss'],
})
export class PlantaProductoPage implements OnInit {
  // Variables para la tabla
  listaPlantas: any[] = [];
  loading: boolean = true;

  // Variables para el diálogo
  dialogVisible: boolean = false;
  editMode: boolean = false;
  plantaForm: FormGroup;
  selectedPlanta: any = null;

  // Opciones para el multiselect de líneas
  lineasOptions: any[] = [];

  constructor(
    private _fb: FormBuilder,
    private _chRef: ChangeDetectorRef
  ) {
    this.plantaForm = this._fb.group({
      idPlanta: [0],
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
      observaciones: ['', Validators.required],
      idUsuarioRegistro: [0],
      linea: [[], Validators.required]
    });
  }

  ngOnInit() {
    this.cargarPlantas();
    this.cargarLineas();
  }

  cargarPlantas() {
    // TODO: Implementar llamada al servicio
    this.loading = true;
    // Simulación de datos
    this.listaPlantas = [
      {
        idPlanta: 1,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        observaciones: "Prueba",
        idUsuarioRegistro: 1,
        linea: [1, 2]
      }
    ];
    this.loading = false;
  }

  cargarLineas() {
    // TODO: Implementar llamada al servicio
    this.lineasOptions = [
      { id: 1, nombre: 'Línea 1' },
      { id: 2, nombre: 'Línea 2' },
      { id: 3, nombre: 'Línea 3' }
    ];
  }

  showDialog() {
    this.editMode = false;
    this.plantaForm.reset({
      idPlanta: 0,
      fechaInicio: null,
      fechaFin: null,
      observaciones: '',
      idUsuarioRegistro: 0,
      linea: []
    });
    this.dialogVisible = true;
  }

  hideDialog() {
    this.dialogVisible = false;
    this.selectedPlanta = null;
  }

  editarPlanta(planta: any) {
    this.editMode = true;
    this.selectedPlanta = { ...planta };
    this.plantaForm.patchValue({
      idPlanta: planta.idPlanta,
      fechaInicio: new Date(planta.fechaInicio),
      fechaFin: new Date(planta.fechaFin),
      observaciones: planta.observaciones,
      idUsuarioRegistro: planta.idUsuarioRegistro,
      linea: planta.linea
    });
    this.dialogVisible = true;
  }

  guardarPlanta() {
    if (this.plantaForm.valid) {
      const planta = this.plantaForm.value;
      // TODO: Implementar llamada al servicio
      console.log('Planta a guardar:', planta);
      this.hideDialog();
      this.cargarPlantas();
    }
  }
}
