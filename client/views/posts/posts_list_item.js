Template.postsListItem.helpers({
  hasAccess: function() {
    var c = Meteor.user();
    if (!c)
      return false;
    if (this.createdBy == c._id)
      return true;
    if(c.username == 'Admin')
      return true;
    var e = Employees.findOne(this.empId);
    if (e && e.supervisorId) {
      // console.log('Emp. Name: ' + e.fname + ' ' + e.lname);
      var s = Employees.findOne(e.supervisorId);
      if (s && s.userId) {
        // console.log('Sup. Name: ' + s.fname + ' ' + s.lname);
        if (s.userId == c._id) {
          return true;
        }
      }
    }
    var ar = Roles.findOne({name: 'Admin'});
    if (ar) {
      var ce = Employees.findOne({userId: c._id});
      if (ce && (ce.roleId == ar._id || ce._id == this.empId)) {
        return true;
      }
    }
    return false;
  },
  postColor: function() {
    if (this.approved)
      return 'rgb(240, 248, 239)';
    if (this.rejected)
      return 'rgb(248, 239, 239)';
    if (this.locked)
      return 'rgb(211, 211, 211)';
    return '#fff';
  },
  isAdmin: function() {
    var currUser = Meteor.user();
    if (!currUser) {
      return false;
    } else {
      if(currUser.username == 'Admin')
        return true;
      var adminRole = Roles.findOne({name: 'Admin'});
      if (adminRole) {
        var currEmp = Employees.findOne({userId: currUser._id});
        if (currEmp && currEmp.roleId == adminRole._id) {
          return true;
        }
      }
      return false;
    }
  },
  isLocked: function() {
    if (isAdmin())
      return false;
    return (this.locked ? true : false);
  },
  isApproved: function() {
    return (this.approved ? true : false);
  },
  isRejected: function() {
    return (this.rejected ? true : false);
  },
  ownPost: function() {
    return (this.userId == Meteor.userId()) || (this.createdBy == Meteor.userId());
  },
  domain: function() {
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  },
  upvotedClass: function() {
  	var userId = Meteor.userId();
  	if (userId && !_.include(this.upvoters, userId)) {
  	  return 'btn-primary upvoteable';
  	} else {
  	  return 'disabled';
  	}
  },
  isNew: function() {
    // console.log(this.title + ': ' + this.created + ' - ' + this.modified);
    return (this.created == this.modified);
  }
});

Template.postsListItem.rendered = function() {
  // animate post from previous position to new position
  var instance = this;
  var rank = instance.data._rank;
  var $this = $(this.firstNode);
  var postHeight = 80;
  var newPosition = rank * postHeight;

  // if element has a currentPosition (i.e. it's not the first ever render)
  if (typeof(instance.currentPosition) !== 'undefined') {
    var previousPosition = instance.currentPosition;
    // calculate difference between old position and new position and send element there
    var delta = previousPosition - newPosition;
    $this.css("top", delta + "px");
  } else {
  	// it's the first ever render, so hide element
    $this.addClass("invisible");
  }

  // let it draw in the old position, then..
  Meteor.defer(function() {
    instance.currentPosition = newPosition;
    // bring element back to its new original position
    $this.css("top", "0px").removeClass("invisible");
  });
};

Template.postsListItem.events({
  'click .editBtn': function(event) {
    // console.log('Edit Month click (' + this._id + ')');
    event.preventDefault();
    Session.set('selectedPost', this._id);
    Session.set('showDialogPost', true);
    // Meteor.call('edit', this._id);
  },
  'click .detailsBtn': function(event) {
    // console.log('Details click (' + this._id + ')');
  },
  'click .submitBtn': function(event) {
    // console.log('Submit click (' + this._id + ')');
    // event.preventDefault();
    // Meteor.call('postSubmit', this._id);
  },
  'click .deleteBtn': function(event) {
    // console.log('Delete Month click (' + this._id + ')');
    event.preventDefault();
    Session.set('selectedPost', this._id);
    Session.set('showDialogPostDelConf', true);
    // Meteor.call('edit', this._id);
  }
});