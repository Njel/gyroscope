// Meteor.publish('posts', function() {
Meteor.publish('newPosts', function(limit) {
  // return Posts.find();
  return Posts.find({}, {sort: {submitted: -1}, limit: limit});
});

Meteor.publish('singlePost', function(id) {
  return id && Posts.find(id);
});

Meteor.publish('employees', function() {
  return Employees.find();
});

Meteor.publish('groups', function() {
  return Groups.find();
});

Meteor.publish('holidays', function() {
  return Holidays.find();
});

Meteor.publish('schedules', function() {
  return Schedules.find();
});

Meteor.publish('periods', function() {
  return Periods.find();
});

Meteor.publish('roles', function() {
  return Roles.find();
});

// Meteor.publish('events', function(postId) {
//   return Events.find({postId: postId});
// });

Meteor.publish('events', function() {
  return Events.find();
});

Meteor.publish('notifications', function() {
  return Notifications.find({userId: this.userId});
});

Meteor.publish('settings', function() {
  return Settings.find();
});