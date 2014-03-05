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
  return EventTypes.find({active: true}, {sort: {order: 1}});
};

Template.calendar.helpers({
  isLocked: function() {
    if (isAdmin())
      return false;
    return (this.locked ? true : false);
  }
});

Template.calendar.events({
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
        for (var i = 1; i <= nbDays+1; i++) {
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
          d0 = moment(new Date(post.year, post.month-1, i));
        };
        var s = Settings.findOne({name: 'lastCalEventMod'});
        Settings.update(s._id, {$set: {value: new Date()}});
        // Session.set('lastCalEventMod', new Date());
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
  if (isAdmin())
    var editable = true;
  else {
    var post = Posts.findOne(Session.get('currentPostId'));
    if (post && !post.locked)
      var editable = true;
    else
      var editable = false;
  }

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
        // var h = (end - start) / 1000 / 60 / 60;
        var eType = EventTypes.findOne(e.type);
        if (eType) {
          events.push({
            id: e._id,
            // start: e.start._d,
            // end: e.end._d,
            start: start,
            end: end,
            // start: e.start,
            // end: e.end,
            type: e.type,
            title: eType.code + ' - ' + e.duration + ' ' + e.unit,
            textColor: eType.textColor,
            borderColor: eType.borderColor,
            backgroundColor: eType.backgroundColor,
            allDay: e.allDay
          });
        } else {
          events.push({
            id: e._id,
            // start: e.start._d,
            // end: e.end._d,
            start: start,
            end: end,
            // start: e.start,
            // end: e.end,
            type: e.type,
            title: e.duration + ' ' + e.unit,
            // textColor: eType.textColor,
            // borderColor: eType.borderColor,
            // backgroundColor: eType.backgroundColor,
            allDay: e.allDay
          });
        }
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
    selectable: editable,
    selectHelper: editable,
	  editable: editable,
    droppable: editable,
    eventStartEditable: editable,
    eventDurationEditable: editable,
    // timezone: 'America/New_York',
	  // contentHeight: 600,
    select: function(start, end, allDay, jsEvent, view) {
      // console.log('select');

      calendar.fullCalendar('unselect');

      var type = EventTypes.findOne(Session.get('selectedEventType'));
      if (type.unit == 'h') {
        var sD = moment(start);
        var D = sD.toISOString().substring(0,10);
        var H = sD.toISOString().substring(11,16); // 2014-01-02T17:00:00.000Z
        var post = Posts.findOne(Session.get('currentPostId'));
        var s = Schedules.findOne({empId: post.empId, validS: {$lte: D}, validE: {$gte: D}});
        if (s) {
          if (allDay) {
            var pId = 'allDay';
            var date = sD;
            var d = type.defaultDuration;
          } else {
            var pId = '';
            var date = sD;
            var eD = moment(end);
            var d = (eD - sD) / 1000 / 60 / 60;
          }

          var calEvent = {
            postId: post._id,
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
            backgroundColor: type.backgroundColor,
            typeUnit: type.unit
          };
        } else {
          return false;
        }
      } else {
        var d0 = moment(start);
        var D = d0.toISOString().substring(0,10);
        var H = d0.toISOString().substring(11,16); // 2014-01-02T17:00:00.000Z
        var post = Posts.findOne(Session.get('currentPostId'));
        var s = Schedules.findOne({empId: post.empId, validS: {$lte: D}, validE: {$gte: D}});
        if (s) {
          if (allDay) {
            var d = type.defaultDuration;
            var calEvent = {
              postId: post._id,
              start: d0.toISOString(),
              end: moment(d0).add('h', d).toISOString(),
              duration: d,
              unit: 'h',
              period: 'allDay',
              type: type._id,
              title: type.code,
              status: 'new',
              allDay: type.allDay,
              textColor: type.textColor,
              borderColor: type.borderColor,
              backgroundColor: type.backgroundColor,
              typeUnit: type.unit
            };
          } else {
            var p = Periods.findOne({schId: s._id, day: d0.day(), start: {$lte: H}, end: {$gt: H}});
            if (p) {
              var date = new Date(D + 'T' + p.start + ':00.000Z');
              var d = p.hours;
              var calEvent = {
                postId: Session.get('currentPostId'),
                start: date.toISOString(),
                end: moment(date).add('h', d).toISOString(),
                duration: d,
                unit: 'h',
                period: p._id,
                type: type._id,
                title: type.code,
                status: 'new',
                allDay: type.allDay,
                textColor: type.textColor,
                borderColor: type.borderColor,
                backgroundColor: type.backgroundColor,
                typeUnit: type.unit
              };
            } else {
              // var calEvent = null;
              return false;
            }
          }
        } else {
          // var calEvent = null;
          return false;
        }
      }
      if (calEvent) {
        // console.log(calEvent);
        // Session.set('calStartDate', new Date(date));
        Session.set('calEvent', calEvent);
        Session.set('calOperation', 'Add');
        Session.set('calEventUnit', calEvent.typeUnit);

        Session.set('calStartDate', start);
        Session.set('calMonthView', view.name);
        // Session.set('selectedCalAllDay', allDay);
        // Session.set('selectedCalDateStart', start);
        // Session.set('selectedCalDateEnd', end);
        // Session.set('selectedCalEventType', Session.get('selectedEventType'));
        Session.set('showDialogCalEvent', true);
      }
    },
   //  dayClick: function(date, allDay, jsEvent, view) {
   //  // dayClick: function(date, jsEvent, view) {
   //    console.log('dayClick');

   //    var type = EventTypes.findOne(Session.get('selectedEventType'));
   //    var d0 = moment(date);
   //    var D = d0.toISOString().substring(0,10);
   //    var H = d0.toISOString().substring(11,16); // 2014-01-02T17:00:00.000Z
   //    var post = Posts.findOne(Session.get('currentPostId'));
   //    var s = Schedules.findOne({empId: post.empId, validS: {$lte: D}, validE: {$gte: D}});
   //    if (s) {
   //      if (allDay) {
   //        var d = type.defaultDuration;
   //        var calEvent = {
   //          postId: Session.get('currentPostId'),
   //          start: d0.toISOString(),
   //          end: moment(d0).add('h', d).toISOString(),
   //          duration: d,
   //          unit: 'h',
   //          period: 'allDay',
   //          type: type._id,
   //          title: type.code,
   //          status: 'new',
   //          allDay: type.allDay,
   //          textColor: type.textColor,
   //          borderColor: type.borderColor,
   //          backgroundColor: type.backgroundColor
   //        };
   //      } else {
   //        var p = Periods.findOne({schId: s._id, day: d0.day(), start: {$lte: H}, end: {$gte: H}});
   //        if (p) {
   //          var date = new Date(D + 'T' + p.start + ':00.000Z');
   //          var d = p.hours;
   //          var calEvent = {
   //            postId: Session.get('currentPostId'),
   //            start: date.toISOString(),
   //            end: moment(date).add('h', d).toISOString(),
   //            duration: d,
   //            unit: 'h',
   //            period: p._id,
   //            type: type._id,
   //            title: type.code,
   //            status: 'new',
   //            allDay: type.allDay,
   //            textColor: type.textColor,
   //            borderColor: type.borderColor,
   //            backgroundColor: type.backgroundColor
   //          };
   //        } else {
   //          var calEvent = null;
   //        }
   //      }
   //    } else {
   //      var calEvent = null;
   //    }
   //    if (calEvent) {
   //      // console.log(calEvent);
   //      // Session.set('calStartDate', new Date(date));
   //      Session.set('calEvent', calEvent);
   //      Session.set('calOperation', 'Add');
   //
   //      Session.set('calStartDate', date);
   //      Session.set('calMonthView', view.name);
   //      Session.set('selectedCalAllDay', allDay);
   //      Session.set('selectedCalDateStart', date);
   //      Session.set('selectedCalDateEnd', date);
   //      Session.set('selectedCalEventType', Session.get('selectedEventType'));
   //      Session.set('showDialogCalEvent', true);
   //    }
  	// },
  	eventClick: function(evt, jsEvent, view) {
      // console.log(evt);
      if (evt.url || !editable)
        return false;

      var e = Events.findOne(evt.id);
      if (e) {
        var dateTimeFormat = Settings.findOne({name: 'DateTimeFormat'}).value;
        var type = EventTypes.findOne(e.type);
        var calEvent = {
          _id: e._id,
          postId: e.postId,
          start: moment(new Date(e.start)).format(dateTimeFormat),
          end: moment(new Date(e.end)).format(dateTimeFormat),
          duration: e.duration,
          unit: e.unit,
          period: e.period,
          type: e.type,
          title: e.title,
          status: e.status,
          allDay: e.allDay,
          createdBy: e.createdBy,
          created: new Date(e.created),
          modifiedBy: e.modifiedBy,
          modified: new Date(e.modified),
          textColor: type.textColor,
          borderColor: type.borderColor,
          backgroundColor: type.backgroundColor,
          typeUnit: type.unit
        }

        Session.set('calEvent', calEvent);
        Session.set('calOperation', 'Update');
        Session.set('calEventUnit', calEvent.typeUnit);

        Session.set('calStartDate', evt.start);
        Session.set('calMonthView', view.name);
        // Session.set('selectedCalEvent', evt.id);
        // Session.set('selectedCalEventType', evt.type);
        Session.set('showDialogCalEvent', true);
      } else {
        return false;
      }
  	},
    // eventDrop: function(evt, revertFunc, jsEvent, ui, view) {
    eventDrop: function(evt, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view) {
      var currUser = Meteor.user();
      var start = new Date(evt.start);
      var end = new Date(evt.end);
      var d = (end - start) / 1000 / 60 / 60;
      var e = Events.findOne(evt.id);
      var ev = {
        postId: e.postId,
        eventId: evt.id,
        start: start.toISOString(),
        end: end.toISOString(),
        duration: d,
        type: e.type,
        allDay: allDay,
        pX: null,
        nX: null
      };

      var eT = EventTypes.findOne(e.type);
      if (eT.code == 'X') {
        var pX = calcExtraHours(e);
        var nX = calcExtraHours(ev);
        ev.pX = pX;
        ev.nX = nX;
        // console.log(pX);
        // console.log(nX);
      }

      Meteor.call('eventMove', ev, function(error, eventId) {
        error && throwError(error.reason);
      });

      // var s = Settings.findOne({name: 'lastCalEventMod'});
      // Settings.update(s._id, {$set: {value: new Date()}});
    },
    eventResize: function(evt, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view) {
      // alert("The end date of " + evt.title + "has been moved " +
      //       dayDelta + " days and " +
      //       minuteDelta + " minutes.");
      var currUser = Meteor.user();
      var start = new Date(evt.start);
      var end = new Date(evt.end);
      var hours = (end - start) / 1000 / 60 / 60;
      var e = Events.findOne(evt.id);
      var ev = {
        postId: e.postId,
        eventId: evt.id,
        start: start.toISOString(),
        end: end.toISOString(),
        duration: hours,
        type: e.type,
        allDay: e.allDay,
        pX: null,
        nX: null
      };

      var eT = EventTypes.findOne(e.type);
      if (eT.code == 'X') {
        var pX = calcExtraHours(e);
        var nX = calcExtraHours(ev);
        ev.pX = pX;
        ev.nX = nX;
        // console.log(pX);
        // console.log(nX);
      }

      Meteor.call('eventMove', ev, function(error, eventId) {
        error && throwError(error.reason);
      });

      // var s = Settings.findOne({name: 'lastCalEventMod'});
      // Settings.update(s._id, {$set: {value: new Date()}});
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

      var type = EventTypes.findOne(copiedEventObject.id);
      if (type.unit == 'p') {
        if (allDay) {
          var d0 = moment(date);
          var D = d0.toISOString().substring(0, 10);
          var post = Posts.findOne(Session.get('currentPostId'));
          var s = Schedules.findOne({empId: post.empId, validS: {$lte: D}, validE: {$gte: D}});
          if (s) {
            var periods = Periods.find({schId: s._id, day: d0.day()});
            periods.forEach(function(p) {
              var where = "this.start.substring(0, 10) == '" + D + "'";
              var e = Events.findOne({postId: Session.get('currentPostId'), period: p._id, $where: where});
              if (e) {
                var ev = {
                  eventId: e._id,
                  type: type._id
                };

                Meteor.call('eventRpl', ev, function(error, eventId) {
                  error && throwError(error.reason);
                });
              } else {
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
                  backgroundColor: type.backgroundColor,
                  typeUnit: type.unit
                };

                Meteor.call('eventNew', ev, function(error, eventId) {
                  error && throwError(error.reason);
                });
              }
            });
          }
        } else {
          var d0 = moment(date);
          var D = d0.toISOString().substring(0, 10);
          var H = d0.toISOString().substring(11, 16); // 2014-01-02T17:00:00.000Z
          var post = Posts.findOne(Session.get('currentPostId'));
          var s = Schedules.findOne({empId: post.empId, validS: {$lte: D}, validE: {$gte: D}});
          if (s) {
            var p = Periods.findOne({schId: s._id, day: d0.day(), start: {$lte: H}, end: {$gt: H}});
            if (p) {
              var where = "this.start.substring(0, 10) == '" + D + "'";
              var e = Events.findOne({postId: Session.get('currentPostId'), period: p._id, $where: where});
              if (e) {
                var ev = {
                  eventId: e._id,
                  type: type._id
                };

                Meteor.call('eventRpl', ev, function(error, eventId) {
                  error && throwError(error.reason);
                });
              } else {
                var pId = p._id;
                date = new Date(D + 'T' + p.start + ':00.000Z');
                var d = p.hours;

                var ev = {
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
                  allDay: allDay,
                  textColor: type.textColor,
                  borderColor: type.borderColor,
                  backgroundColor: type.backgroundColor,
                  typeUnit: type.unit
                };

                Meteor.call('eventNew', ev, function(error, eventId) {
                  error && throwError(error.reason);
                });
              }
            }
          }
        }
      } else {
        var d0 = moment(date);
        var D = d0.toISOString().substring(0, 10);
        var H = d0.toISOString().substring(11, 16);

        var where = "this.start.substring(0, 10) == '" + D + "' && this.start.substring(11, 16) <= '" + H + "' && this.end.substring(11, 16) >= '" + H + "'";
        var e = Events.findOne({postId: Session.get('currentPostId'), $where: where});
        if (e) {
          var pEnd = e.end;
          var start = new Date(e.start);
          var end = new Date(date);
          var d = (end - start) / 1000 / 60 / 60;
          if (d > 0) {
            var ev = {
              eventId: e._id,
              start: e.start,
              end: date.toISOString(),
              duration: d,
              period: null
            };

            Meteor.call('eventMove', ev, function(error, eventId) {
              error && throwError(error.reason);
            });
          } else {
            var ev = {
              eventId: e._id
            };

            Meteor.call('eventDel', ev, function(error, eventId) {
              error && throwError(error.reason);
            });
          }

          var pId = null;
          var d = type.defaultDuration;
          if (pEnd < moment(date).add('h', d).toISOString()) {
            var end = pEnd;
            var d = (new Date(end) - date) / 1000 / 60 / 60;
          } else {
            if (pEnd > moment(date).add('h', d).toISOString()) {
              var start = moment(date).add('h', d);
              var d = (new Date(pEnd) - start) / 1000 / 60 / 60;
              var ev = {
                postId: Session.get('currentPostId'),
                start: start.toISOString(),
                end: pEnd,
                duration: d,
                unit: 'h',
                period: e.period,
                type: e.type,
                title: e.title,
                status: 'new',
                allDay: e.allDay,
                textColor: e.textColor,
                borderColor: e.borderColor,
                backgroundColor: e.backgroundColor,
                typeUnit: e.unit
              };

              Meteor.call('eventNew', ev, function(error, eventId) {
                error && throwError(error.reason);
              });
              var d = type.defaultDuration;
            }
          }

          var ev = {
            postId: Session.get('currentPostId'),
            start: date.toISOString(),
            end: moment(date).add('h', d).toISOString(),
            duration: d,
            unit: 'h',
            period: pId,
            type: type._id,
            title: type.code,
            status: 'new',
            allDay: allDay,
            textColor: type.textColor,
            borderColor: type.borderColor,
            backgroundColor: type.backgroundColor,
            typeUnit: type.unit
          };

          Meteor.call('eventNew', ev, function(error, eventId) {
            error && throwError(error.reason);
          });
        } else {
          var pId = null;
          var d = type.defaultDuration;

          var ev = {
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
            allDay: allDay,
            textColor: type.textColor,
            borderColor: type.borderColor,
            backgroundColor: type.backgroundColor,
            typeUnit: type.unit
          };

          Meteor.call('eventNew', ev, function(error, eventId) {
            error && throwError(error.reason);
          });
        }
      }

      // // var currUser = Meteor.user();
      // var ev = {
      //   postId: Session.get('currentPostId'),
      //   // userId: currUser._id,
      //   // author: currUser.username,
      //   start: date.toISOString(),
      //   end: moment(date).add('h', d).toISOString(),
      //   duration: d,
      //   unit: 'h',
      //   period: pId,
      //   type: copiedEventObject.id,
      //   title: copiedEventObject.title,
      //   status: 'new',
      //   allDay: allDay,
      //   backgroundColor: copiedEventObject.background
      // };

      // Meteor.call('eventNew', ev, function(error, eventId) {
      //   error && throwError(error.reason);
      // });

      // var s = Settings.findOne({name: 'lastCalEventMod'});
      // Settings.update(s._id, {$set: {value: new Date()}});

      // render the event on the calendar
      // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
      // $('#calendar').fullCalendar('renderEvent', copiedEventObject, true);
      
      // is the "remove after drop" checkbox checked?
      // if ($('#drop-remove').is(':checked')) {
      //   // if so, remove the element from the "Draggable Events" list
      //   $(this).remove();
      // }
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