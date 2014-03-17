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

Template.calendarFrame.rendered = function() {
  // console.log('Template.calendar.rendered');
  /* initialize the external events
  -----------------------------------------------------------------*/
  // $('#external-events div.external-event').each(function() {
  $('#external-events div.eventType').each(function() {
    // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
    // it doesn't need to have a start or end
    var eventObject = {
      title: $.trim($(this).text()), // use the element's text as the event title
      id: $(this)[0].id
    };

    // store the Event Object in the DOM element so we can get to it later
    $(this).data('eventObject', eventObject);
    
    // make the event draggable using jQuery UI
    $(this).draggable({
      zIndex: 999,
      revert: true,      // will cause the event to go back to its
      revertDuration: 0  //  original position after the drag
    });
  });
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
    var user = Meteor.user();
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
        var n = 0;
        var value = 0.0;
        var cValue = 0.0;

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
                  status: 'Generated',
                  allDay: false,
                  approved: null,
                  approver: null,
                  reviewed: null,
                  reviewer: null,
                  submitted: new Date().getTime(),
                  createdBy: user._id,
                  created: d,
                  modifiedBy: user._id,
                  modified: d
                };
                n++;
                value += p.hours;
                cValue += (p.hours * type.ratio);

                // create the event, save the id
                Events.insert(ev);

              });
            }
          }
        };

        var tot = Totals.findOne({postId: post._id, type: type._id});
        if (tot) {
          Totals.update(tot._id, {
            $inc: {
              value: value,
              cValue: cValue
            }, 
            $set: {
              modifiedBy: user._id,
              modified: d
            }
          });
        } else {
          Totals.insert({
            postId: post._id,
            empId: post.empId,
            year: post.year,
            month: post.month,
            type: type._id,
            code: type.code,
            unit: 'h',
            value: value,
            cValue: cValue,
            createdBy: user._id,
            created: d,
            modifiedBy: user._id,
            modified: d
          });
        }

        // update the post with the number of events
        // Posts.update(post._id, {$set: {status: 'New'}, $inc: {eventsCount: n}});
        Meteor.call('postUpdateStatus', {postId: post._id, eventsCount: n, status: 'Generated'}, function(error, eventId) {
          error && throwError(error.reason);
        });

        var s = Settings.findOne({name: 'lastCalEventMod'});
        Settings.update(s._id, {$set: {value: new Date()}});
        // Session.set('lastCalEventMod', new Date());
      }
    }
  }
});