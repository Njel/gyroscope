Settings = new Meteor.Collection('settings');

Settings.allow({
  // insert: isAdminById,
  // update: ownsDocument,
  // remove: ownsDocument
  insert: function(userId, doc) {
   // only allow posting if you are logged in
   return !! userId;
  },
  update: function(userId, doc) {
   // only allow posting if you are logged in
   return !! userId;
  },
  remove: function(userId, doc) {
   // only allow posting if you are logged in
   return !! userId;
  }
});