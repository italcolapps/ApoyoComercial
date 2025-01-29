import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  public apiUrl = 'https://italapp.italcol.com/ApiComercial/api';
  //  public apiUrl = 'https://localhost:7161/api';
   public VAPID_PUBLIC_KEY = 'BGKeM_GR4siepwouvcW0fla86tZFcIIjAwU8eMnwMnnvMF6Wr9Jsidw8W5Bewc8r4EOfp1GwM6WRQGcYsKFOB0M';


  constructor() { }
}
