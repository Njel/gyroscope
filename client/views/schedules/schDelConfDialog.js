Template.schDelConfDialog.selectedSchedule = function() {
  return Session.get('selectedSchedule');
};

Template.schDelConfDialog.sch = function() {
  var schId = Session.get('selectedSchedule');

  if (schId) {
    var s = Schedules.findOne({_id: schId});
    if (s) {
      // var cBy = Meteor.users.findOne(s.createdBy);
      // if (cBy)
      //   createdBy = cBy.username;
      // else
      //   createdBy = '<System Account>';
      // var mBy = Meteor.users.findOne(s.modifiedBy);
      // if (mBy)
      //   modifiedBy = mBy.username;
      // else
      //   modifiedBy = '<System Account>';
      var sch = {
        empId: s.empId,
        validS: s.validS,
        validE: s.validE,
        status: s.status
        // createdBy: createdBy,
        // created: new Date(e.created),
        // modifiedBy: modifiedBy,
        // modified: new Date(e.modified)
      }
    }
  } else {
    var sch = {
      empId: '',
      validS: '',
      validE: '',
      status: ''
    }
  }
  return sch;
};

Template.schDelConfDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedSchedule', null);
    Session.set('showDialogSchDelConf', false);
  },
  'click .close': function(evt, tmpl) {
    Session.set('selectedSchedule', null);
    Session.set('showDialogSchDelConf', false);
  },
  'click .delete': function(evt, tmpl) {
    var s = {
      id: Session.get('selectedSchedule')
    }

    Meteor.call('scheduleRemove', s, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('Schedule deleted successfully.');
        Session.set('selectedSchedule', null);
        Session.set('showDialogSchDelConf', false);
      }
    });
  }
});