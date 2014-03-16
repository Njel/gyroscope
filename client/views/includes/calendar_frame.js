Template.calendarFrame.lastCalEventMod = function() {
  return Settings.findOne({name: 'lastCalEventMod'}).value;
};

Template.calendarFrame.selectedEventType = function(t) {
  if (!Session.get('selectedEventType')) {
    Session.set('selectedEventType', t);
    return 'border-bottom: 8px solid gray;';
  }
  if (t == Session.get('selectedEventType'))
    return 'border-bottom: 8px solid gray;';
  else
    return 'border-bottom: 8px;';
};

Template.calendarFrame.eventTypes = function() {
  return EventTypes.find({active: true, parent: null}, {sort: {order: 1}});
};

Template.calendarFrame.helpers({
  isLocked: function() {
    if (isAdmin())
      return false;
    return (this.locked ? true : false);
  }
});

Template.calendarFrame.events({
  'click .eventType': function(evt, tmpl) {
    // console.log(evt.toElement.id);
    evt.preventDefault();
    Session.set('selectedEventType', evt.toElement.id);
  },
  'click #resetCal': function(evt, tmpl) {
    // console.log('Reset Calendar');
    evt.preventDefault();
    currEvents = Events.find({postId: Session.get('currentPostId')});
    currEvents.forEach(function(e) {
      var ev = {eventId: e._id};
      Meteor.call('eventDel', ev, function(error, eventId) {
        error && throwError(error.reason);
      });
    });
    post = Posts.findOne(Session.get('currentPostId'));
    Meteor.call('postResetCounters', post, function(error, eventId) {
      error && throwError(error.reason);
    });

    totals = Totals.find({year: post.year, month: post.month, empId: post.empId});
    totals.forEach(function(t) {
      Totals.remove(t._id);
    });
    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
    // Session.set('lastCalEventMod', new Date());
  },
  'click #genWDays': function(evt, tmpl) {
    // console.log(evt.toElement.id);
    evt.preventDefault();
    var post = Posts.findOne(Session.get('currentPostId'));
    var type = EventTypes.findOne({code: 'W'});

    if (post && type) {
      // console.log(post);
      var nbDays = new Date(post.year, post.month, 0).getDate();
      // console.log('Nb Days: ' + nbDays);
      var d0 = moment(new Date(post.year, post.month-1, 1));
      var D = d0.format("YYYY-MM-DD").substring(0,10);
      // console.log(D);

      var s = Schedules.findOne({empId: post.empId, validS: {$lte: D}, validE: {$gte: D}});
      if (s) {
        // console.log(s);
        for (var i = 1; i <= nbDays; i++) {
          d0 = moment(new Date(post.year, post.month-1, i));
          var d = d0.day();
          if (d != 0 && d != 6) {
            D = d0.format("YYYY-MM-DD").substring(0,10);
            var H = Holidays.findOne({date: D});
            if (!H) {
              var periods = Periods.find({schId: s._id, day: d});
              periods.forEach(function(p) {
                var ev = {
                  postId: post._id,
                  start: D + 'T' + p.start + ':00.000Z',
                  end: D + 'T' + p.end + ':00.000Z',
                  duration: p.hours,
                  unit: 'h',
                  period: p._id,
                  type: type._id,
                  title: type.code,
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
          }
        };
        var s = Settings.findOne({name: 'lastCalEventMod'});
        Settings.update(s._id, {$set: {value: new Date()}});
        // Session.set('lastCalEventMod', new Date());
      }
    }
  }
});