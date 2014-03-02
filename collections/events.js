Events = new Meteor.Collection('events');

Events.allow({
  insert: function(userId, doc) {
   // only allow posting if you are logged in
   return !! userId;
  },
  update: ownsDocument,
  remove: ownsDocument
});

// Events.deny({
//   update: function(userId, post, fieldNames) {
//     // may only edit the following three fields:
//     return (_.without(fieldNames, 'year', 'month').length > 0);
//   }
// });

Meteor.methods({
  eventNew: function(eventAttributes) {
    var user = Meteor.user();
    //var post = Posts.findOne(eventAttributes.postId);

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to create events");

    if (!eventAttributes.type)
      throw new Meteor.Error(422, 'Please select a type of event');

    // if (!eventAttributes.title)
    //   throw new Meteor.Error(422, 'Please write some content');

    if (!eventAttributes.postId)
      throw new Meteor.Error(422, 'You must select a month to create a event');

    var d = new Date().toISOString();

    ev = _.extend(_.pick(eventAttributes, 'postId', 'start', 'end', 'duration', 'unit', 'period', 'type', 'title', 'status', 'allDay'), {
      // start: moment(new Date(eventAttributes.start)),
      // end: moment(new Date(eventAttributes.end)),
      // start: new Date(eventAttributes.start).toISOString(),
      // end: new Date(eventAttributes.end).toISOString(),
      approved: null,
      approver: null,
      reviewed: null,
      reviewer: null,
      submitted: new Date().getTime(),
      createdBy: user._id,
      created: d,
      modifiedBy: user._id,
      modified: d
    });

    // update the post with the number of events
    Posts.update(ev.postId, {$inc: {eventsCount: 1}, $set: {status: 'In progress'}});

    // create the event, save the id
    // console.log(ev.start);
    ev._id = Events.insert(ev);

    // now create a notification, informing the user that there's been a event
    // createEventNotification(ev);

    var post = Posts.findOne(eventAttributes.postId);
    var tot = Totals.findOne({empId: post.empId, year: post.year, month: post.month, type: eventAttributes.type});
    if (tot)
      Totals.update(tot._id, {$inc: {value: parseFloat(eventAttributes.duration)}, $set: {modifiedBy: user._id, modified: d}});
    else
      Totals.insert({
        empId: post.empId,
        year: post.year,
        month: post.month,
        type: eventAttributes.type,
        unit: eventAttributes.unit,
        value: eventAttributes.duration,
        createdBy: user._id,
        created: d,
        modifiedBy: user._id,
        modified: d
      });


    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return ev._id;
  },
  eventRpl: function(eventAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update events");

    if (!eventAttributes.type)
      throw new Meteor.Error(422, 'Please select a type of event');

    // if (!eventAttributes.title)
    //   throw new Meteor.Error(422, 'Please write some content');

    var d = new Date().toISOString();

    var ev = Events.findOne(eventAttributes.eventId);
    var type = EventTypes.findOne(eventAttributes.type);

    if (ev && type) {
      Events.update(
        ev._id, {
          $set: {
            type: type._id,
            title: type.code,
            textColor: type.textColor,
            borderColor: type.borderColor,
            backgroundColor: type.backgroundColor,
            typeUnit: type.unit,
            modifiedBy: user._id,
            modified: d
          }
        }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {

          }
        }
      );
    }
    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },
  eventUpd: function(eventAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update events");

    if (!eventAttributes.type)
      throw new Meteor.Error(422, 'Please select a type of event');

    // if (!eventAttributes.title)
    //   throw new Meteor.Error(422, 'Please write some content');

    var d = new Date().toISOString();

    var ev = Events.findOne(eventAttributes.eventId);

    if (ev) {
      prevDuration = ev.duration;
      Events.update(
        ev._id, {
          $set: {
            period: eventAttributes.period,
            type: eventAttributes.type,
            title: eventAttributes.title,
            // start: moment(eventAttributes.start, 'MM/DD/YYYY HH:mm'),
            // end: moment(eventAttributes.end, 'MM/DD/YYYY HH:mm')
            start: eventAttributes.start,
            end: eventAttributes.end,
            duration: eventAttributes.duration,
            modifiedBy: user._id,
            modified: d
          }
        }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {

          }
        }
      );
      var post = Posts.findOne(ev.postId);
      var tot = Totals.findOne({empId: post.empId, year: post.year, month: post.month, type: eventAttributes.type});
      if (tot)
        Totals.update(tot._id, {$inc: {value: (eventAttributes.duration - prevDuration)}, $set: {modifiedBy: user._id, modified: d}});
    }
    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },
  eventMove: function(eventAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to move events");

    var d = new Date().toISOString();

    var ev = Events.findOne(eventAttributes.eventId);

    if (ev) {
      prevDuration = ev.duration;
      Events.update(
        ev._id, {
          $set: {
            // start: moment(eventAttributes.start, 'MM/DD/YYYY HH:mm'), 
            // end: moment(eventAttributes.end, 'MM/DD/YYYY HH:mm')
            start: eventAttributes.start,
            end: eventAttributes.end,
            duration: eventAttributes.duration,
            modifiedBy: user._id,
            modified: new Date().toISOString()
          }
        }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {

          }
        }
      );
      if (prevDuration != eventAttributes.duration) {
        var post = Posts.findOne(ev.postId);
        var tot = Totals.findOne({empId: post.empId, year: post.year, month: post.month, type: ev.type});
        if (tot)
          Totals.update(tot._id, {$inc: {value: (eventAttributes.duration - prevDuration)}, $set: {modifiedBy: user._id, modified: d}});
      }
    }
    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },
  eventDel: function(eventAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete events");

    var d = new Date().toISOString();

    var ev = Events.findOne(eventAttributes.eventId);

    Events.remove(ev._id, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {

      }
    });

    var post = Posts.findOne(ev.postId);
    var tot = Totals.findOne({empId: post.empId, year: post.year, month: post.month, type: eventAttributes.type});
    if (tot)
      Totals.update(tot._id, {$inc: {value: -ev.duration}, $set: {modifiedBy: user._id, modified: d}});

    // update the post with the number of events
    Posts.update(ev.postId, {$inc: {eventsCount: -1}});

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  }
});