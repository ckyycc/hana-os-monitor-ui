import { Injectable } from '@angular/core';
import {Employee, Instance} from '../util/consts-classes'
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})


export class InstanceService {

  private instancesUrl = 'api/instances';
  constructor(private http: HttpClient) { }

  getInstances(): Observable<Instance[]> {
    return this.http.get<Instance[]>(this.instancesUrl);
  }
}
