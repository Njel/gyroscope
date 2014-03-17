Template.groupsListItem.helpers({
  hasAccess: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if (this.createdBy == currUser._id)
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
  ownPost: function() {
    return this.userId == Meteor.userId();
  },
  domain: function() {
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  }
});

Template.groupsListItem.rendered = function() {
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

Template.groupsListItem.events({
  'click .editBtn': function(event) {
    // console.log('Edit Group click (' + this._id + ')');
  	event.preventDefault();
    Session.set('selectedGroup', this._id);
    Session.set('showDialogGroup', true);
  	// Meteor.call('edit', this._id);
  },
  'click .detailsBtn': function(event) {
    // console.log('Group Name click (' + this._id + ')');
  },
  'click .deleteBtn': function(event) {
    // console.log('Group Delete click (' + this._id + ')');
    event.preventDefault();
    Session.set('selectedGroup', this._id);
    Session.set('showDialogGrpDelConf', true);
  }
});