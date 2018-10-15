import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { Employee } from "../util/consts-classes";
import { Util } from "../util/util";
@Injectable()
export class AuthenticationService {

  constructor(private http: HttpClient) {
  }

  private userUrl = 'api/users/currentUser';
  public user: Employee;

  logon(): Observable<Employee> {
    // const headers = new HttpHeaders().set('Access-Control-Allow-Origin', 'http://localhost:4200');
    return this.http.get<Employee>(this.userUrl).pipe(
      // delay(5000),
      tap(data => {
        if (Util.checkUserValidity(data)) {
          Util.setCurrentUser(data);
        } else {
          console.error("user not correct!");
        }
      })
    );
  }
}
