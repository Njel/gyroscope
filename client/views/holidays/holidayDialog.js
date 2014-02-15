Template.holidayDialog.selectedHoliday = function() {
  return Session.get('selectedHoliday');
};

Template.holidayDialog.hol = function() {
  var holId = Session.get('selectedHoliday');

  if (holId) {
    var h = Holidays.findOne(holId);
    if (h) {
      var hol = {
        date: h.date,
        title: h.title,
        createdBy: h.createdBy,
        created: new Date(h.created),
        modifiedBy: h.modifiedBy,
        modified: new Date(h.modified)
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

Template.holidayDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedHoliday', null);
    Session.set('showDialogHoliday', false);
  },
  'click .close': function(evt, tmpl) {
    Session.set('selectedHoliday', null);
    Session.set('showDialogHoliday', false);
  },
  'click .add': function(evt, tmpl) {
    var h = {
      date: tmpl.find('[name=date]').value,
      title: tmpl.find('[name=title]').value
    };
    
    // console.log(h);

    Meteor.call('holidayNew', h, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('New holiday created successfully.');
        Session.set('selectedHoliday', null);
        Session.set('showDialogHoliday', false);
      }
    });
  },
  'click .save': function(evt, tmpl) {
    var g = {
      id: Session.get('selectedHoliday'),
      date: tmpl.find('[name=date]').value,
      title: tmpl.find('[name=title]').value
    };

    Meteor.call('holidayUpd', g, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('Holiday updated successfully.');
        Session.set('selectedHoliday', null);
        Session.set('showDialogHoliday', false);
      }
    });
  }
});