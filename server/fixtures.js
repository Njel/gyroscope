// Fixture data

function daysInMonth(year, month) {
    return new Date(year, month - 1, 0).getDate();
}

if (Posts.find().count() === 0) {
  var now = new Date();
  
  // create users
  var adminId = Meteor.users.insert({
    username: 'Admin',
    profile: { name: 'Admin' }
  });
  Accounts.setPassword(adminId, 'password');
  
  var user01Id = Meteor.users.insert({
    username: 'User01',
    profile: { name: 'User 01' }
  });
  Accounts.setPassword(user01Id, 'password');
  
  var user02Id = Meteor.users.insert({
    username: 'User02',
    profile: { name: 'User 02' }
  });
  Accounts.setPassword(user02Id, 'password');

  var user03Id = Meteor.users.insert({
    username: 'User03',
    profile: { name: 'User 03' }
  });
  Accounts.setPassword(user03Id, 'password');

  // create Roles
  var adminRole = Roles.insert({
    name: 'Admin',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Roles.insert({
    name: 'Reviewer',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Roles.insert({
    name: 'Approver',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  var userRole = Roles.insert({
    name: 'User',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  // create Groups
  var grp = Groups.insert({
    name: 'Test',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  // create Employees
  var emp01Id = Employees.insert({
    fname: 'empl01',
    lname: 'name',
    email: 'empl01@gyroscope.com',
    roleId: userRole,
    userId: '',
    group: grp,
    status: 'EA',
    AL: 10,
    SL: 0,
    active: true,
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  var emp02Id = Employees.insert({
    fname: 'empl02',
    lname: 'name',
    email: 'empl02@gyroscope.com',
    roleId: userRole,
    userId: '',
    group: grp,
    status: 'EA',
    AL: 10,
    SL: null,
    active: true,
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  // create Schedules
  var scheduleId = Schedules.insert({
    empId: emp01Id,
    periodsCount: 10,
    hoursCount: 37.5,
    validS: '2014-01-01',
    validE: '2014-12-31',
    status: 'approved',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 1,               // Monday
    start: '13:00',       // From: 8:00
    end: '17:00',         // To: 12:00
    hours: 4,
    status: 'approved',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 1,               // Monday
    start: '18:00',       // From: 13:00
    end: '21:30',         // To: 16:30
    hours: 3.5,
    status: 'approved',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 2,               // Tuesday
    start: '13:00',       // From: 8:00
    end: '17:00',         // To: 12:00
    hours: 4,
    status: 'approved',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 2,               // Tuesday
    start: '18:00',       // From: 13:00
    end: '21:30',         // To: 16:30
    hours: 3.5,
    status: 'approved',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 3,               // Wednesday
    start: '13:00',       // From: 8:00
    end: '17:00',         // To: 12:00
    hours: 4,
    status: 'approved',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 3,               // Wednesday
    start: '18:00',       // From: 13:00
    end: '21:30',         // To: 16:30
    hours: 3.5,
    status: 'approved',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 4,               // Thursday
    start: '13:00',       // From: 8:00
    end: '17:00',         // To: 12:00
    hours: 4,
    status: 'approved',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 4,               // Thursday
    start: '18:00',       // From: 13:00
    end: '21:30',         // To: 16:30
    hours: 3.5,
    status: 'approved',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 5,               // Friday
    start: '13:00',       // From: 8:00
    end: '17:00',         // To: 12:00
    hours: 4,
    status: 'approved',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Periods.insert({
    schId: scheduleId,
    day: 5,               // Friday
    start: '18:00',       // From: 13:00
    end: '21:30',         // To: 16:30
    hours: 3.5,
    status: 'approved',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  // create Event Types
  var W = EventTypes.insert({
    title: 'Work',
    code: 'W',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#468847',
    defaultDuration: 4,
    active: true
  });

  var A = EventTypes.insert({
    title: 'Annual Leave',
    code: 'A',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#5CC65E',
    defaultDuration: 4,
    active: true
  });

  var X = EventTypes.insert({
    title: 'Extra',
    code: 'X',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#aaa',
    defaultDuration: 1,
    active: true
  });

  var R = EventTypes.insert({
    title: 'Recup',
    code: 'R',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#3366CC',
    defaultDuration: 1,
    active: true
  });

  var S = EventTypes.insert({
    title: 'Sick Leave',
    code: 'S',
    textColor: '#fff',
    borderColor: '#000',
    backgroundColor: '#b00',
    defaultDuration: 4,
    active: true
  });

  // create Posts and Events
  var firstPostId = Posts.insert({
    title: 'January 2014',
    year: 2014,
    month: 1,
    empId: emp01Id,
    status: 'pending',
    submitted: now,
    approved: null,
    approver: null,
    reviewed: null,
    reviewer: null,
    daysCount: daysInMonth(2014, 1),
    eventsCount: 2,
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Events.insert({
    postId: firstPostId,
    empId: emp01Id,
    // start: moment(new Date(2014, 0, 1, 8, 0)),
    // end: moment(new Date(2014, 0, 1, 12, 0)),
    start: '2014-01-01T13:00:00.000Z',
    end: '2014-01-01T17:00:00.000Z',
    // start: new Date(2014, 0, 1, 8, 0),
    // end: new Date(2014, 0, 1, 12, 0),
    hours: 4,
    allDay: false,
    type: A,
    title: '1st DoY (AM)',
    status: 'pending',
    submitted: now,
    approved: null,
    approver: null,
    reviewed: null,
    reviewer: null,
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Events.insert({
    postId: firstPostId,
    userId: emp01Id,
    // start: moment(new Date(2014, 0, 1, 13, 0)),
    // end: moment(new Date(2014, 0, 1, 16, 30)),
    start: '2014-01-01T18:00:00.000Z',
    end: '2014-01-01T21:30:00.000Z',
    // start: new Date(2014, 0, 1, 13, 0),
    // end: new Date(2014, 0, 1, 16, 30),
    hours: 3.5,
    allDay: false,
    type: A,
    title: '1st DoY (PM)',
    status: 'pending',
    submitted: now,
    approved: null,
    approver: null,
    reviewed: null,
    reviewer: null,
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Posts.insert({
    title: 'January 2014',
    year: 2014,
    month: 1,
    empId: emp02Id,
    status: 'pending',
    submitted: now,
    approved: null,
    approver: null,
    reviewed: null,
    reviewer: null,
    daysCount: daysInMonth(2014, 1),
    eventsCount: 0,
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Posts.insert({
    title: 'February 2014',
    year: 2014,
    month: 2,
    empId: emp01Id,
    status: 'pending',
    submitted: now,
    approved: null,
    approver: null,
    reviewed: null,
    reviewer: null,
    daysCount: daysInMonth(2014, 2),
    eventsCount: 0,
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'admin',
    value: adminId,
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'lastEmpMod',
    value: new Date(),
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'lastSchMod',
    value: new Date(),
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'lastCalEventMod',
    value: new Date(),
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'lastCalPeriodMod',
    value: new Date(),
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'DateTimeFormat',
    // value: 'MM/DD/YYYY hh:mm A',
    value: 'MM/DD/YYYY HH:mm',
    // value: 'DD/MM/YYYY HH:mm',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Settings.insert({
    userId: 'All',
    name: 'TimeFormat',
    value: 'hh:mm A',
    // value: 'HH:mm',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Holidays.insert({
    title: "Christmas Day",
    date: '2013-12-25',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Holidays.insert({
    title: "New Year's Day",
    date: '2014-01-01',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Holidays.insert({
    title: "Martin Luther King Day",
    date: '2014-01-20',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Holidays.insert({
    title: "Presidents' Day",
    date: '2014-02-17',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Holidays.insert({
    title: "Memorial Day",
    date: '2014-05-26',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Holidays.insert({
    title: "Independence Day",
    date: '2014-07-04',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Holidays.insert({
    title: "Labor Day",
    date: '2014-09-01',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Holidays.insert({
    title: "Columbus Day",
    date: '2014-10-13',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Holidays.insert({
    title: "Veterans Day",
    date: '2014-11-11',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Holidays.insert({
    title: "Thanksgiving Day",
    date: '2014-11-27',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });

  Holidays.insert({
    title: "Christmas Day",
    date: '2014-12-25',
    createdBy: adminId,
    created: new Date().toISOString(),
    modifiedBy: adminId,
    modified: new Date().toISOString()
  });
}