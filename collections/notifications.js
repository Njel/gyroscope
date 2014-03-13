Notifications = new Meteor.Collection('notifications');

Notifications.allow({
  // update: ownsDocument
  insert: function(userId, doc) {
   // only allow insert if you are logged in
   return !! userId;
  },
  update: function(userId, doc) {
   // only allow update if you are logged in
   return !! userId;
  },
  remove: function(userId, doc) {
   // only allow remove if you are logged in
   return !! userId;
  }
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