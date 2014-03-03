Template.messages.helpers({
  messages: function() {
    return Messages.find({seen: false});
  },
  errors: function() {
    return Errors.find();
  }
});

Template.message.rendered = function() {
  var message = this.data;
  Meteor.defer(function() {
    setTimeout(function() {
      $('#' + message._id).fadeOut();
      setTimeout(function() {
  	    Messages.update(message._id, {$set: {seen: true}});
  	  }, 1000);
    }, 2000);
  });
};

Template.error.rendered = function() {
  var error = this.data;
  Meteor.defer(function() {
    Errors.update(error._id, {$set: {seen: true}});
  });
};