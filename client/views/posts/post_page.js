// Template.postPage.lastCalEventMod = function() {
//   return Session.get('lastCalEventMod');
// };

Template.postPage.helpers({
  currentPost: function() {
  	return Posts.findOne(Session.get('currentPostId'));
  },
  events: function() {
  	return Events.find({postId: this._id});
  }
});