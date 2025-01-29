import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss']
})
export class Tab1Page implements OnInit {
  visitForm: FormGroup;


  channel = 'Retail';
  location = 'Bogotá, Colombia'; 
  client = 'Juan Pérez'; 
  clientType = 'Mayorista'; 
  line = 'Alimentos Balanceados';
  tonnage = '20'; 

  constructor(private fb: FormBuilder) {

    this.visitForm = this.fb.group({
      visitDate: [null, Validators.required],
      activities: ['', Validators.required],
      commitmentZone: ['', Validators.required],
      commitmentDirector: ['', Validators.required]
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.visitForm.valid) {
      const formData = {
        ...this.visitForm.value,
        channel: this.channel,
        location: this.location,
        client: this.client,
        clientType: this.clientType,
        line: this.line,
        tonnage: this.tonnage
      };

      console.log('Formulario Enviado:', formData);
      // Aquí puedes enviar `formData` al backend
    } else {
      console.log('Formulario Inválido');
    }
  }
}
