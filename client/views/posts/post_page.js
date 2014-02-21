// Template.postPage.lastCalEventMod = function() {
//   return Session.get('lastCalEventMod');
// };

Template.postPage.helpers({
  currentPost: function() {
  	var p = Posts.findOne(Session.get('currentPostId'));
  	if (p) {
  	  var sd = Session.get('calStartDate');
  	  if (!sd || sd.getMonth() != p.month - 1) {
	    Session.set('calStartDate', new Date(p.year, p.month - 1, 1));
	  }
	}
  	return p;
  },
  events: function() {
  	return Events.find({postId: this._id}, {sort: {start: -1}});
  }
});