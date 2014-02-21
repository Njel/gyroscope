Template.calendar.lastCalEventMod = function() {
  return Settings.findOne({name: 'lastCalEventMod'}).value;
};

Template.calendar.selectedEventType = function(t) {
  if (!Session.get('selectedEventType')) {
    Session.set('selectedEventType', t);
    return 'border-bottom: 8px solid gray;';
  }
  if (t == Session.get('selectedEventType'))
    return 'border-bottom: 8px solid gray;';
  else
    return 'border-bottom: 8px;';
};

Template.calendar.eventTypes = function() {
  return EventTypes.find({active: true});
};

Template.calendar.events({
  'click .eventType': function(evt, tmpl) {
    // console.log(evt.toElement.id);
    evt.preventDefault();
    Session.set('selectedEventType', evt.toElement.id);
  },
  'click #resetCal': function(evt, tmpl) {
    evt.preventDefault();
    console.log('Reset Calendar');

    currEvents = Events.find({postId: Session.get('currentPostId')});
    currEvents.forEach(function(e) {
      var ev = {eventId: e._id};
      Meteor.call('eventDel', ev, function(error, eventId) {
        error && throwError(error.reason);
      });
    });
    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
    Session.set('lastCalEventMod', new Date());
  },
  'click #genWDays': function(evt, tmpl) {
    // console.log(evt.toElement.id);
    evt.preventDefault();
    var post = Posts.findOne(Session.get('currentPostId'));
    var type = EventTypes.findOne({code: 'W'});

    if (post) {
      // console.log(post.empId);
      var nbDays = new Date(post.year, post.month, 0).getDate();
      // console.log('Nb Days: ' + nbDays);
      var d0 = moment(new Date(post.year, post.month-1, 1));
      var D = d0.toISOString().substring(0,10);
      // console.log(D);

      var s = Schedules.findOne({empId: post.empId, validS: {$lte: D}, validE: {$gte: D}});
      if (s) {
        // console.log(s);
        for (var i = 1; i <= nbDays; i++) {
          var d = d0.day();
          if (d != 0 && d != 6) {
            D = d0.toISOString().substring(0,10);
            var H = Holidays.findOne({date: D});
            if (!H) {
              var periods = Periods.find({schId: s._id, day: d});
              periods.forEach(function(p) {
                var ev = {
                  postId: post._id,
                  start: D + 'T' + p.start + ':00.000Z',
                  end: D + 'T' + p.end + ':00.000Z',
                  hours: p.hours,
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
          d0 = moment(new Date(post.year, post.month-1, i));
        };
        var s = Settings.findOne({name: 'lastCalEventMod'});
        Settings.update(s._id, {$set: {value: new Date()}});
        Session.set('lastCalEventMod', new Date());
      }
    }
  }
});

Template.calendar.rendered = function() {
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

  /* initialize the calendar
  -----------------------------------------------------------------*/
  var calendar = $('#calendar').fullCalendar({
    // eventSources: [
    //   // "json-events.cfm",
    //   // $.fullCalendar.gcalFeed('http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic')
    //   {
    //     url: 'http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic',
    //     className: 'holiday',
    //     editable: false
    //   }
    // ],
    // events: function(start, end, timezone, callback) {
    events: function(start, end, callback) {
      var events = [];
      currEvents = Events.find({postId: Session.get('currentPostId')});
      currEvents.forEach(function(e) {
        var start = new Date(e.start);
        var end = new Date(e.end);
        var h = (end - start) / 1000 / 60 / 60;
        var eType = EventTypes.findOne(e.type);
        events.push({
          id: e._id,
          // start: e.start._d,
          // end: e.end._d,
          start: start,
          end: end,
          // start: e.start,
          // end: e.end,
          title: eType.code + ' - ' + h + ' h',
          textColor: eType.textColor,
          borderColor: eType.borderColor,
          backgroundColor: eType.backgroundColor,
          allDay: e.allDay
        });
      });
      currHolidays = Holidays.find();
      currHolidays.forEach(function(h) {
        events.push({
          id: h._id,
          start: new Date(h.date + 'T12:00:00.000Z'),
          // start: new Date(h.date),
          end: null,
          title: h.title,
          textColor: '#000',
          // borderColor: '#000',
          // backgroundColor: '#aaa',
          allday: true,
          className: 'holiday',
          editable: false,
          selectable: false,
          eventStartEditable: false,
          eventDurationEditable: false,
          url: '-'
        })
      });
      callback(events);
    },
    height: 797,
    weekNumbers: true,
  	header: {
		  left: 'prev, next today',
			center: 'title',
			right: 'month, agendaWeek, agendaDay'
		},
    selectable: true,
    selectHelper: true,
	  editable: true,
    droppable: true,
    eventStartEditable: true,
    eventDurationEditable: true,
    // timezone: 'America/New_York',
	  // contentHeight: 600,
    select: function(start, end, allDay, jsEvent, view) {
      calendar.fullCalendar('unselect');
      Session.set('calStartDate', start);
      Session.set('calMonthView', view.name);
      Session.set('selectedCalDateStart', start);
      Session.set('selectedCalDateEnd', end);
      Session.set('showDialogCalEvent', true);
    },
    dayClick: function(date, allDay, jsEvent, view) {
    // dayClick: function(date, jsEvent, view) {
      // Session.set('calStartDate', new Date(date));
      Session.set('calStartDate', date);
      Session.set('calMonthView', view.name);
      Session.set('selectedCalDateStart', date);
      Session.set('selectedCalDateEnd', date);
      Session.set('showDialogCalEvent', true);
  	},
  	eventClick: function(evt, jsEvent, view) {
      // console.log(evt);
      if (evt.url)
        return false;
      Session.set('calStartDate', evt.start);
      Session.set('calMonthView', view.name);
      Session.set('selectedCalEvent', evt.id);
      Session.set('showDialogCalEvent', true);
  	},
    // eventDrop: function(evt, revertFunc, jsEvent, ui, view) {
    eventDrop: function(evt, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view) {
      var currUser = Meteor.user();
      var start = new Date(evt.start);
      var end = new Date(evt.end);
      var hours = (end - start) / 1000 / 60 / 60;
      var ev = {
        eventId: evt.id,
        start: start.toISOString(),
        hours: hours,
        end: end.toISOString()
      };

      Meteor.call('eventMove', ev, function(error, eventId) {
        error && throwError(error.reason);
      });

      var s = Settings.findOne({name: 'lastCalEventMod'});
      Settings.update(s._id, {$set: {value: new Date()}});
    },
    eventResize: function(evt, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view) {
      // alert("The end date of " + evt.title + "has been moved " +
      //       dayDelta + " days and " +
      //       minuteDelta + " minutes.");
      var currUser = Meteor.user();
      var start = new Date(evt.start);
      var end = new Date(evt.end);
      var hours = (end - start) / 1000 / 60 / 60;
      var ev = {
        eventId: evt.id,
        start: start.toISOString(),
        end: end.toISOString(),
        hours: hours
      };

      Meteor.call('eventMove', ev, function(error, eventId) {
        error && throwError(error.reason);
      });

      var s = Settings.findOne({name: 'lastCalEventMod'});
      Settings.update(s._id, {$set: {value: new Date()}});
    },
    drop: function(date, allDay, jsEvent, ui) {
      var view = $('#calendar').fullCalendar('getView');
      Session.set('calMonthView', view.name);
      Session.set('calStartDate', date);
      // Session.set('selectedCalDateStart', date);
      // Session.set('selectedCalDateEnd', date);

      // retrieve the dropped element's stored Event Object
      var originalEventObject = $(this).data('eventObject');
      
      // we need to copy it, so that multiple events don't have a reference to the same object
      var copiedEventObject = $.extend({}, originalEventObject);
      
      // assign it the date that was reported
      copiedEventObject.start = date;

     
      // var currUser = Meteor.user();
      var ev = {
        postId: Session.get('currentPostId'),
        // userId: currUser._id,
        // author: currUser.username,
        start: date.toISOString(),
        end: moment(date).add('hour', 2).toISOString(),
        hours: 2,
        type: copiedEventObject.id,
        title: copiedEventObject.title,
        status: 'new',
        allDay: allDay,
        backgroundColor: copiedEventObject.background
      };

      Meteor.call('eventNew', ev, function(error, eventId) {
        error && throwError(error.reason);
      });

      var s = Settings.findOne({name: 'lastCalEventMod'});
      Settings.update(s._id, {$set: {value: new Date()}});

      // render the event on the calendar
      // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
      $('#calendar').fullCalendar('renderEvent', copiedEventObject, true);
      
      // is the "remove after drop" checkbox checked?
      if ($('#drop-remove').is(':checked')) {
        // if so, remove the element from the "Draggable Events" list
        $(this).remove();
      }
    }
  });
  $('#calendar').fullCalendar('changeView', Session.get('calMonthView'));
  $('#calendar').fullCalendar('gotoDate', Session.get('calStartDate'));
  //$('#calendar').fullCalendar('gotoDate', new Date());
  // $('#calendar').fullCalendar('viewRender', function(view, element) {
  //     Session.set('calMonthView', view.name);
  //   });
  // $('#calendar').fullCalendar('viewDestroy', function(view, element) {
  //     Session.set('calMonthView', view.name);
  //   });
};