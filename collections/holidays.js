Holidays = new Meteor.Collection('holidays');

Holidays.allow({
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
  holidayNew: function(holAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to create holidays");

    if (!holAttributes.date)
      throw new Meteor.Error(422, 'Please enter a date for the holiday');

    hol = _.extend(_.pick(holAttributes, 'date', 'title'), {
      createdBy: user._id,
      created: new Date().toISOString(),
      modifiedBy: user._id,
      modified: new Date().toISOString()
    });

    // create the group, save the id
    hol._id = Holidays.insert(hol);

    // now create a notification, informing the user that there's been a new group
    // createHolidayNotification(hol);

    return hol._id;
  },
  holidayUpd: function(holAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update holidays");

    if (!holAttributes.date)
      throw new Meteor.Error(422, 'Please enter a date for the holiday');

    var h = Holidays.findOne(holAttributes.id);

    if (h) {
      Holidays.update(
        h._id, {
          $set: {
            date: holAttributes.date,
            title: holAttributes.title,
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
    return true;
  },
  holidayRemove: function(holAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete holidays");

    Holidays.remove(holAttributes.id, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {

      }
    });

    return true;
  }
});