Session.setDefault('selectedPost', null);
Session.setDefault('showDialogPost', false);
Session.setDefault('showDialogPostDelConf', false);

Session.setDefault('selectedEmployee', null);
Session.setDefault('showDialogEmployee', false);
Session.setDefault('showDialogEmpDelConf', false);

Session.setDefault('selectedGroup', null);
Session.setDefault('showDialogGroup', false);
Session.setDefault('showDialogGrpDelConf', false);

Session.setDefault('selectedHoliday', null);
Session.setDefault('showDialogHoliday', false);
Session.setDefault('showDialogHolDelConf', false);

Session.setDefault('currentEmpId', null);
// Session.setDefault('showDialogSchedule', false);
// Session.setDefault('showDialogSchDelConf', false);

Session.setDefault('lastCalPeriodMod', null);
Session.setDefault('selectedCalPeriod', null);
Session.setDefault('showDialogCalPeriod', false);

Session.setDefault('lastCalEventMod', null);
Session.setDefault('selectedCalEvent', null);
Session.setDefault('selectedCalDateStart', null);
Session.setDefault('selectedCalDateEnd', null);
Session.setDefault('showDialogCalEvent', false);
Session.setDefault('calMonthView', 'month');
Session.setDefault('calStartDate', new Date());

// Meteor.subscribe('posts');
newPostsHandle = Meteor.subscribeWithPagination('newPosts', 10);

Meteor.autorun(function() {
  Meteor.subscribe('singlePost', Session.get('currentPostId'));

  Meteor.subscribe('events', Session.get('currentPostId'));

  // Meteor.subscribe('periods', Session.get('currentScheduleId'));
});

Meteor.subscribe('employees');
Meteor.subscribe('groups');
Meteor.subscribe('holidays');
Meteor.subscribe('schedules');
Meteor.subscribe('periods');
Meteor.subscribe('roles');

Meteor.subscribe('notifications');

Meteor.subscribe('settings');