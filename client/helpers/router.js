Meteor.Router.add({
  '/': {to: 'newPosts', as: 'home'},
  '/new': 'newPosts',

  '/posts/:_id': {
  	to: 'postPage',
  	and: function(id) { Session.set('currentPostId', id); }
  },

  '/posts/:_id/edit': {
  	to: 'postEdit',
  	and: function(id) { Session.set('currentPostId', id); }
  },

  '/submit': {to: 'postSubmit'},

  '/reports': {to: 'reports', name: 'Reports'},

  '/employees': 'employees',

  '/groups': 'groups',

  '/schedules': 'schedules',

  '/schedules/:_id': {
    to: 'schedulePage',
    and: function(id) { Session.set('currentScheduleId', id); }
  },

  '/holidays': 'holidays',

  '/settings': 'settings'
});

Meteor.Router.filters({
  'requireLogin': function(page) {
  	if (Meteor.user())
  	  return page;
  	else if (Meteor.loggingIn())
  	  return 'loading';
  	else
  	  return 'accessDenied';
  },
  'clearErrors': function(page) {
  	clearErrors();
  	return page;
  }
});

Meteor.Router.filter('requireLogin', {only: 'postSubmit'});
Meteor.Router.filter('clearErrors');