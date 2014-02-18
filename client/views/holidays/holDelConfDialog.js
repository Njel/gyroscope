Template.holDelConfDialog.selectedHoliday = function() {
  return Session.get('selectedHoliday');
};

Template.holDelConfDialog.grp = function() {
  var holId = Session.get('selectedHoliday');

  if (holId) {
    var h = Holidays.findOne(holId);
    if (h) {
      var hol = {
        date: h.date,
        title: h.title
      }
    }
  } else {
    var hol = {
      date: '',
      title: ''
    }
  }
  return hol;
};

Template.holDelConfDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedHoliday', null);
    Session.set('showDialogHolDelConf', false);
  },
  'click .close': function(evt, tmpl) {
    Session.set('selectedHoliday', null);
    Session.set('showDialogHolDelConf', false);
  },
  'click .delete': function(evt, tmpl) {
    var h = {
      id: Session.get('selectedHoliday')
    }

    Meteor.call('holidayRemove', h, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('Holiday deleted successfully.');
        Session.set('selectedHoliday', null);
        Session.set('showDialogHolDelConf', false);
      }
    });
  }
});