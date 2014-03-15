Template.scheduleItem.helpers({
    isAuthorized: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if(currUser.username == 'Admin')
      return true;
    var currEmp = Employees.findOne({userId: currUser._id});
    if (currEmp)
      return true;
    return false;
  },
  hasAccess: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if (this.periodsCount == 0 || this.status != 'Not Submitted')
      return false;
    // var sch = Schedules.findOne(this._id);
    var currEmp = Employees.findOne({userId: currUser._id});
    // if (sch && currEmp && sch.empId == currEmp._id)
    if (currEmp && this.empId == currEmp._id)
      return true;
    if ((this.empId == currUser._id) || (this.createdBy == currUser._id))
      return true;
    if(currUser.username == 'Admin')
      return true;
    var adminRole = Roles.findOne({name: 'Admin'});
    if (adminRole) {
      var currEmp = Employees.findOne({userId: currUser._id});
      if (currEmp && (currEmp.roleId == adminRole._id || currEmp._id == this.empId)) {
        return true;
      }
    }
    return false;
  },
  isAdmin: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if(currUser.username == 'Admin')
      return true;
    var currEmp = Employees.findOne({userId: currUser._id});
    var adminRole = Roles.findOne({name: 'Admin'});
    if (adminRole) {
      if (currEmp && currEmp.roleId == adminRole._id) {
        return true;
      }
    }
    var emp = Employees.findOne(this.empId);
    if (emp && (emp.supervisorId == currEmp._id)) {
      return true;
    }
    return false;
  },
  approved: function() {
    return (this.status == 'Approved');
  },
  submitted: function() {
    return (this.status == 'Pending');
  },
  empName: function() {
    var emp = Employees.findOne(this.empId);
    if (emp)
      return emp.fname + ' ' + emp.lname;
    return '';
  },
  ownSchedule: function() {
    return this.userId == Meteor.userId();
  },
  domain: function() {
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  }
});

Template.scheduleItem.rendered = function() {
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

Template.scheduleItem.events({
  'click .submit': function(event) {
    // console.log(this._id);
    event.preventDefault();
    Meteor.call('scheduleSubmit', this._id);
  },
  'click .lockBtn': function(event) {
    event.preventDefault();
    Meteor.call('scheduleLock', this._id);
  },
  'click .unlockBtn': function(event) {
    event.preventDefault();
    Meteor.call('scheduleUnlock', this._id);
  },
  'click .approveBtn': function(event) {
    event.preventDefault();
    Meteor.call('scheduleApprove', this._id);
  },
  'click .rejectBtn': function(event) {
    event.preventDefault();
    Meteor.call('scheduleReject', this._id);
  }
});