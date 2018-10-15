import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/index";
import { Configuration } from "../../util/consts-classes";

@Injectable()
export class ConfigAdminService {

  constructor(private http: HttpClient) {}
  private cnofigUrl = 'api/configurations';

  getConfigurations(): Observable<Configuration[]> {
    return this.http.get<Configuration[]>(this.cnofigUrl);
  }

  updateConfiguration (config: Configuration): Observable<any> {
    return this.http.put(this.cnofigUrl, config);
  }
}
