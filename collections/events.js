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

    if (!eventAttributes.title)
      throw new Meteor.Error(422, 'Please write some content');

    if (!eventAttributes.postId)
      throw new Meteor.Error(422, 'You must select a month to create a event');

    var d = new Date().toISOString();

    ev = _.extend(_.pick(eventAttributes, 'postId', 'start', 'end', 'hours', 'type', 'title', 'status', 'allDay'), {
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
    Posts.update(ev.postId, {$inc: {eventsCount: 1}});

    // create the event, save the id
    // console.log(ev.start);
    ev._id = Events.insert(ev);

    // now create a notification, informing the user that there's been a event
    // createEventNotification(ev);

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return ev._id;
  },
  eventUpd: function(eventAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update events");

    if (!eventAttributes.title)
      throw new Meteor.Error(422, 'Please write some content');

    var ev = Events.findOne(eventAttributes.eventId);

    if (ev) {
      Events.update(
        ev._id, {
          $set: {
            title: eventAttributes.title,
            // start: moment(eventAttributes.start, 'MM/DD/YYYY HH:mm'),
            // end: moment(eventAttributes.end, 'MM/DD/YYYY HH:mm')
            start: eventAttributes.start,
            end: eventAttributes.end,
            hours: eventAttributes.hours,
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

    var ev = Events.findOne(eventAttributes.eventId);

    if (ev) {
      Events.update(
        ev._id, {
          $set: {
            // start: moment(eventAttributes.start, 'MM/DD/YYYY HH:mm'), 
            // end: moment(eventAttributes.end, 'MM/DD/YYYY HH:mm')
            start: eventAttributes.start,
            end: eventAttributes.end,
            hours: eventAttributes.hours,
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

    var ev = Events.findOne(eventAttributes.eventId);

    Events.remove(ev._id, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {

      }
    });

    // update the post with the number of events
    Posts.update(ev.postId, {$inc: {eventsCount: -1}});

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  }
});