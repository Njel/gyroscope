Template.periodDialog.selectedCalPeriod = function() {
  return Session.get('selectedCalPeriod');
};

Template.periodDialog.days = function() {
  var days = [];
  for (var i = 0; i < 7; i++) {
    days.push({i: i, d: moment(new Date('2010-01-0' + (3 + i).toString() + 'T12:00:00.000Z')).format('ddd')});
  }
  return days;
};

Template.periodDialog.evt = function() {
  // console.log('evt()');
  var periodId = Session.get('selectedCalPeriod');

  if (periodId) {
    var p = Periods.findOne(periodId);
    if (p) {
      var calPeriod = {
        schId: p.schId,
        day: p.day,
        // day: moment(new Date('2010-01-0' + (3 + p.day).toString() + 'T12:00:00.000Z')).format('ddd'),
        start: moment(new Date('2010-01-0' + (3 + p.day).toString() + 'T' + p.start + ':00.000Z')),
        end: moment(new Date('2010-01-0' + (3 + p.day).toString() + 'T' + p.end + ':00.000Z')),
        status: p.status,
        createdBy: p.createdBy,
        created: new Date(p.created),
        modifiedBy: p.modifiedBy,
        modified: new Date(p.modified)
      }
    }
  } else {
    var sD = moment(Session.get('selectedCalDateStart'));
    var eD = moment(Session.get('selectedCalDateEnd'));
    var calPeriod = {
      schId: Session.get('currentScheduleId'),
      day: sD.day(),
      start: sD,
      end: eD,
      status: 'new'
    }
  }
  return calPeriod;
};

Template.periodDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedCalDateStart', null);
    Session.set('selectedCalDateEnd', null);
    Session.set('selectedCalPeriod', null);
    Session.set('showDialogCalPeriod', false);
  },
  'click .closeBtn': function(evt, tmpl) {
    Session.set('selectedCalDateStart', null);
    Session.set('selectedCalDateEnd', null);
    Session.set('selectedCalPeriod', null);
    Session.set('showDialogCalPeriod', false);
  },
  'click .add': function(evt, tmpl) {
    var currUser = Meteor.user();
    var d = parseInt(tmpl.find('[name=day]').value);
    var sD = new Date('01/0' + (3 + d).toString() + '/2010 ' + tmpl.find('[name=from]').value);
    var eD = new Date('01/0' + (3 + d).toString() + '/2010 ' + tmpl.find('[name=to]').value);
    if (eD < sD)
      var hours = (moment(eD).add('d', 1) - moment(sD)) / 1000 / 60 / 60;
    else
      var hours = (eD - sD) / 1000 / 60 / 60;
    var p = {
      schId: Session.get('currentScheduleId'),
      day: d,
      start: sD.toISOString().substring(11, 16),
      end: eD.toISOString().substring(11, 16),
      hours: hours,
      status: 'new'
    };

    Meteor.call('periodNew', p, function(error, eventId) {
      error && throwError(error.reason);
    });

    Session.set('selectedCalPeriod', null);
    Session.set('selectedCalDateStart', null);
    Session.set('selectedCalDateEnd', null);
    Session.set('showDialogCalPeriod', false);

    var s = Settings.findOne({name: 'lastCalPeriodMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
  },
  'click .save': function(evt, tmpl) {
    var currUser = Meteor.user();
    var d = parseInt(tmpl.find('[name=day]').value);
    var sD = new Date('01/0' + (3 + d).toString() + '/2010 ' + tmpl.find('[name=from]').value);
    var eD = new Date('01/0' + (3 + d).toString() + '/2010 ' + tmpl.find('[name=to]').value);
    if (eD < sD)
      var hours = (moment(eD).add('d', 1) - moment(sD)) / 1000 / 60 / 60;
    else
      var hours = (eD - sD) / 1000 / 60 / 60;
    var p = {
      periodId: Session.get('selectedCalPeriod'),
      day: d,
      start: sD.toISOString().substring(11, 16),
      end: eD.toISOString().substring(11, 16),
      hours: hours,
      status: 'updated'
    };

    Meteor.call('periodUpd', p, function(error, eventId) {
      error && throwError(error.reason);
    });

    Session.set('selectedCalPeriod', null);
    Session.set('showDialogCalPeriod', false);

    var s = Settings.findOne({name: 'lastCalPeriodMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
  }
});