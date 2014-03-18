// Fixture data

function daysInMonth(year, month) {
    return new Date(year, month - 1, 0).getDate();
}

if (Posts.find().count() === 0) {
  var now = new Date();
  
  // create users
  var adminId = Meteor.users.insert({
    username: 'Admin',
    profile: { name: 'Admin' },
    isAdmin: true
  });
  Accounts.setPassword(adminId, 'password');
  
  var approver01Id = Meteor.users.insert({
    username: 'Approver01',
    profile: { name: 'Approver 01' },
    isAdmin: false
  });
  Accounts.setPassword(approver01Id, 'password');
  
  var supervisor01Id = Meteor.users.insert({
    username: 'Supervisor01',
    profile: { name: 'Supervisor 01' },
    isAdmin: false
  });
  Accounts.setPassword(supervisor01Id, 'password');
  
  var user01Id = Meteor.users.insert({
    username: 'User01',
    profile: { name: 'User 01' },
    isAdmin: false
  });
  Accounts.setPassword(user01Id, 'password');
  
  var user02Id = Meteor.users.insert({
    username: 'User02',
    profile: { name: 'User 02' },
    isAdmin: false
  });
  Accounts.setPassword(user02Id, 'password');

  var user03Id = Meteor.users.insert({
    username: 'User03',
    profile: { name: 'User 03' },
    isAdmin: false
  });
  Accounts.setPassword(user03Id, 'password');

  // create Roles
  var adminRole = Roles.insert({
    name: 'Admin',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var supervisorRole = Roles.insert({
    name: 'Supervisor',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var approverRole = Roles.insert({
    name: 'Approver',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var userRole = Roles.insert({
    name: 'User',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  // create Groups
  var grp01 = Groups.insert({
    name: 'Test01',
    nbEmp: 3,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var grp02 = Groups.insert({
    name: 'Test02',
    nbEmp: 4,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  // create Employees
  var AdministratorId = Employees.insert({
    fname: 'Administrator',
    lname: 'Name',
    email: 'administrator@gyroscope.com',
    roleId: adminRole,
    role: 'Admin',
    userId: adminId,
    user: 'Admin',
    supervisorId: null,
    supervisor: '',
    groupId: grp01,
    group: 'Test01',
    status: 'EA',
    AL: 24.0,
    SL: 0.0,
    active: true,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var empApprover01Id = Employees.insert({
    fname: 'Approver01',
    lname: 'Name',
    email: 'approver01@gyroscope.com',
    roleId: approverRole,
    role: 'Approver',
    userId: approver01Id,
    user: 'Approver01',
    supervisorId: AdministratorId,
    supervisor: 'Administrator Name',
    groupId: grp01,
    group: 'Test01',
    status: 'EA',
    AL: 24.0,
    SL: 0.0,
    active: true,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var empSupervisor01Id = Employees.insert({
    fname: 'Supervisor01',
    lname: 'Name',
    email: 'supervisor01@gyroscope.com',
    roleId: supervisorRole,
    role: 'Supervisor',
    userId: supervisor01Id,
    user: 'Supervisor01',
    supervisorId: empApprover01Id,
    supervisor: 'Approver01 Name',
    groupId: grp01,
    group: 'Test01',
    status: 'EA',
    AL: 24.0,
    SL: 0.0,
    active: true,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var emp01Id = Employees.insert({
    fname: 'Empl01',
    lname: 'Name',
    email: 'empl01@gyroscope.com',
    roleId: userRole,
    role: 'User',
    userId: user01Id,
    user: 'User01',
    supervisorId: empSupervisor01Id,
    supervisor: 'Supervisor01 Name',
    groupId: grp02,
    group: 'Test02',
    status: 'EA',
    AL: 24.0,
    SL: 0.0,
    active: true,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var emp02Id = Employees.insert({
    fname: 'Empl02',
    lname: 'Name',
    email: 'empl02@gyroscope.com',
    roleId: userRole,
    role: 'User',
    userId: null,
    user: '',
    supervisorId: empSupervisor01Id,
    supervisor: 'Supervisor01 Name',
    groupId: grp02,
    group: 'Test02',
    status: 'EA',
    AL: 28.0,
    SL: 0.0,
    active: true,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var emp03Id = Employees.insert({
    fname: 'Empl03',
    lname: 'Name',
    email: 'empl03@gyroscope.com',
    roleId: userRole,
    role: 'User',
    userId: null,
    user: '',
    supervisorId: null,
    supervisor: '',
    groupId: null,
    group: '',
    status: 'EA',
    AL: 28.0,
    SL: 0.0,
    active: true,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  EmpGrp.insert({
    empId: emp01Id,
    grpId: grp02
  });

  EmpGrp.insert({
    empId: emp02Id,
    grpId: grp02
  });

  EmpGrp.insert({
    empId: empSupervisor01Id,
    grpId: grp01
  });

  EmpGrp.insert({
    empId: empApprover01Id,
    grpId: grp01
  });

  EmpGrp.insert({
    empId: AdministratorId,
    grpId: grp01
  });

  EmpGrp.insert({
    empId: AdministratorId,
    grpId: grp02
  });

  EmpGrp.insert({
    empId: empSupervisor01Id,
    grpId: grp02
  });

  // create Schedules
  var scheduleId = Schedules.insert({
    empId: emp01Id,
    emp: 'Empl01 Name',
    periodsCount: 10,
    hoursCount: 37.5,
    validS: '2014-01-01',
    validE: '2014-12-31',
    status: 'Not Submitted',
    lockedBy: null,
    locked: null,
    submittedBy: null,
    submitted: null,
    approvedBy: null,
    approved: null,
    rejectedBy: null,
    rejected: null,
    reviewedBy: null,
    reviewed: null,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 1,               // Monday
    start: '13:00',       // From: 8:00
    end: '17:00',         // To: 12:00
    hours: 4,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 1,               // Monday
    start: '18:00',       // From: 13:00
    end: '21:30',         // To: 16:30
    hours: 3.5,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 2,               // Tuesday
    start: '13:00',       // From: 8:00
    end: '17:00',         // To: 12:00
    hours: 4,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 2,               // Tuesday
    start: '18:00',       // From: 13:00
    end: '21:30',         // To: 16:30
    hours: 3.5,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 3,               // Wednesday
    start: '13:00',       // From: 8:00
    end: '17:00',         // To: 12:00
    hours: 4,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 3,               // Wednesday
    start: '18:00',       // From: 13:00
    end: '21:30',         // To: 16:30
    hours: 3.5,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var ThursdayAM = Periods.insert({
    schId: scheduleId,
    day: 4,               // Thursday
    start: '13:00',       // From: 8:00
    end: '17:00',         // To: 12:00
    hours: 4,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 4,               // Thursday
    start: '18:00',       // From: 13:00
    end: '21:30',         // To: 16:30
    hours: 3.5,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 5,               // Friday
    start: '13:00',       // From: 8:00
    end: '17:00',         // To: 12:00
    hours: 4,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 5,               // Friday
    start: '18:00',       // From: 13:00
    end: '21:30',         // To: 16:30
    hours: 3.5,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var schEmp02Id = Schedules.insert({
    empId: emp02Id,
    emp: 'Empl02 Name',
    periodsCount: 10,
    hoursCount: 37.5,
    validS: '2014-01-01',
    validE: '2014-12-31',
    status: 'Not Submitted',
    lockedBy: null,
    locked: null,
    submittedBy: null,
    submitted: null,
    approvedBy: null,
    approved: null,
    rejectedBy: null,
    rejected: null,
    reviewedBy: null,
    reviewed: null,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: schEmp02Id,
    day: 1,               // Monday
    start: '08:00',       // From: 8:00
    end: '12:00',         // To: 12:00
    hours: 4,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: schEmp02Id,
    day: 1,               // Monday
    start: '13:00',       // From: 13:00
    end: '16:30',         // To: 16:30
    hours: 3.5,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: schEmp02Id,
    day: 2,               // Tuesday
    start: '08:00',       // From: 8:00
    end: '12:00',         // To: 12:00
    hours: 4,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: schEmp02Id,
    day: 2,               // Tuesday
    start: '13:00',       // From: 13:00
    end: '16:30',         // To: 16:30
    hours: 3.5,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: schEmp02Id,
    day: 3,               // Wednesday
    start: '08:00',       // From: 8:00
    end: '12:00',         // To: 12:00
    hours: 4,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: schEmp02Id,
    day: 3,               // Wednesday
    start: '13:00',       // From: 13:00
    end: '16:30',         // To: 16:30
    hours: 3.5,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: schEmp02Id,
    day: 4,               // Thursday
    start: '08:00',       // From: 8:00
    end: '12:00',         // To: 12:00
    hours: 4,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: schEmp02Id,
    day: 4,               // Thursday
    start: '13:00',       // From: 13:00
    end: '16:30',         // To: 16:30
    hours: 3.5,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: schEmp02Id,
    day: 5,               // Friday
    start: '08:00',       // From: 8:00
    end: '12:00',         // To: 12:00
    hours: 4,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Periods.insert({
    schId: schEmp02Id,
    day: 5,               // Friday
    start: '13:00',       // From: 13:00
    end: '16:30',         // To: 16:30
    hours: 3.5,
    status: 'New',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  // create Event Types
  var W = EventTypes.insert({
    title: 'Work',
    code: 'W',
    unit: 'p',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#468847',
    defaultDuration: 0,
    allDay: false,
    active: true,
    order: 10,
    parent: null,
    ratio: 1.0
  });

  var A = EventTypes.insert({
    title: 'Annual Leave',
    code: 'A',
    unit: 'p',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#5CC65E',
    defaultDuration: 0,
    allDay: false,
    active: true,
    order: 20,
    parent: null,
    ratio: 1.0
  });

  var X = EventTypes.insert({
    title: 'Extra',
    code: 'X',
    unit: 'h',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#aaa',
    defaultDuration: 1,
    allDay: false,
    active: true,
    order: 30,
    parent: null,
    ratio: 1.0
  });

  var R = EventTypes.insert({
    title: 'Recup',
    code: 'R',
    unit: 'h',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#3366CC',
    defaultDuration: 1,
    allDay: false,
    active: true,
    order: 40,
    parent: null,
    ratio: 1.0
  });

  var S = EventTypes.insert({
    title: 'Sick Leave',
    code: 'S',
    unit: 'p',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#b00',
    defaultDuration: 0,
    allDay: false,
    active: true,
    order: 50,
    parent: null,
    ratio: 1.0
  });

  var T = EventTypes.insert({
    title: 'Training',
    code: 'T',
    unit: 'h',
    textColor: '#000',
    borderColor: '#000',
    backgroundColor: '#cc0',
    defaultDuration: 1.0,
    allDay: false,
    active: true,
    order: 60,
    parent: null,
    ratio: 1.0
  });

  var X100 = EventTypes.insert({
    title: 'Extra 100 %',
    code: 'X100',
    unit: 'h',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#999',
    defaultDuration: 0,
    allDay: false,
    active: true,
    order: 31,
    parent: X,
    ratio: 1.0
  });

  var X125 = EventTypes.insert({
    title: 'Extra 125 %',
    code: 'X125',
    unit: 'h',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#888',
    defaultDuration: 0,
    allDay: false,
    active: true,
    order: 32,
    parent: X,
    ratio: 1.25
  });

  var X150 = EventTypes.insert({
    title: 'Extra 150 %',
    code: 'X150',
    unit: 'h',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#777',
    defaultDuration: 0,
    allDay: false,
    active: true,
    order: 33,
    parent: X,
    ratio: 1.50
  });

  var X200 = EventTypes.insert({
    title: 'Extra 200 %',
    code: 'X200',
    unit: 'h',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#666',
    defaultDuration: 0,
    allDay: false,
    active: true,
    order: 34,
    parent: X,
    ratio: 2.0
  });

  // create Posts and Events
  var firstPostId = Posts.insert({
    title: 'January 2014',
    year: 2014,
    month: 1,
    empId: emp01Id,
    status: 'In progress',
    lockedBy: null,
    locked: null,
    submittedBy: null,
    submitted: null,
    approvedBy: null,
    approved: null,
    rejectedBy: null,
    rejected: null,
    reviewedBy: null,
    reviewed: null,
    daysCount: 31,
    eventsCount: 1,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  var balEmp01 = Balances.insert({
    year: 2014,
    empId: emp01Id,
    AL: 24 * 7.5,
    SL: 0.0,
    X: 0.0
  });

  Events.insert({
    postId: firstPostId,
    empId: emp01Id,
    // start: moment(new Date(2014, 0, 1, 8, 0)),
    // end: moment(new Date(2014, 0, 1, 12, 0)),
    start: '2014-01-02T13:00:00.000Z',
    end: '2014-01-02T17:00:00.000Z',
    // start: new Date(2014, 0, 1, 8, 0),
    // end: new Date(2014, 0, 1, 12, 0),
    duration: 4.0,
    unit: 'h',
    period: ThursdayAM,
    type: A,
    title: 'A',
    status: 'Pending',
    allDay: false,
    submitted: now,
    approved: null,
    approver: null,
    reviewed: null,
    reviewer: null,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Totals.insert({
    postId: firstPostId,
    empId: emp01Id,
    year: 2014,
    month: 1,
    type: A,
    code: 'A',
    unit: 'h',
    value: 4.0,
    cValue: 4.0
  });

  // Posts.insert({
  //   title: 'January 2014',
  //   year: 2014,
  //   month: 1,
  //   empId: emp02Id,
  //   status: 'Pending',
  //   lockedBy: null,
  //   locked: null,
  //   submittedBy: null,
  //   submitted: null,
  //   approvedBy: null,
  //   approved: null,
  //   rejectedBy: null,
  //   rejected: null,
  //   reviewedBy: null,
  //   reviewed: null,
  //   daysCount: daysInMonth(2014, 1),
  //   eventsCount: 0,
  //   createdBy: adminId,
  //   created: moment(new Date()).toISOString(),
  //   modifiedBy: adminId,
  //   modified: moment(new Date()).toISOString()
  // });

  Posts.insert({
    title: 'February 2014',
    year: 2014,
    month: 2,
    empId: emp01Id,
    status: 'Pending',
    lockedBy: null,
    locked: null,
    submittedBy: null,
    submitted: null,
    approvedBy: null,
    approved: null,
    rejectedBy: null,
    rejected: null,
    reviewedBy: null,
    reviewed: null,
    daysCount: 28,
    eventsCount: 0,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'admin',
    value: adminId,
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'lastEmpMod',
    value: new Date(),
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'lastSchMod',
    value: new Date(),
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'lastCalEventMod',
    value: new Date(),
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'lastCalPeriodMod',
    value: new Date(),
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'DateTimeFormat',
    // value: 'MM/DD/YYYY hh:mm A',
    value: 'MM/DD/YYYY HH:mm',
    // value: 'DD/MM/YYYY HH:mm',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'TimeFormat',
    value: 'hh:mm A',
    // value: 'HH:mm',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Holidays.insert({
    title: "Christmas Day",
    date: '2013-12-25',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Holidays.insert({
    title: "New Year's Day",
    date: '2014-01-01',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Holidays.insert({
    title: "Martin Luther King Day",
    date: '2014-01-20',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Holidays.insert({
    title: "Presidents' Day",
    date: '2014-02-17',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Holidays.insert({
    title: "Memorial Day",
    date: '2014-05-26',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Holidays.insert({
    title: "Independence Day",
    date: '2014-07-04',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Holidays.insert({
    title: "Labor Day",
    date: '2014-09-01',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Holidays.insert({
    title: "Columbus Day",
    date: '2014-10-13',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Holidays.insert({
    title: "Veterans Day",
    date: '2014-11-11',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Holidays.insert({
    title: "Thanksgiving Day",
    date: '2014-11-27',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });

  Holidays.insert({
    title: "Christmas Day",
    date: '2014-12-25',
    createdBy: adminId,
    created: moment(new Date()).toISOString(),
    modifiedBy: adminId,
    modified: moment(new Date()).toISOString()
  });
}