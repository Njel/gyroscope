Notifications = new Meteor.Collection('notifications');

Notifications.allow({
  update: ownsDocument
});

createEventNotification = function(ev) {
  var e = Events.findOne(ev._id);
  Notifications.insert({
    // userId: e.userId,
    eventId: e._id,
    authorName: e.author,
    read: false
  });
};

createGroupNotification = function(grp) {
  var g = Groups.findOne(grp._id);
  Notifications.insert({
    userId: Settings.findOne({name: 'admin'}).value,
    eventId: g._id,
    authorName: g.createdBy,
    read: false
  });
};