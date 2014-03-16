Session.setDefault('selectedPost', null);
Session.setDefault('showDialogPost', false);
Session.setDefault('showDialogPostDelConf', false);

// Session.setDefault('lastEmpMod', null);
Session.setDefault('selectedEmployee', null);
Session.setDefault('showDialogEmployee', false);
Session.setDefault('showDialogEmpDelConf', false);

Session.setDefault('selectedGroup', null);
Session.setDefault('showDialogGroup', false);
Session.setDefault('showDialogGrpDelConf', false);

Session.setDefault('selectedSchedule', null);
Session.setDefault('showDialogSchedule', false);
Session.setDefault('showDialogSchDelConf', false);

Session.setDefault('selectedHoliday', null);
Session.setDefault('showDialogHoliday', false);
Session.setDefault('showDialogHolDelConf', false);

Session.setDefault('currentEmpId', null);
Session.setDefault('currentYear', moment(new Date()).year());
// Session.setDefault('showDialogSchedule', false);
// Session.setDefault('showDialogSchDelConf', false);

Session.setDefault('lastCalPeriodMod', null);
Session.setDefault('selectedCalPeriod', null);
Session.setDefault('showDialogCalPeriod', false);

Session.setDefault('lastCalEventMod', null);
Session.setDefault('selectedCalEvent', null);
Session.setDefault('selectedCalEventType', null);
Session.setDefault('selectedCalAllDay', false);
Session.setDefault('selectedCalDateStart', null);
Session.setDefault('selectedCalDateEnd', null);
Session.setDefault('showDialogCalEvent', false);
Session.setDefault('calMonthView', 'month');
Session.setDefault('calStartDate', new Date());

Session.set('settingsLoaded', false);
Session.set('sessionId', Meteor.default_connection._lastSessionId);

// Subscriptions

// Settings
Meteor.subscribe('settings', function(){
  // runs once after settings have loaded
  Session.set('settingsLoaded',true);
  // analyticsInit();
});

// Current User
// We need to subscribe to the currentUser subscription because by itself, 
// Meteor doesn't send all the user properties that we need
Meteor.subscribe('currentUser');

// Subscribe to all users for now to make user selection autocomplete work
Meteor.subscribe('allUsers');
Meteor.subscribe('allUsersAdmin');

// Meteor.subscribe('posts');
newPostsHandle = Meteor.subscribeWithPagination('newPosts', 12);

Meteor.autorun(function() {
  Meteor.subscribe('singlePost', Session.get('currentPostId'));

  Meteor.subscribe('events', Session.get('currentPostId'));

  // Meteor.subscribe('periods', Session.get('currentScheduleId'));
});

Meteor.subscribe('employees');
Meteor.subscribe('balances');
Meteor.subscribe('groups');
Meteor.subscribe('holidays');
Meteor.subscribe('schedules');
Meteor.subscribe('totals');
Meteor.subscribe('periods');
Meteor.subscribe('roles');
Meteor.subscribe('eventTypes');
Meteor.subscribe('notifications');

Session.setDefault('selectedEventType', null);