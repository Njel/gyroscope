Template.event.helpers({
	period: function(e) {
	  if(e.allDay) {
	  	return 'All day';
	  } else {
	  	return moment(new Date(e.start)).format('HH:mm') + ' - ' + moment(new Date(e.end)).format('HH:mm');
	  }
	},
  eventType: function(t) {
    return EventTypes.findOne(t);
  },
  locked: function() {
    if (isAdmin())
      return false;
    var p = Posts.findOne(this.postId);
    if (p)
      return p.locked;
    return null;
  }
});

Template.event.events({
  'click .delete': function(event) {
    event.preventDefault();
    var ev = {
      eventId: this._id,
      type: this.type,
      X: null
    };

    var eT = EventTypes.findOne(ev.type);
    if (eT && eT.code == 'X') {
      var e = Events.findOne(ev.eventId);
      var X = calcExtraHours(e);
      ev.X = X;
      // console.log(X);
    }

    //Meteor.call('eventDel', this._id);
    Meteor.call('eventDel', ev, function(error, eventId) {
      error && throwError(error.reason);
    });

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
  	Session.set('lastCalEventMod', new Date());
  },
  'click .editEventBtn': function(event) {
    var e = Events.findOne(this._id);
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

      Session.set('showDialogCalEvent', true);
    } else {
      return false;
    }
  }
});