Template.groupDialog.selectedGroup = function() {
  return Session.get('selectedGroup');
};

Template.groupDialog.grp = function() {
  var grpId = Session.get('selectedGroup');

  if (grpId) {
    var g = Groups.findOne(grpId);
    if (g) {
      var grp = {
        name: g.name,
        createdBy: g.createdBy,
        created: new Date(g.created),
        modifiedBy: g.modifiedBy,
        modified: new Date(g.modified)
      }
    }
  } else {
    var grp = {
      name: ''
    }
  }
  return grp;
};

Template.groupDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedGroup', null);
    Session.set('showDialogGroup', false);
  },
  'click .close': function(evt, tmpl) {
    Session.set('selectedGroup', null);
    Session.set('showDialogGroup', false);
  },
  'click .add': function(evt, tmpl) {
    var g = {
      name: tmpl.find('[name=name]').value
    };
    
    // console.log(g);

    Meteor.call('groupNew', g, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('New group created successfully.');
        Session.set('selectedGroup', null);
        Session.set('showDialogGroup', false);
      }
    });
  },
  'click .save': function(evt, tmpl) {
    var g = {
      id: Session.get('selectedGroup'),
      name: tmpl.find('[name=name]').value
    };

    Meteor.call('groupUpd', g, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('Group updated successfully.');
        Session.set('selectedGroup', null);
        Session.set('showDialogGroup', false);
      }
    });
  }
});