Template.employeesListItem.helpers({
  hasPosts: function() {
    return (Posts.find({empId: this._id}).count() > 0);
  },
  hasAccess: function() {
    var c = Meteor.user();
    if (!c)
      return false;
    if ((this.userId == c._id) || (this.createdBy == c._id))
      return true;
    if(c.username == 'Admin')
      return true;
    var s = Employees.findOne(this.supervisorId);
    if (s && s.userId) {
      // console.log('Sup. Name: ' + s.fname + ' ' + s.lname);
      if (s.userId == c._id) {
        return true;
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
  activeScheduleId: function() {
    var d = moment(new Date()).format('YYYY-MM-DD');
    var s = Schedules.findOne({empId: this._id, validS: {$lte: d}, validE: {$gte: d}});
    if (s)
      return s._id;
    return '';
  },
  hasActiveSchedule: function() {
    var d = moment(new Date()).format('YYYY-MM-DD');
    var s = Schedules.findOne({empId: this._id, validS: {$lte: d}, validE: {$gte: d}});
    if (s)
      return true;
    return false;
  },
  domain: function() {
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  }
});

Template.employeesListItem.rendered = function() {
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

Template.employeesListItem.events({
  'click .edit': function(event) {
    // console.log('Edit Employee click (' + this._id + ')');
  	event.preventDefault();
    Session.set('selectedEmployee', {action: 'Edit', empId: this._id});
    Session.set('showDialogEmployee', true);
  	// Meteor.call('edit', this._id);
  },
  'click .view': function(event) {
    // console.log('Edit Employee click (' + this._id + ')');
    event.preventDefault();
    Session.set('selectedEmployee', {action: 'View', empId: this._id});
    Session.set('showDialogEmployee', true);
    // Meteor.call('edit', this._id);
  },
  'click .details': function(event) {
    // console.log('Employee Name click (' + this._id + ')');
    // Session.set('selectedEmployee', this._id);
  },
  'click .delete': function(event) {
    // console.log('Employee Delete click (' + this._id + ')');
    event.preventDefault();
    Session.set('selectedEmployee', this._id);
    Session.set('showDialogEmpDelConf', true);
  }
});