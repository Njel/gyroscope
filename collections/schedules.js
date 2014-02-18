Schedules = new Meteor.Collection('schedules');

Schedules.allow({
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

Meteor.methods({
  scheduleNew: function(schAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to create schedules");

    if (!schAttributes.empId)
      throw new Meteor.Error(422, 'Please select an employee for the schedule');

    if (!schAttributes.validS)
      throw new Meteor.Error(422, 'Please enter a starting date for the schedule');

    if (!schAttributes.validE)
      throw new Meteor.Error(422, 'Please enter a ending date for the schedule');

    var d = new Date().toISOString();

    sch = _.extend(_.pick(schAttributes, 'empId', 'validS', 'validE', 'status'), {
      periodsCount: 0,
      hoursCount: 0,
      createdBy: user._id,
      created: d,
      modifiedBy: user._id,
      modified: d
    });

    // create the employee, save the id
    sch._id = Schedules.insert(sch);

    // now create a notification, informing the user that there's been a new employee
    // createEventNotification(grp);

    var s = Settings.findOne({name: 'lastSchMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return sch._id;
  },
  scheduleUpd: function(schAttributes) {

    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update schedules");

    if (!schAttributes.empId)
      throw new Meteor.Error(422, 'Please select an employee for the schedule');

    if (!schAttributes.validS)
      throw new Meteor.Error(422, 'Please enter a starting date for the schedule');

    if (!schAttributes.validE)
      throw new Meteor.Error(422, 'Please enter a ending date for the schedule');

    var sch = Schedules.findOne(schAttributes.id);

    if (sch) {
      Schedules.update(
        sch._id, {
          $set: {
            validS: schAttributes.validS,
            validE: schAttributes.validE,
            status: schAttributes.status,
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
    } else {
      throw new Meteor.Error(404, "Schedule not found!");
    }

    var s = Settings.findOne({name: 'lastSchMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },
  scheduleRemove: function(schAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete schedules");

    if (!Periods.find({schId: schAttributes.id}).count() == 0)
      throw new Meteor.Error(422, 'This schedule has periods defined');

    Schedules.remove(schAttributes.id, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {

      }
    });

    var s = Settings.findOne({name: 'lastSchMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  }
});