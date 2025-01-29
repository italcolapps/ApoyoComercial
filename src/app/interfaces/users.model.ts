export interface Users{
    id:number;
    nombre:string;
    apellido:string;
    email:string;
    fechaRegistro:Date;
    rol:number;
    estacion:number;
    rolText:string;
    sede:string;
    cargo:string;
    telefono:number;
    documento:number;
    empresa?:number;
}