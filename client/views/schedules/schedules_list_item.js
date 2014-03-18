Template.schedulesListItem.helpers({
  notSubmitted: function() {
    return (this.status == 'Not Submitted' && this.periodsCount != 0);
  },
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
  ownPost: function() {
    return (this.userId == Meteor.userId()) || (this.createdBy == Meteor.userId());
  },
  domain: function() {
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  }
});

Template.schedulesListItem.rendered = function() {
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

Template.schedulesListItem.events({
  'click .editBtn': function(event) {
    // console.log('Edit Schedule click (' + this._id + ')');
  	event.preventDefault();
    Session.set('selectedSchedule', this._id);
    Session.set('showDialogSchedule', true);
  	// Meteor.call('edit', this._id);
  },
  'click .detailsBtn': function(event) {
    // Session.set('selectedSchedule', this._id);
  },
  'click .submitBtn': function(event) {
    // console.log('Submit click (' + this._id + ')');
    event.preventDefault();
    Meteor.call('scheduleSubmit', this._id);
  },
  'click .deleteBtn': function(event) {
    // console.log('Employee Delete click (' + this._id + ')');
    event.preventDefault();
    Session.set('selectedSchedule', this._id);
    Session.set('showDialogSchDelConf', true);
  }
});