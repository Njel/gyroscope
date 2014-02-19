Template.eventDialog.selectedCalEvent = function() {
  return Session.get('selectedCalEvent');
};

Template.eventDialog.eventTypes = function() {
  return EventTypes.find({active: true});
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
    var calEvent = {
      postId: Session.get('currentPostId'),
      start: start,
      // start: moment(new Date(start)).format('MM/DD/YYYY HH:mm'),
      end: end,
      // end: moment(new Date(end)).format('MM/DD/YYYY HH:mm'),
      type: Session.get('selectedEventType'),
      title: EventTypes.findOne(Session.get('selectedEventType')).code,
      status: 'new',
      allDay: false
    }
  }
  return calEvent;
};

Template.eventDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedCalDateStart', null);
    Session.set('selectedCalDateEnd', null);
    Session.set('selectedCalEvent', null);
    Session.set('showDialogCalEvent', false);
  },
  'click .close': function(evt, tmpl) {
    Session.set('selectedCalDateStart', null);
    Session.set('selectedCalDateEnd', null);
    Session.set('selectedCalEvent', null);
    Session.set('showDialogCalEvent', false);
  },
  'click .add': function(evt, tmpl) {
    var currUser = Meteor.user();
    var sD = new Date(tmpl.find('[name=from]').value);
    var eD = new Date(tmpl.find('[name=to]').value);
    var hours = (eD - sD) / 1000 / 60 / 60;
    var ev = {
      postId: Session.get('currentPostId'),
      // userId: currUser._id,
      // author: currUser.username,
      start: sD.toISOString(),
      end: eD.toISOString(),
      // start: moment(new Date(tmpl.find('[name=from]').value)),
      // end: moment(new Date(tmpl.find('[name=to]').value)),
      hours: hours,
      type: tmpl.find('[name=type]').value,
      title: tmpl.find('[name=title]').value,
      status: 'new',
      allDay: false
    };

    // Events.insert({
    //   postId: Session.get('currentPostId'), 
    //   start: '2014-02-05T13:00:00.000Z', 
    //   end: '2014-02-05T18:00:00.000Z', 
    //   type: 'T', 
    //   title: 'test', 
    //   allDay: false});

    Meteor.call('eventNew', ev, function(error, eventId) {
      error && throwError(error.reason);
    });

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
    var hours = (eD - sD) / 1000 / 60 / 60;
    var ev = {
      eventId: Session.get('selectedCalEvent'),
      // start: tmpl.find('[name=from]').value,
      // end: tmpl.find('[name=to]').value,
      start: sD.toISOString(),
      end: eD.toISOString(),
      hours: hours,
      type: tmpl.find('[name=type]').value,
      title: tmpl.find('[name=title]').value,
      status: 'new',
      allDay: false
    };

    Meteor.call('eventUpd', ev, function(error, eventId) {
      error && throwError(error.reason);
    });

    Session.set('selectedCalEvent', null);
    Session.set('showDialogCalEvent', false);

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
  }
});