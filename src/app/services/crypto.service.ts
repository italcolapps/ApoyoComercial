import { Injectable } from '@angular/core';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private readonly myKey = environment.encryptionKey;

  constructor() { }

  encrypt(value: string): string {
    return AES.encrypt(value, this.myKey).toString();
  }

  decrypt(value: string): string {
    return AES.decrypt(value, this.myKey).toString(Utf8);
  }
}
