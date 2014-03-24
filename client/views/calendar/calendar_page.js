Template.calendarPage.helpers({
  hasAccess: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    // if (this.userId == currUser._id)
    //   return true;
    if(currUser.username == 'Admin')
      return true;
    var adminRole = Roles.findOne({name: 'Admin'});
    if (adminRole) {
      var currEmp = Employees.findOne({userId: currUser._id});
      if (currEmp && currEmp.roleId == adminRole._id) {
        return true;
      }
    }
    return false;
  },
  isAdmin: function() {
    var currUser = Meteor.user();
    if (!currUser) {
      return false;
    } else {
      if(currUser.username == 'Admin')
        return true;
      var adminRole = Roles.findOne({name: 'Admin'});
      if (adminRole) {
        var currEmp = Employees.findOne({userId: currUser._id});
        if (currEmp && currEmp.roleId == adminRole._id) {
          return true;
        }
      }
      return false;
    }
  },
  currentEmployee: function() {
    var currEmpId = Session.get('currentEmpId');
    if (!currEmpId || currEmpId == 'All') {
   	  var e = {_id: 'All'};
   	} else {
      var e = Employees.findOne(currEmpId);
  	}
  	return e;
  },
  employees: function() {
  	return Employees.find({}, {sort: {fname: 1, lname: 1}});
  },
  selectedEventTypes: function() {
    return Session.get('selectedEventTypes');
  },
  currentYear: function() {
    var currYear = Session.get('currentYear');
    if (!currYear) {
      var d = new Date();
      return d.getYear();
    } else {
      return parseInt(currYear);
    }
  },
  years: function() {
    var currEmpId = Session.get('currentEmpId');
    if (!currEmpId || currEmpId == 'All') {
  	  var Y = Posts.find({},{sort: {year: -1}});
  	} else {
  	  var Y = Posts.find({empId: Session.get('currentEmpId')},{sort: {year: -1}});
  	}
  	var R = [];
  	var E = {};
  	Y.forEach(function(y) {
  	  if (!E[y.year]) {
  	  	E[y.year] = true;
  	  	R.push({year: y.year});
  	  }
  	});
  	return R;
  },
  eventTypes: function() {
    return EventTypes.find({active: true, parent: null}, {sort: {order: 1}});
    // return EventTypes.find({active: true}, {sort: {order: 1}});
  },
  months: function() {
    var M = [];
    var y = parseInt(Session.get('currentYear'));
    var e = Session.get('currentEmpId');
    if (e == 'All') {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        M.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          posted: true
        });
      }
    } else {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var t = Totals.findOne({empId: e, year: y, month: m});
        // console.log(e + ', ' + y + ', ' + m + ', ' + ' -> ' + p);
        if (t) {
          M.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            posted: true
          });
        } else {
          M.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            posted: false
          });
        }
      };
    }
  	return M;
  },
  totals: function() {
  	var R = [];
  	var i = 1;
  	var tot = 0.0;
  	var unit = '';
  	if (Session.get('currentEmpId') == 'All') {
  	  var T = Totals.find({year: parseInt(Session.get('currentYear')), type: this._id}, {sort: {month: 1}});
  	} else {
  	  var T = Totals.find({empId: Session.get('currentEmpId'), year: parseInt(Session.get('currentYear')), type: this._id}, {sort: {month: 1}});
  	}
  	var E = {};
  	var V = {};
  	var U = {};
  	T.forEach(function(t) {
	  while (t.month > i) {
	  	E[i] = true;
	  	V[i] = '-';
	  	U[i] = '';
	  	// R.push({
	  	//   value: 0,
	  	//   unit: ''
	  	// });
	  	i++;
	  };
  	  if (!E[t.month]) {
  	  	E[t.month] = true;
  	  	V[t.month] = t.value;
  	  	U[t.month] = t.unit;
		// R.push({
		//   value: t.value,
		//   unit: t.unit
		// });
  	  } else {
  	  	V[t.month] = V[t.month] + t.value;
  	  }
	  tot += t.value;
	  unit = t.unit;
	  i++;
  	});
  	while (i < 13) {
  	  E[i] = true;
  	  V[i] = '-';
  	  U[i] = '';
      // R.push({
  	  //   value: 0,
  	  //   unit: ''
  	  // });
  	  i++;
    };
    for (var i = 1; i < 13; i++) {
    	R.push({
    	  value: V[i],
    	  unit: U[i],
        tot: false
    	});
    };
    R.push({
      value: tot,
      unit: unit,
      tot: true
    });
    return R;
  },
  etTotals: function() {
    var R = [];
    var Total = 0.0;
    var y = parseInt(Session.get('currentYear'));
    var e = Session.get('currentEmpId');
    if (e == 'All') {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var T = Totals.find({year: y, month: m, type: this._id});
        if (T.count() > 0) {
          var tot = 0.0;
          var unit = '';
          T.forEach(function(t) {
            tot = tot + t.value;
            unit = t.unit;
          });
          R.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            tot: tot,
            unit: unit,
            posted: true
          });
          Total = Total + tot;
        } else {
          R.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            tot: '-',
            unit: '',
            posted: false
          });
        }
      }
    } else {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var T = Totals.find({empId: e, year: y, month: m, type: this._id});
        if (T.count() > 0) {
          var tot = 0.0;
          var unit = '';
          T.forEach(function(t) {
            tot = tot + t.value;
            unit = t.unit;
          });
          R.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            tot: tot,
            unit: unit,
            posted: true
          });
          Total = Total + tot;
        } else {
          R.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            tot: '-',
            unit: '',
            posted: false
          });
        }
      };
    }
    R.push({
      m: null,
      mTxt: 'Total',
      tot: Total,
      unit: 'h',
      posted: true
    });

    return R;
  },
  mTotals: function() {
    return calcMTotals();
  },
  XTotals: function() {
    return calcXTotals();
  },XBalances: function() {
    return calcExtraBal();
  },
  ALEventType: function() {
    return EventTypes.findOne({code: 'A'});
  },
  ALBalances: function() {
    return calcALBal();
  },
  SLEventType: function() {
    return EventTypes.findOne({code: 'S'});
  },
  SLBalances: function() {
    return calcSLBal();
  },
  hasSubTypes: function(et) {
    var n = EventTypes.find({parent: et}).count();
    if (n > 0) return true;
    return false;
  },
  isSubType: function(et) {
    return (et.parent ? true : false);
  },
  isExpand: function(et) {
    if (!et.parent) return true;
    var parent = EventTypes.findOne(et.parent);
    var lnk = $('#lnk' + parent.code).get(0);
    if (lnk && lnk.text == '+') return false;
    return true;
  }
});

Template.calendarPage.lastCalEventMod = function() {
  var v = Settings.findOne({name: 'lastCalEventMod'});
  if (v)
    return v.value;
  else
    return null;
};

Template.calendarPage.rendered = function() {
  // Deps.autorun(function() {
  // 	drawCalendar();
  // });

  $('#calendar').fullCalendar("destroy");
  var Y = Session.get('currentYear');
  if (!Y) {
    var d = new Date();
    Y = d.getYear();
  } else {
    Y = parseInt(Y);
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
      // var view = $('#calendar').fullCalendar('getView');
      // console.log(view);
      // Session.set('calStartDate', view.start);
      // Session.set('calMonthView', view.name);
      var events = [];
      // var where = "this.start.substring(0, 4) == '" + Y + "'";
      var E = Session.get('currentEmpId');
      var sET = Session.get('selectedEventTypes');
      if (sET && sET === 'All') {
        if (E && E !== 'All') {
          // var currEvents = Events.find({empId: E});
          // var currEvents = Events.find({empId: E, $where: where});
          var currEvents = Events.find({empId: E, year: Y});
          currEvents.forEach(function(e) {
            var et = EventTypes.findOne(e.type);
            if (et) {
              var start = new Date(e.start);
              var end = new Date(e.end);
              events.push({
                id: e._id,
                start: start,
                end: end,
                type: e.type,
                title: et.code + ' - ' + e.duration + ' ' + e.unit,
                textColor: et.textColor,
                borderColor: et.borderColor,
                backgroundColor: et.backgroundColor,
                allDay: e.allDay
              });
            }
          });
        } else {
          // var currEvents = Events.find();
          // var currEvents = Events.find({$where: where});
          var dayEvents = new Meteor.Collection(null);
          var currEvents = Events.find({year: Y}, {sort: {start: 1, empId: 1}});
          currEvents.forEach(function(e) {
            var et = EventTypes.findOne(e.type);
            if (et) {
              var day = e.start.substring(0, 10);
              var d = dayEvents.findOne({day: day});
              if (d) {
                // var title = d.title;
                // title.push(et.code + ' - ' + e.duration + ' ' + e.unit);
                var title = d.title + ',' + e._id;
                dayEvents.update(d._id, {$inc: {nbEvents: 1}, $set: {title: title}});
              } else {
                var start = new Date(e.start);
                var end = new Date(e.end);
                dayEvents.insert({
                  day: day,
                  start: start,
                  end: end,
                  type: e.type,
                  // title: [et.code + ' - ' + e.duration + ' ' + e.unit],
                  title: e._id,
                  textColor: et.textColor,
                  borderColor: et.borderColor,
                  backgroundColor: et.backgroundColor,
                  allDay: e.allDay,
                  nbEvents: 1
                });
              }
            }
          });
          var evts = dayEvents.find();
          // console.log('# days: ' + evts.count());
          evts.forEach(function(e) {
            events.push({
              id: e._id,
              start: e.start,
              end: e.end,
              type: e.type,
              // title: e.title + ' (' + e.nbEvents + ')',
              title: e.title,
              textColor: e.textColor,
              borderColor: e.borderColor,
              backgroundColor: e.backgroundColor,
              allDay: true,
              className: 'year-group-event'
            });
          });
        }
      } else {
        var dayEvents = new Meteor.Collection(null);
        var ET = EventTypes.find({active: true, parent: null});
        if (ET) {
          ET.forEach(function(et) {
            var chk = $('#eventType' + et.code).get(0);
            if (chk && chk.checked) {
              if (E && E !== 'All') {
                // var currEvents = Events.find({empId: E});
                // var currEvents = Events.find({empId: E, $where: where});
                var currEvents = Events.find({empId: E, year: Y, type: et._id});
                currEvents.forEach(function(e) {
                  var start = new Date(e.start);
                  var end = new Date(e.end);
                  events.push({
                    id: e._id,
                    start: start,
                    end: end,
                    type: e.type,
                    title: et.code + ' - ' + e.duration + ' ' + e.unit,
                    textColor: et.textColor,
                    borderColor: et.borderColor,
                    backgroundColor: et.backgroundColor,
                    allDay: e.allDay
                  });
                });
              } else {
                // var currEvents = Events.find();
                // var currEvents = Events.find({$where: where});



                var currEvents = Events.find({year: Y, type: et._id}, {sort: {start: 1, empId: 1}});
                currEvents.forEach(function(e) {
                  var et = EventTypes.findOne(e.type);
                  if (et) {
                    var day = e.start.substring(0, 10);
                    var d = dayEvents.findOne({day: day});
                    if (d) {
                      // var title = d.title;
                      // title.push(et.code + ' - ' + e.duration + ' ' + e.unit);
                      var title = d.title + ',' + e._id;
                      dayEvents.update(d._id, {$inc: {nbEvents: 1}, $set: {title: title}});
                    } else {
                      var start = new Date(e.start);
                      var end = new Date(e.end);
                      dayEvents.insert({
                        day: day,
                        start: start,
                        end: end,
                        type: e.type,
                        // title: [et.code + ' - ' + e.duration + ' ' + e.unit],
                        title: e._id,
                        textColor: et.textColor,
                        borderColor: et.borderColor,
                        backgroundColor: et.backgroundColor,
                        allDay: e.allDay,
                        nbEvents: 1
                      });
                    }
                  }
                });



                // var currEvents = Events.find({year: Y, type: et._id});
                // currEvents.forEach(function(e) {
                //   var start = new Date(e.start);
                //   var end = new Date(e.end);
                //   events.push({
                //     id: e._id,
                //     start: start,
                //     end: end,
                //     type: e.type,
                //     title: et.code + ' - ' + e.duration + ' ' + e.unit,
                //     textColor: et.textColor,
                //     borderColor: et.borderColor,
                //     backgroundColor: et.backgroundColor,
                //     allDay: e.allDay
                //   });
                // });
              }
            }
          });
        }
        var evts = dayEvents.find();
        // console.log('# days: ' + evts.count());
        evts.forEach(function(e) {
          var c = (255 - (e.nbEvents * 10));
          events.push({
            id: e._id,
            start: e.start,
            end: e.end,
            type: e.type,
            // title: e.title + ' (' + e.nbEvents + ')',
            title: e.title,
            textColor: e.textColor,
            borderColor: e.borderColor,
            backgroundColor: 'rgb(' + c + ', ' + c + ', ' + c + ')',
            allDay: true,
            className: 'year-group-event'
          });
        });
      }

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
          className: 'year-holiday',
          editable: false,
          selectable: false,
          eventStartEditable: false,
          eventDurationEditable: false
        })
      });
      callback(events);
    },
    year: Y,
    height: 500,
    weekNumbers: false,
    header: {
      left: 'prev, next',
      center: 'title',
      right: 'year, month, agendaWeek'
    },
    selectable: false,
    selectHelper: false,
    editable: false,
    droppable: false,
    eventStartEditable: false,
    eventDurationEditable: false,
    // timezone: 'America/New_York',
    // contentHeight: 600,
    viewRender: function(view, element) {
      // console.log(view);
      // Session.set('calStartDate', view.start);
      // Session.set('calMonthView', view.name);
    },
    eventAfterAllRender: function(view) {
      // console.log(view);
      // Session.set('calMonthView', view.name);
    },
    defaultView: 'year',
    yearColumns: 6,
    yearCellMinH: 16,
    eventMouseover: function(evt, jsEvent, view) {
      if (view.name === 'year') {
        var el = $('#eventDetails');
        if (evt.className == 'year-group-event') {
          var pEmpId = '';
          var emp = null;
          var pET = '';
          var et = null;
          var border = '1px solid black'
          var events = evt.title.split(',');
          var r = '<tr style="border: 1px solid black; background-color: #D5D5D5;">';
          r = r + '  <th style="border: 1px solid #A5A5A5; padding: 0px 4px 0px 4px; text-align: left; width: 140px; font-weight: bold;">Employee Name</th>';
          r = r + '  <th style="border: 1px solid #A5A5A5; padding: 0px 4px 0px 4px; font-weight: bold;">Code</th>';
          r = r + '  <th style="border: 1px solid #A5A5A5; padding: 0px 4px 0px 4px; font-weight: bold;">Duration</th>';
          r = r + '</tr>';
          events.forEach(function(e) {
            var evt = Events.findOne(e);
            if (evt) {
              if (evt.type !== pET) {
                et = EventTypes.findOne(evt.type);
                pET = evt.type;
              }
              if (evt.empId !== pEmpId) {
                emp = Employees.findOne(evt.empId);
              }
              if (emp && et) {
                r = r + '<tr>';
                if (evt.empId !== pEmpId) {
                  pEmpId = evt.empId;
                  border = '1px solid black';
                  r = r + '  <td style="border-top: ' + border + '; border-right: 1px solid white; padding: 0px 4px 0px 4px;">' + emp.fname + ' ' + emp.lname + '</td>';
                } else {
                  border = '1px solid #D5D5D5';
                  r = r + '  <td style="border-top: ' + border + '; border-right: 1px solid white; padding: 0px 4px 0px 4px;"></td>';
                }
                r = r + '  <td style="border-top: ' + border + '; border-right: 1px solid white; padding: 0px 4px 0px 4px; text-align: center; color: ' + et.textColor + '; background-color: ' + et.backgroundColor + ';">' + et.code + '</td>';
                r = r + '  <td style="border-top: ' + border + '; border-right: 1px solid #D5D5D5; padding: 0px 4px 0px 4px; text-align: right;">' + evt.duration + ' ' + evt.unit + '</td>'
                r = r + '</tr>';
              }
            }
          });
          el.html('<table style="border: 1px solid #A5A5A5;">' + r + '</table>');
        } else {
          el.html(evt.title);
        }
        el.css({'left': (jsEvent.clientX + 16) + 'px', 'top': (jsEvent.clientY + 16) + 'px', 'z-index': 1000});
        el.show();
      }
    },
    eventMouseout: function(evt, jsEvent, view) {
      if (view.name === 'year') {
        $("#eventDetails").hide();
      }
    },
    eventClick: function(evt, jsEvent, view) {
      alert(evt.title);
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
    }
  });
  // $('#calendar').fullCalendar('changeView', 'year');
  // $('#calendar').fullCalendar('gotoDate', Session.get('calStartDate'));
};

Template.calendarPage.events({
  'click .eventTypeChk': function(evt, tmpl) {
    var AllET = true;
    var sET = [];
    var ET = EventTypes.find({active: true, parent: null});
    if (ET) {
      ET.forEach(function(et) {
        var chk = $('#eventType' + et.code).get(0);
        if (chk) {
          if (chk.checked) {
            sET.push({type: et._it});
          } else {
            AllET = false;
          }
        }
      });
    }
    if (AllET)
      Session.set('selectedEventTypes', 'All');
    else
      if (sET && sET.length > 0)
        Session.set('selectedEventTypes', sET);
      else
        Session.set('selectedEventTypes', 'None');
  },
  'change .empIdCb': function(evt, tmpl) {
    // console.log(tmpl.find('[name=yearCb]').value);
    Session.set('currentEmpId', tmpl.find('[name=empIdCb]').value);
  },
  'change .yearCb': function(evt, tmpl) {
    // console.log(tmpl.find('[name=yearCb]').value);
    Session.set('currentYear', tmpl.find('[name=yearCb]').value);
  }
});

function calcMTotals() {
  var R = [];
  var i = 1;
  var unit = '';
  var y = parseInt(Session.get('currentYear'));
  var e = Session.get('currentEmpId');
  if (e == 'All') {
    for (var m = 1; m <= 12; m++) {
      var d = new Date(y, m - 1, 1);
      var T = Totals.find({year: y, month: m});
      var tot = 0.0;
      var posted = false;
      T.forEach(function(t) {
        if (t.code.substring(0, 1) != 'X') 
          tot = tot + t.value;
        posted = true;
      });
      R.push({
        m: moment(d).format("MM"),
        mTxt: moment(d).format("MMM"),
        tot: tot,
        unit: 'h',
        posted: posted
      });
    }
  } else {
    for (var m = 1; m <= 12; m++) {
      var d = new Date(y, m - 1, 1);
      var T = Totals.find({empId: e, year: y, month: m});
      var tot = 0.0;
      var posted = false;
      T.forEach(function(t) {
        if (t.code.substring(0, 1) != 'X') 
          tot = tot + t.value;
        posted = true;
      });
      R.push({
        m: moment(d).format("MM"),
        mTxt: moment(d).format("MMM"),
        tot: tot,
        unit: 'h',
        posted: posted
      });
    };
  }
  return R;
}

function calcXTotals() {
  var R = [];
  var i = 1;
  var unit = '';
  var y = parseInt(Session.get('currentYear'));
  var e = Session.get('currentEmpId');
  var X = EventTypes.findOne({code: 'X'});
  if (X) {
    var XId = X._id;
    if (e == 'All') {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var T = Totals.find({year: y, month: m, type: XId});
        var tot = 0.0;
        var posted = false;
        T.forEach(function(t) {
          tot = tot + t.cValue;
          posted = true;
        });
        R.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: tot,
          unit: 'h',
          posted: posted
        });
      }
    } else {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var T = Totals.find({empId: e, year: y, month: m, type: XId});
        var tot = 0.0;
        var posted = false;
        T.forEach(function(t) {
          tot = tot + t.cValue;
          posted = true;
        });
        R.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: tot,
          unit: 'h',
          posted: posted
        });
      };
    }
  }
  return R;
}

function calcExtraBal() {
  var B = [];
  var i = 1;
  var unit = '';
  var y = parseInt(Session.get('currentYear'));
  var e = Session.get('currentEmpId');
  var X = EventTypes.findOne({code: 'X'});
  var R = EventTypes.findOne({code: 'R'});
  if (X && R) {
    var XId = X._id;
    var RId = R._id;
    if (e == 'All') {
      var prevBal = 0.0;
      var b = Balances.find({year: y});
      b.forEach(function(r) {
        prevBal = prevBal + r.X;
      });
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var XT = Totals.find({year: y, month: m, type: XId});
        var RT = Totals.find({year: y, month: m, type: RId});
        var XTot = 0.0;
        var RTot = 0.0;
        var posted = false;
        XT.forEach(function(t) {
          XTot = XTot + t.cValue;
          posted = true;
        });
        RT.forEach(function(t) {
          RTot = RTot + t.cValue;
          posted = true;
        });
        var bal = prevBal + XTot - RTot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      }
    } else {
      var prevBal = 0.0;
      var b = Balances.findOne({year: y, empId: e});
      if (b)
        prevBal = b.X;
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var XT = Totals.find({empId: e, year: y, month: m, type: XId});
        var RT = Totals.find({empId: e, year: y, month: m, type: RId});
        var XTot = 0.0;
        var RTot = 0.0;
        var posted = false;
        XT.forEach(function(t) {
          XTot = XTot + t.cValue;
          posted = true;
        });
        RT.forEach(function(t) {
          RTot = RTot + t.cValue;
          posted = true;
        });
        var bal = prevBal + XTot - RTot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      };
    }
  }
  return B;
}

function calcALBal() {
  var B = [];
  var i = 1;
  var unit = '';
  var y = parseInt(Session.get('currentYear'));
  var e = Session.get('currentEmpId');
  var A = EventTypes.findOne({code: 'A'});
  if (A) {
    var AId = A._id;
    if (e == 'All') {
      var prevBal = 0.0;
      var b = Balances.find({year: y});
      b.forEach(function(r) {
        prevBal = prevBal + r.AL;
      });
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var AT = Totals.find({year: y, month: m, type: AId});
        var ATot = 0.0;
        var posted = false;
        AT.forEach(function(t) {
          ATot = ATot + t.cValue;
          posted = true;
        });
        var bal = prevBal - ATot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      }
    } else {
      var prevBal = 0.0;
      var b = Balances.findOne({year: y, empId: e});
      if (b)
        prevBal = b.AL;
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var AT = Totals.find({empId: e, year: y, month: m, type: AId});
        var ATot = 0.0;
        var posted = false;
        AT.forEach(function(t) {
          ATot = ATot + t.cValue;
          posted = true;
        });
        var bal = prevBal - ATot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      };
    }
  }
  return B;
}

function calcSLBal() {
  var B = [];
  var i = 1;
  var unit = '';
  var y = parseInt(Session.get('currentYear'));
  var e = Session.get('currentEmpId');
  var S = EventTypes.findOne({code: 'S'});
  if (S) {
    var SId = S._id;
    if (e == 'All') {
      var prevBal = 0.0;
      var b = Balances.find({year: y});
      b.forEach(function(r) {
        prevBal = prevBal + r.AL;
      });
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var ST = Totals.find({year: y, month: m, type: SId});
        var STot = 0.0;
        var posted = false;
        ST.forEach(function(t) {
          STot = STot + t.cValue;
          posted = true;
        });
        var bal = prevBal - STot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      }
    } else {
      var prevBal = 0.0;
      var b = Balances.findOne({year: y, empId: e});
      if (b)
        prevBal = b.SL;
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var ST = Totals.find({empId: e, year: y, month: m, type: SId});
        var STot = 0.0;
        var posted = false;
        ST.forEach(function(t) {
          STot = STot + t.cValue;
          posted = true;
        });
        var bal = prevBal - STot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      };
    }
  }
  return B;
}