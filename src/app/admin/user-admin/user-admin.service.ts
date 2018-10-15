import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/index";
import { Employee, EmployeeLocation } from "../../util/consts-classes";

@Injectable()
export class UserAdminService {

  constructor(private http: HttpClient) {}
  private employeesUrl = 'api/users';
  private employeesLocationUrl = 'api/users/locations';

  //for employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.employeesUrl);
  }

  /** POST: add a new employee to the server */
  addEmployee (employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.employeesUrl, employee);
  }

  /** DELETE: delete the employee location info from the server */
  deleteEmployee (employee: Employee | number): Observable<Employee> {
    const id = typeof employee === 'number' ? employee : employee.employeeId;
    const url = `${this.employeesUrl}/${id}`;

    return this.http.delete<Employee>(url);
    //   .pipe(
    //   tap(_ => console.log(`deleted location with hero id=${id}`)),
    //   catchError(this.handleError<Employee>('deleteEmployee'))
    // );
  }

  /** PUT: update the employee location info on the server */
  updateEmployee (employee: Employee): Observable<any> {
    return this.http.put(this.employeesUrl, employee);
  }

  //for employees and locations
  getEmployeesLocationInfo(): Observable<EmployeeLocation[]> {
    return this.http.get<EmployeeLocation[]>(this.employeesLocationUrl);
  }

  /** POST: add a new employee location info to the server */
  addEmployeeLocation (employeeLocation: EmployeeLocation): Observable<EmployeeLocation> {
    return this.http.post<EmployeeLocation>(this.employeesLocationUrl, employeeLocation);
  }

  /** DELETE: delete the employee location info from the server */
  deleteEmployeeLocation (employeeLocation: EmployeeLocation): Observable<EmployeeLocation> {
    const employeeId = employeeLocation.employeeId;
    const locationName = employeeLocation.locationName;
    const url = `${this.employeesLocationUrl}/${employeeId},${locationName}`;

    return this.http.delete<EmployeeLocation>(url);
  }

  /** PUT: update the employee location info on the server */
  updateEmployeeLocation (employeeLocation: EmployeeLocation): Observable<any> {
    return this.http.put(this.employeesLocationUrl, employeeLocation);
  }
}
