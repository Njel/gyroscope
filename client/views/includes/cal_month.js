Template.calMonth.helpers({
  currentPost: function() {
  	return Posts.findOne(Session.get('currentPostId'));
  },
  events: function() {
  	return Events.find({postId: this._id});
  }
});

Template.calMonth.showDialogCalEvent = function() {
  return Session.get('showDialogCalEvent');
};

Template.calMonth.lastCalEventMod = function() {
  return Session.get('lastCalEventMod');
};

Template.calMonth.calMonthView = function() {
  return Session.get('calMonthView');
};