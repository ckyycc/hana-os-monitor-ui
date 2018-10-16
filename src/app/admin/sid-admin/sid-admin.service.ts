import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/index";
import { SIDInfo, SIDMapping } from "../../util/consts-classes";

@Injectable()
export class SIDAdminService {

  constructor(private http: HttpClient) {}
  private sidsUrl = 'api/sids';
  private sidMappingUrl = 'api/sids/mappings';
  //for SIDs
  getSIDsInfo(): Observable<SIDInfo[]> {
    return this.http.get<SIDInfo[]>(this.sidsUrl);
  }

  /** PUT: update the employee location info on the server */
  updateSIDInfo (sidInfo: SIDInfo): Observable<any> {
    return this.http.put(this.sidsUrl, sidInfo);
  }

  deleteSIDInfo (sidInfo: SIDInfo): Observable<any> {

    const sid = sidInfo.sid;
    const serverId = sidInfo.serverId;
    const url = `${this.sidsUrl}/${serverId},${sid}`;
    return this.http.delete<SIDInfo>(url);
  }

  addSIDInfo(sidInfo: SIDInfo): Observable<SIDInfo> {
    return this.http.post<SIDInfo>(this.sidsUrl, sidInfo);
  }

  //for SID mappings
  getSIDMappings(): Observable<SIDMapping[]> {
    return this.http.get<SIDMapping[]>(this.sidMappingUrl);
  }

  updateSIDMapping (sidMapping: SIDMapping): Observable<any> {
    return this.http.put(this.sidMappingUrl, sidMapping);
  }

  addSIDMapping (sidMapping: SIDMapping): Observable<SIDMapping> {
    return this.http.post<SIDMapping>(this.sidMappingUrl, sidMapping);
  }

  /** DELETE: delete the employee location info from the server */
  deleteSIDMapping (sidMapping: SIDMapping): Observable<SIDMapping> {
    const sidStart = sidMapping.sidStart;
    const sidEnd = sidMapping.sidEnd;
    const userId = sidMapping.employeeId;
    const url = `${this.sidMappingUrl}/${userId},${sidStart},${sidEnd}`;

    return this.http.delete<SIDMapping>(url);
  }

  generateSIDByMapping():Observable<any> {
    return this.http.put(`${this.sidMappingUrl}/generate`, null);
  }
}
