import { InMemoryDbService } from 'angular-in-memory-web-api';


export class InMemoryServerService implements InMemoryDbService {
  THRESHOLD = {
    CPU: "95-99",
    MEM: "80-90",
    DISK: "80-90"
  };
  SERVER_LIST = [
    { locationId:1, location: 'Palo Alto', id: 1, name: 'llbpal91'},
    { locationId:1, location: 'Palo Alto', id: 2, name: 'llbpal92'},
    { locationId:1, location: 'Palo Alto', id: 3, name: 'llbpal93'},
    { locationId:1, location: 'Palo Alto', id: 4, name: 'llbpal94'},
    { locationId:1, location: 'Palo Alto', id: 5, name: 'llbpal95'},
    { locationId:1, location: 'Palo Alto', id: 6, name: 'llbpal96'},
    { locationId:1, location: 'Palo Alto', id: 7, name: 'llbpal97'},
    { locationId:1, location: 'Palo Alto', id: 8, name: 'llbpal98'},
    { locationId:2, location: 'Vancouver', id: 9, name: 'vanpghana04'},
    { locationId:2, location: 'Vancouver', id: 10, name: 'vanpghana05'},
    { locationId:2, location: 'Vancouver', id: 11, name: 'vanpghana06'},
    { locationId:2, location: 'Vancouver', id: 12, name: 'vanpghana07'},
    { locationId:2, location: 'Vancouver', id: 13, name: 'vanpghana08'},
    { locationId:2, location: 'Vancouver', id: 14, name: 'vanpghana09'},
    { locationId:2, location: 'Vancouver', id: 15, name: 'vanpghana10'},
    { locationId:2, location: 'Vancouver', id: 16, name: 'vanpghana11'},
    { locationId:2, location: 'Vancouver', id: 17, name: 'ls9303'}
  ];
  createDb() {
    let servers = [];
    for (let i = 0; i < this.SERVER_LIST.length; i++) {

      let consumersCPU = [];
      let consumersMEM = [];
      let consumersDISK = [];

      for (let j = 0; j < 5; j++) {
        //generate consumers (10 currently, maybe change it back to 5 later)
        let consumer_cpu = {userName: `ck${i}adm`,  sid: `ck${i}`, owner: `i06663${i}`, consuming: Math.floor((Math.random() * 20) + 10), checkTime:(new Date()).toISOString()};
        let consumer_mem = {userName: `ck${i}adm`,  sid: `ck${i}`, owner: `i06663${i}`, consuming: Math.floor((Math.random() * 256) + 128), checkTime:(new Date()).toISOString()};
        let consumer_disk = {userName: `ck${i}adm`,  sid: `ck${i}`, owner: `i06663${i}`, consuming: Math.floor((Math.random() * 10240) + 256), checkTime:(new Date()).toISOString()};
        consumersCPU.push(consumer_cpu);
        consumersMEM.push(consumer_mem);
        consumersDISK.push(consumer_disk);
      }

      let cpu_resource = {type: 'CPU', value: Math.floor((Math.random() * 70) + 30), total: 100, checkTime: '2018-06-22 14:00', consumers: consumersCPU};
      let mem_resource = {type: 'MEM', value: Math.floor((Math.random() * 70) + 30), total: Math.floor((Math.random() * 512) + 512), checkTime: '2018-06-22 14:00', consumers: consumersMEM};
      let disk_resource = {type: 'DISK', value: Math.floor((Math.random() * 70) + 30), total: Math.floor((Math.random() * 10240) + 10240), checkTime: '2018-06-22 14:00', consumers: consumersDISK};

      let status = Math.max(this.getStatus(cpu_resource.value, cpu_resource.type),
        this.getStatus(mem_resource.value, mem_resource.type),
        this.getStatus(disk_resource.value, disk_resource.type));
      let server = {
        location: { locationId: this.SERVER_LIST[i].locationId, location: this.SERVER_LIST[i].location },
        id: this.SERVER_LIST[i].id,
        name: this.SERVER_LIST[i].name,
        status: status,
        resources: [cpu_resource, mem_resource, disk_resource]};
      servers.push(server);
    }

    let serverHistories = [];

    for (let k = 1; k < 18; k++ ) {
      let time = Date.parse('2018-07-01T17:21:37.288Z');
      let histories = [];
      for (let m = 0; m < 24*14; m++) {
        let diskUsage = Math.floor((Math.random() * 70) + 30);
        let memUsage = Math.floor((Math.random() * 70) + 30);
        let cpuUsage = Math.floor((Math.random() * 90) + 10);
        let dateTime = new Date(time);
        let history = {diskUsage: diskUsage, memUsage: memUsage, cpuUsage: cpuUsage, checkTime: dateTime.toJSON()};
        histories.push(history);
        time = time + 3600000 + Math.floor((Math.random() * 20)) * 60000; //add 1 hour and (0~20 minutes)
      }
      serverHistories.push({id: k, histories: histories});
    }

    let user = {userId:'I055639', firstName: 'Kuang', lastName:'Cheng', role:'super-admin', locIDs:[1,2,3], msg:'OK'};
    let employeesLocation = [];
    for (let i = 0; i < 25; i ++) {
      let employee = {id: employeesLocation.length, userId:'I0556' + i, userName:'CK'+i, userEmail: `kuang.cheng${i}@sap.com`, isAdmin: Math.round(Math.random()) > 0? 'X': ' ', locationId: Math.floor(Math.random() * 4) + 1, locationName: 'Vancouver'+i};
      employeesLocation.push(employee);
    }
    for (let i = 0; i < 25; i ++) {
      let employee = {id: employeesLocation.length, userId:'I0556' + i, userName:'CK'+i, userEmail: `kuang.cheng${i}@sap.com`, isAdmin: Math.round(Math.random()) > 0? 'X': ' ', locationId: Math.floor(Math.random() * 4) + 1, locationName: 'Vancouver'+i + 1};
      employeesLocation.push(employee);
    }
    for (let i = 0; i < 25; i ++) {
      let employee = {id: employeesLocation.length, userId:'I0556' + i, userName:'CK'+i, userEmail: `kuang.cheng${i}@sap.com`, isAdmin: Math.round(Math.random()) > 0? 'X': ' ', locationId: 0, locationName: ' '};
      employeesLocation.push(employee);
    }

    let employees = [];
    for (let i = 0; i < 25; i ++) {
      let employee = {id: i, userId:'I0556' + i, userName:'CK'+i, userEmail: `kuang.cheng${i}@sap.com`, isAdmin: Math.round(Math.random()) > 0? 'X': ' ', isSuperAdmin: Math.round(Math.random()) > 0? 'X': ' '};
      employees.push(employee);
    }

    let sidInfo = [];
    for (let i = 0; i < 50; i ++) {
      let num_server = Math.floor(Math.random() * 4) + 1;
      let num_employee = Math.floor(Math.random() * 20) + 1;
      let sid = {id: i, sid: 'C0' + i, serverId: num_server, serverName: 'Vancouver' + num_server, employeeId: 'I0556' + num_employee, employeeName: 'CK' + num_employee, importantFlag: Math.round(Math.random()) > 0? 'X': ' ', comment:'chengkung' + num_employee};
      sidInfo.push(sid);
    }

    let sidMappings = [];
    for (let i = 0; i < 50; i ++) {
      let num_sid = Math.floor(Math.random() * 4) + 1;
      let num_employee = Math.floor(Math.random() * 20) + 1;
      let sid_mapping = {id: i, sidStart: 'CK' + num_sid, sidEnd: 'CK' + (num_sid + 5), employeeId: 'I0556' + num_employee, employeeName: 'CK' + num_employee};
      sidMappings.push(sid_mapping);
    }
    return {servers: servers, histories: serverHistories, user: user, employees_location:employeesLocation, employees:employees, sids: sidInfo, sidmappings: sidMappings};
  }

  private getStatus(value, type): number {
    let thresholdValues = this.THRESHOLD[type].split("-");
    if (value < thresholdValues[0]) {
      return 0;
    } else if (value >= thresholdValues[0] && value <= thresholdValues[1]) {
      return 1;
    } else {
      return 2;
    }
  }
}
