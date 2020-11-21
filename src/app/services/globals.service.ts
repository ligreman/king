import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {
  private _NODE_API_URL = '';

  constructor() { }


  get NODE_API_URL(): string {
    return this._NODE_API_URL;
  }

  set NODE_API_URL(value: string) {
    this._NODE_API_URL = value;
  }
}
