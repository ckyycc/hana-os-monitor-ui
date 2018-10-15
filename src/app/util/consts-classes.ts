export const RESOURCE_CPU = "CPU";
export const RESOURCE_MEM = "MEM";
export const RESOURCE_DISK = "DISK";

export const STATUS = {
  PRIMARY: 0,
  ACCENT: 1,
  WARN: 2,
  ERROR: 3
};

export const URL_SERVERS = 'servers';
export const URL_ADMIN = 'admin';
export const URL_NO_AUTH = 'no-auth';
export const URL_LOGIN = 'login';
export const URL_HELP = 'help';

export const SUPPORT_LANGUAGE = [
  {name:'English', value: 'en'},
  {name: 'Deutsch', value: 'de'},
  {name: '한국어', value: 'ko'},
  {name: '简体中文', value: 'zh-CN'}];

export class Consumer {
  userName: string;
  sid: string;    //for MEM and CPU consumers
  folder: string; //for DISK consumers
  owner: string;
  consuming: number;
  checkTime: string;
}

export class Resource {
  type: string;
  value: number;
  total: number;
  status: number;
  checkTime: string;
  consumers: Consumer[];
}
export class Location {
  locationId: number;
  location: string;
}

export class Server {
  location: Location;
  id: number;
  name: string;
  status: number;
  resources: Resource[];
}

export class History {
  diskUsage: number;
  memUsage: number;
  cpuUsage: number;
  checkTime: string;
}
// id is the server id
export class ServerHistory {
  id: number;
  histories: History[];
}

export class Employee {
  employeeId: string;
  employeeName: string;
  email: string;
  isAdmin: string;
  isSuperAdmin: string;
}

export class EmployeeLocation {
  employeeId: string;
  employeeName: string;
  email: string;
  isAdmin: string;
  locationId: number;
  locationName: string;
  oldLocationName: string;
}

export class SIDInfo {
  sid: string;
  serverId: number;
  oldServerId: number;
  serverName: string;
  employeeId: string;
  employeeName: string;
  importantFlag: string;
  comment: string;
}

export class SIDMapping {
  sidStart: string;
  oldSidStart: string;
  sidEnd: string;
  oldSidEnd: string;
  employeeId: string;
  oldEmployeeId: string;
  employeeName: string;
  locations: string;
}

export class Configuration {
  component: string;
  configuration: string;
  value: string;
}
