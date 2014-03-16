Template.scheduleCalendar.lastCalPeriodMod = function() {
  return Settings.findOne({name: 'lastCalPeriodMod'}).value;
};

Template.scheduleCalendar.events({
  'click #genWYearDays': function(evt, tmpl) {
    // console.log(evt.toElement.id);
    evt.preventDefault();

    var empId = tmpl.find('[name=empId]').value;
    var year = parseInt(tmpl.find('[name=year]').value);
    var month = parseInt(tmpl.find('[name=month]').value);
    var title = moment(new Date(year, month, 1)).format('MMMM YYYY');
    var post = {
      empId: empId,
      title: title,
      year: year,
      month: (month + 1)
    };

    // console.log(post);

    Meteor.call('post', post, function(error, id) {
      if (error) {
        // display the error to the user
        throwError(error.reason);

        if (error.error === 302) {
          Session.set('showDialogPost', false);
          Meteor.Router.to('postPage', error.details);
        }
      // } else {
      //   Meteor.Router.to('postPage', id);
      } else {
        throwMessage('New month created successfully.');
        Session.set('selectedPost', null);
        Session.set('showDialogPost', false);
      }
    });
    
    var post = Posts.findOne(Session.get('currentPostId'));
    var type = EventTypes.findOne({code: 'W'});

    if (post && type) {
      // console.log(post);
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

Template.scheduleCalendar.rendered = function() {
  // console.log('currentSchId=' + Session.get('currentSchId'));

  /* initialize the external events
  -----------------------------------------------------------------*/
  $('#external-events div.external-event').each(function() {
    // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
    // it doesn't need to have a start or end
    var eventObject = {
      title: $.trim($(this).text()) // use the element's text as the event title
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
    // events: function(start, end, timezone, callback) {
    events: function(start, end, callback) {
      var sd = moment(new Date(2014, 0, 5));

      var events = [];
      currEvents = Periods.find({schId: Session.get('currentScheduleId')});
      currEvents.forEach(function(e) {
        var start = new Date('2010-01-0' + (3 + e.day).toString() + 'T' + e.start + ':00.000Z');
        var end = new Date('2010-01-0' + (3 + e.day).toString() + 'T' + e.end + ':00.000Z');
        // if (end < start) 
        //   var h = (moment(end).add('d', 1) - moment(start)) / 1000 / 60 / 60;
        // else
        //   var h = (end - start) / 1000 / 60 / 60;
        events.push({
          id: e._id,
          // start: e.start._d,
          // end: e.end._d,
          start: start,
          end: end,
          // start: e.start,
          // end: e.end,
          // title: h + ' hour(s)',
          title: e.hours + ' hour(s)',
          allDay: false,
          // backgroundColor: e.backgroundColor,
          // className: 'sick-day'
        });
      });
      callback(events);
    },
    height: 777,
    columnFormat: {
      month: '',
      week: 'ddd',
      day: ''
    },
    weekNumbers: false,
  	header: {
		  left: '',
			center: '',
			right: ''
		},
    allDaySlot: false,
    selectable: hasAccess(),
    selectHelper: hasAccess(),
	  editable: hasAccess(),
    droppable: hasAccess(),
    eventStartEditable: hasAccess(),
    eventDurationEditable: hasAccess(),
	  // contentHeight: 600,
    select: function(start, end, allDay, jsEvent, view) {
      calendar.fullCalendar('unselect');
      Session.set('selectedCalDateStart', start);
      Session.set('selectedCalDateEnd', end);
      Session.set('showDialogCalPeriod', true);
    },
    dayClick: function(date, allDay, jsEvent, view) {
      if (hasAccess()) {
        // dayClick: function(date, jsEvent, view) {
        // Session.set('calStartDate', new Date(date));
        Session.set('selectedCalDateStart', date);
        Session.set('selectedCalDateEnd', date);
        Session.set('showDialogCalPeriod', true);
      }
  	},
  	eventClick: function(evt, jsEvent, view) {
      if (hasAccess()) {
        Session.set('selectedCalPeriod', evt.id);
        Session.set('showDialogCalPeriod', true);
      }
  	},
    // eventDrop: function(evt, revertFunc, jsEvent, ui, view) {
    eventDrop: function(evt, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view) {
      var currUser = Meteor.user();
      var sD = moment(new Date(evt.start));
      var eD = moment(new Date(evt.end));
      if (eD < sD)
        var hours = (eD.add('d', 1) - sD) / 1000 / 60 / 60;
      else
        var hours = (eD - sD) / 1000 / 60 / 60;
      var p = {
        periodId: evt.id,
        day: sD.day(),
        start: sD.toISOString().substring(11, 16),
        end: eD.toISOString().substring(11, 16),
        hours: hours,
        status: 'moved',
      };

      Meteor.call('periodMove', p, function(error, eventId) {
        error && throwError(error.reason);
      });

      var s = Settings.findOne({name: 'lastCalPeriodMod'});
      Settings.update(s._id, {$set: {value: new Date()}});
    },
    eventResize: function(evt, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view) {
      // alert("The end date of " + evt.title + "has been moved " +
      //       dayDelta + " days and " +
      //       minuteDelta + " minutes.");
      var currUser = Meteor.user();
      var sD = moment(new Date(evt.start));
      var eD = moment(new Date(evt.end));
      if (eD < sD)
        var hours = (eD.add('d', 1) - sD) / 1000 / 60 / 60;
      else
        var hours = (eD - sD) / 1000 / 60 / 60;
      var p = {
        periodId: evt.id,
        day: sD.day(),
        start: sD.toISOString().substring(11, 16),
        end: eD.toISOString().substring(11, 16),
        hours: hours,
        status: 'resized'
      };

      Meteor.call('periodMove', p, function(error, eventId) {
        error && throwError(error.reason);
      });

      var s = Settings.findOne({name: 'lastCalPeriodMod'});
      Settings.update(s._id, {$set: {value: new Date()}});
    },
    drop: function(date, allDay, jsEvent, ui) {
      // Session.set('selectedCalDateStart', date);
      // Session.set('selectedCalDateEnd', date);

      // retrieve the dropped element's stored Event Object
      var originalEventObject = $(this).data('eventObject');
      
      // we need to copy it, so that multiple events don't have a reference to the same object
      var copiedEventObject = $.extend({}, originalEventObject);
      
      // assign it the date that was reported
      copiedEventObject.start = date;

     
      var currUser = Meteor.user();
      var sD = moment(new Date(date));
      var eD = moment(new Date(date)).add('hour', 4);
      var hours = 4;
      // if (eD < sD)
      //   var hours = (eD.add('d', 1) - sD) / 1000 / 60 / 60;
      // else
      //   var hours = (eD - sD) / 1000 / 60 / 60;
      var p = {
        schId: Session.get('currentScheduleId'),
        // userId: currUser._id,
        // author: currUser.username,
        day: sD.day(),
        start: sD.toISOString().substring(11, 16),
        end: eD.toISOString().substring(11, 16),
        hours: hours,
        status: 'new'
      };

      Meteor.call('periodNew', p, function(error, eventId) {
        error && throwError(error.reason);
      });

      var s = Settings.findOne({name: 'lastCalPeriodMod'});
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
  $('#calendar').fullCalendar('changeView', 'agendaWeek');
  $('#calendar').fullCalendar('gotoDate', 2010, 0, 3);
};

function hasAccess() {
  var currUser = Meteor.user();
  if (!currUser)
    return false;
  var sch = Schedules.findOne(Session.get('currentScheduleId'));
  if (sch && sch.locked)
    return false;
  var currEmp = Employees.findOne({userId: currUser._id});
  if (sch && currEmp && sch.empId == currEmp._id)
    return true;
  if (currEmp && ((currEmp._id == currUser._id) || (this.createdBy == currUser._id)))
    return true;
  if(currUser.username == 'Admin')
    return true;
  var adminRole = Roles.findOne({name: 'Admin'});
  if (adminRole) {
    if (currEmp && (currEmp.roleId == adminRole._id || currEmp._id == this.empId)) {
      return true;
    }
  }
  return false;
}