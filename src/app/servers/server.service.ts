import { Injectable } from '@angular/core';
import { Server, ServerHistory } from '../util/consts-classes'
import { Observable } from "rxjs";
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})


export class ServerService {

  private serversUrl = 'api/servers';
  private historiesUrl = 'api/servers/histories';
  constructor(private http: HttpClient) { }

  getServers(): Promise<Server[]> {
    return this.http.get<Server[]>(this.serversUrl).toPromise();
  }

  /** GET Server by id. Will get 404 if id not found */
  getServer(id: number): Observable<Server> {
    return this.http.get<Server>(`${this.serversUrl}/${id}`);
  }

  getServerHistory(id: number): Observable<ServerHistory> {
    return this.http.get<ServerHistory>(`${this.historiesUrl}/${id}`);
  }
}
