Periods = new Meteor.Collection('periods');

Periods.allow({
  insert: function(userId, doc) {
   // only allow insert if you are logged in
   return !! userId;
  },
  update: function(userId, doc) {
   // only allow update if you are logged in
   return !! userId;
  },
  remove: function(userId, doc) {
   // only allow remove if you are logged in
   return !! userId;
  }
});

// Periods.deny({
//   update: function(userId, post, fieldNames) {
//     // may only edit the following three fields:
//     return (_.without(fieldNames, 'year', 'month').length > 0);
//   }
// });

Meteor.methods({
  periodNew: function(periodAttributes) {
    var user = Meteor.user();
    //var schedule = Schedules.findOne(periodAttributes.postId);

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to create periods");

    if (!periodAttributes.day)
      throw new Meteor.Error(422, 'Please select a day');

    if (!periodAttributes.start)
      throw new Meteor.Error(422, 'Please enter a starting time');

    if (!periodAttributes.end)
      throw new Meteor.Error(422, 'Please enter an ending time');

    if (!periodAttributes.schId)
      throw new Meteor.Error(422, 'You must select a schedule to create a period');

    var d = new Date().toISOString();

    p = _.extend(_.pick(periodAttributes, 'schId', 'day', 'start', 'end', 'hours', 'status'), {
      createdBy: user._id,
      created: d,
      modifiedBy: user._id,
      modified: d
    });

    // update the schedule with the number of periods
    Schedules.update(p.schId, {$inc: {periodsCount: 1, hoursCount: p.hours}});

    // create the period, save the id
    // console.log(p.start);
    p._id = Periods.insert(p);

    // now create a notification, informing the user that there's been a event
    // createPeriodNotification(p);

    var s = Settings.findOne({name: 'lastCalPeriodMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return p._id;
  },
  periodUpd: function(periodAttributes) {

    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update periods");

    if (!periodAttributes.day)
      throw new Meteor.Error(422, 'Please select a day');

    if (!periodAttributes.start)
      throw new Meteor.Error(422, 'Please enter a starting time');

    if (!periodAttributes.end)
      throw new Meteor.Error(422, 'Please enter an ending time');

    var p = Periods.findOne(periodAttributes.periodId);

    if (p) {
      Periods.update(
        p._id, {
          $set: {
            day: periodAttributes.day,
            start: periodAttributes.start,
            end: periodAttributes.end,
            hours: periodAttributes.hours,
            status: periodAttributes.status,
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
    var s = Settings.findOne({name: 'lastCalPeriodMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },
  periodMove: function(periodAttributes) {

    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to move periods");

    if (!periodAttributes.day)
      throw new Meteor.Error(422, 'Please select a day');

    if (!periodAttributes.start)
      throw new Meteor.Error(422, 'Please enter a starting time');

    if (!periodAttributes.end)
      throw new Meteor.Error(422, 'Please enter an ending time');

    var p = Periods.findOne(periodAttributes.periodId);

    if (p) {
      Periods.update(
        p._id, {
          $set: {
            day: periodAttributes.day,
            start: periodAttributes.start,
            end: periodAttributes.end,
            hours: periodAttributes.hours,
            status: periodAttributes.status,
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
    var s = Settings.findOne({name: 'lastCalPeriodMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },
  periodDel: function(periodAttributes) {

    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete periods");

    var p = Periods.findOne(periodAttributes.periodId);

    Periods.remove(p._id, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {

      }
    });

    // update the schedule with the number of periods
    Schedules.update(p.schId, {$inc: {periodsCount: -1, hoursCount: -p.hours}});

    var s = Settings.findOne({name: 'lastCalPeriodMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  }
});