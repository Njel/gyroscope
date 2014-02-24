Template.eventDialog.selectedCalEvent = function() {
  return Session.get('selectedCalEvent');
};

Template.eventDialog.byPeriod = function() {
  var sET = Session.get('selectedCalEventType');
  if (sET) {
    var eT = EventTypes.findOne(Session.get('selectedCalEventType'));
    if (eT && eT.unit == 'p')
      return true;
  }
  return false;
};

Template.eventDialog.eventTypes = function() {
  return EventTypes.find({active: true});
};

Template.eventDialog.periods = function(e) {
  var d0 = moment(new Date(e.start));
  var D = d0.toISOString().substring(0,10);
  var post = Posts.findOne(e.postId);
  var s = Schedules.findOne({empId: post.empId, validS: {$lte: D}, validE: {$gte: D}});
  if (s) {
    var P = [];
    var periods = Periods.find({schId: s._id, day: d0.day()});
    periods.forEach(function(p) {
      P.push({
        _id: p._id,
        start: moment(new Date(D + 'T' + p.start + ':00.000Z')).format('HH:mm'),
        end: moment(new Date(D + 'T' + p.end + ':00.000Z')).format('HH:mm')
      });
    });
    return P;
  }
  return null;
};

Template.eventDialog.evt = function() {
  var eventId = Session.get('selectedCalEvent');

  if (eventId) {
    var evt = Events.findOne({_id: eventId});
    if (evt) {
      var dateTimeFormat = Settings.findOne({name: 'DateTimeFormat'}).value;
      var calEvent = {
        postId: evt.postId,
        // start: evt.start._d,
        // start: evt.start,
        start: moment(new Date(evt.start)).format(dateTimeFormat),
        // end: evt.end._d,
        // end: evt.end,
        end: moment(new Date(evt.end)).format(dateTimeFormat),
        duration: evt.duration,
        unit: evt.unit,
        period: evt.period,
        type: evt.type,
        title: evt.title,
        status: evt.status,
        allDay: evt.allDay,
        createdBy: evt.createdBy,
        created: new Date(evt.created),
        modifiedBy: evt.modifiedBy,
        modified: new Date(evt.modified)
      }
    }
  } else {
    var start = Session.get('selectedCalDateStart');
    var end = Session.get('selectedCalDateEnd');
    var type = EventTypes.findOne(Session.get('selectedEventType'));
    var d0 = moment(start);
    var D = d0.toISOString().substring(0,10);
    var H = d0.toISOString().substring(11,16); // 2014-01-02T17:00:00.000Z
    var post = Posts.findOne(Session.get('currentPostId'));
    var s = Schedules.findOne({empId: post.empId, validS: {$lte: D}, validE: {$gte: D}});
    if (s) {
      var p = Periods.findOne({schId: s._id, day: d0.day(), start: {$lte: H}, end: {$gte: H}});
      if (p) {
        var pId = p._id;
        date = new Date(D + 'T' + p.start + ':00.000Z');
        var d = p.hours;

        var calEvent = {
          postId: Session.get('currentPostId'),
          // userId: currUser._id,
          // author: currUser.username,
          start: date.toISOString(),
          end: moment(date).add('h', d).toISOString(),
          duration: d,
          unit: 'h',
          period: pId,
          type: type._id,
          title: type.code,
          status: 'new',
          allDay: type.allDay,
          textColor: type.textColor,
          borderColor: type.borderColor,
          backgroundColor: type.backgroundColor
        };
      }
    } else {
      var calEvent = {
        postId: Session.get('currentPostId'),
        start: start,
        // start: moment(new Date(start)).format('MM/DD/YYYY HH:mm'),
        end: end,
        // end: moment(new Date(end)).format('MM/DD/YYYY HH:mm'),
        duration: type.defaultDuration,
        unit: type.unit,
        period: 'allDay',
        type: type._id,
        title: type.code,
        status: 'new',
        allDay: type.allDay,
        textColor: type.textColor,
        borderColor: type.borderColor,
        backgroundColor: type.backgroundColor
      }
    }
  }
  return calEvent;
};

Template.eventDialog.rendered = function() {
  $( "#date" ).datepicker({minDate: new Date("01/01/2014"), maxDate: new Date("01/31/2014")});
};

Template.eventDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedCalDateStart', null);
    Session.set('selectedCalDateEnd', null);
    Session.set('selectedCalEvent', null);
    Session.set('showDialogCalEvent', false);
  },
  'click .closeBtn': function(evt, tmpl) {
    Session.set('selectedCalDateStart', null);
    Session.set('selectedCalDateEnd', null);
    Session.set('selectedCalEvent', null);
    Session.set('showDialogCalEvent', false);
  },
  'click .add': function(evt, tmpl) {
    var currUser = Meteor.user();
    var eT = EventTypes.findOne(tmpl.find('[name=type]').value);
    if (eT.unit == 'h') {
      var sD = new Date(tmpl.find('[name=date]').value + ' ' + tmpl.find('[name=from]').value);
      var eD = new Date(tmpl.find('[name=date]').value + ' ' + tmpl.find('[name=to]').value);
      var duration = (eD - sD) / 1000 / 60 / 60;

      var ev = {
        postId: Session.get('currentPostId'),
        // userId: currUser._id,
        // author: currUser.username,
        start: sD.toISOString(),
        end: eD.toISOString(),
        // start: moment(new Date(tmpl.find('[name=from]').value)),
        // end: moment(new Date(tmpl.find('[name=to]').value)),
        duration: duration,
        unit: eT.unit,
        period: null,
        type: tmpl.find('[name=type]').value,
        title: tmpl.find('[name=title]').value,
        status: 'new',
        allDay: eT.allDay
      };

      Meteor.call('eventNew', ev, function(error, eventId) {
        error && throwError(error.reason);
      });
    } else {
      if (tmpl.find('[name=period]').value == 'allDay') {
        var d0 = moment(tmpl.find('[name=date]').value);
        var D = d0.toISOString().substring(0,10);
        var post = Posts.findOne(Session.get('currentPostId'));
        var type = EventTypes.findOne(tmpl.find('[name=type]').value);
        var s = Schedules.findOne({empId: post.empId, validS: {$lte: D}, validE: {$gte: D}});
        if (s) {
          var periods = Periods.find({schId: s._id, day: d0.day()});
          periods.forEach(function(p) {
            var ev = {
              postId: post._id,
              start: D + 'T' + p.start + ':00.000Z',
              end: D + 'T' + p.end + ':00.000Z',
              duration: p.hours,
              unit: 'h',
              period: p._id,
              type: type._id,
              title: tmpl.find('[name=title]').value,
              status: 'new',
              allDay: false,
              textColor: type.textColor,
              borderColor: type.borderColor,
              backgroundColor: type.backgroundColor
            };
            Meteor.call('eventNew', ev, function(error, eventId) {
              error && throwError(error.reason);
            });
          });
        }
      } else {
        var p = Periods.findOne(tmpl.find('[name=period]').value);
        var d0 = moment(tmpl.find('[name=date]').value);
        var D = d0.toISOString().substring(0,10);
        var type = EventTypes.findOne(tmpl.find('[name=type]').value);

        var ev = {
          postId: Session.get('currentPostId'),
          // userId: currUser._id,
          // author: currUser.username,
          start: D + 'T' + p.start + ':00.000Z',
          end: D + 'T' + p.end + ':00.000Z',
          // start: moment(new Date(tmpl.find('[name=from]').value)),
          // end: moment(new Date(tmpl.find('[name=to]').value)),
          duration: p.hours,
          unit: 'h',
          period: p._id,
          type: type._id,
          title: tmpl.find('[name=title]').value,
          status: 'new',
          allDay: eT.allDay,
          textColor: type.textColor,
          borderColor: type.borderColor,
          backgroundColor: type.backgroundColor
        };

        Meteor.call('eventNew', ev, function(error, eventId) {
          error && throwError(error.reason);
        });
      }
    }

    if (eT.code == 'X') {
      var xHrs = calcHours(tmpl.find('[name=from]').value, tmpl.find('[name=to]').value, false, 17, 00);
      // console.log(xHrs);
    }

    // Events.insert({
    //   postId: Session.get('currentPostId'), 
    //   start: '2014-02-05T13:00:00.000Z', 
    //   end: '2014-02-05T18:00:00.000Z', 
    //   type: 'T', 
    //   title: 'test', 
    //   allDay: false});

    // var ev = {
    //   postId: Session.get('currentPostId'),
    //   // userId: currUser._id,
    //   // author: currUser.username,
    //   start: sD.toISOString(),
    //   end: eD.toISOString(),
    //   // start: moment(new Date(tmpl.find('[name=from]').value)),
    //   // end: moment(new Date(tmpl.find('[name=to]').value)),
    //   duration: tmpl.find('[name=duration]').value,
    //   unit: eT.unit,
    //   type: tmpl.find('[name=type]').value,
    //   title: tmpl.find('[name=title]').value,
    //   status: 'new',
    //   allDay: eT.allDay
    // };

    // Meteor.call('eventNew', ev, function(error, eventId) {
    //   error && throwError(error.reason);
    // });

    Session.set('selectedCalEvent', null);
    Session.set('selectedCalDateStart', null);
    Session.set('selectedCalDateEnd', null);
    Session.set('showDialogCalEvent', false);

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
  },
  'click .save': function(evt, tmpl) {
    var currUser = Meteor.user();
    var sD = new Date(tmpl.find('[name=from]').value);
    var eD = new Date(tmpl.find('[name=to]').value);
    var duration = (eD - sD) / 1000 / 60 / 60;
    var eT = EventTypes.findOne(tmpl.find('[name=type]').value);
    var ev = {
      eventId: Session.get('selectedCalEvent'),
      // start: tmpl.find('[name=from]').value,
      // end: tmpl.find('[name=to]').value,
      start: sD.toISOString(),
      end: eD.toISOString(),
      duration: tmpl.find('[name=duration]').value,
      unit: eT.unit,
      type: tmpl.find('[name=type]').value,
      title: tmpl.find('[name=title]').value,
      status: 'new',
      allDay: eT.allDay
    };

    Meteor.call('eventUpd', ev, function(error, eventId) {
      error && throwError(error.reason);
    });

    Session.set('selectedCalEvent', null);
    Session.set('showDialogCalEvent', false);

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
  },
  'click .deleteBtn': function(evt, tmpl) {
    event.preventDefault();
    var ev = {eventId: Session.get('selectedCalEvent')};

    //Meteor.call('eventDel', this._id);
    Meteor.call('eventDel', ev, function(error, eventId) {
      error && throwError(error.reason);
    });

    Session.set('selectedCalEvent', null);
    Session.set('showDialogCalEvent', false);

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
  },
  'change .typeCb': function(evt, tmpl) {
    var eT = EventTypes.findOne(tmpl.find('[name=type]').value);
    tmpl.find('[name=title]').value = eT.code;
    Session.set('selectedCalEventType', eT._id);
  },
  'change .from': function(evt, tmpl) {
    var t = evt.target.value;
    if (t.length == 1)
      t = '0' + t + ':';
    else {
      p = t.indexOf(':');
      if (p == -1)
        t = t + ':';
      else
        if (p == 0)
          t = '00' + t;
        if (p == 1)
          t = '0' + t;
    }
    t = (t + "00").substring(0, 5);
    tmpl.find('[name=from]').value = t;
    var d = moment(new Date(tmpl.find('[name=date]').value + ' ' + t));
    tmpl.find('[name=to]').value = d.add('h', parseFloat(tmpl.find('[name=duration]').value)).format('HH:mm');
  },
  'change .to': function(evt, tmpl) {
    var t = evt.target.value;
    if (t.length == 1)
      t = '0' + t + ':';
    else {
      p = t.indexOf(':');
      if (p == -1)
        t = t + ':';
      else
        if (p == 0)
          t = '00' + t;
        if (p == 1)
          t = '0' + t;
    }
    t = (t + "00").substring(0, 5);
    tmpl.find('[name=to]').value = t;
    var d0 = moment(new Date(tmpl.find('[name=date]').value + ' ' + tmpl.find('[name=from]').value));
    var d1 = moment(new Date(tmpl.find('[name=date]').value + ' ' + t));
    tmpl.find('[name=duration]').value = d1.diff(d0, 'h', true);
  },
  'change .duration': function(evt, tmpl) {
    var d = moment(new Date(tmpl.find('[name=date]').value + ' ' + tmpl.find('[name=from]').value));
    tmpl.find('[name=to]').value = d.add('h', parseFloat(evt.target.value)).format('HH:mm');
  }
});