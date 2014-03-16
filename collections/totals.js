Totals = new Meteor.Collection('totals');

Totals.allow({
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
  totalNew: function(attributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to create totals");

    var d = moment(new Date()).toISOString();

    tot = _.extend(_.pick(attributes, 'empId', 'year', 'month', 'type', 'unit', 'value'), {
      createdBy: user._id,
      created: d,
      modifiedBy: user._id,
      modified: d
    });

    tot._id = Totals.insert(tot);

    return tot._id;
  },
  totalUpd: function(attributes) {

    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update totals");

    var tot = Totals.findOne({empId: attributes.empId, year: attributes.year, month: attributes.month, type: attributes.type});

    if (tot) {
      Totals.update(
        tot._id, {
          $set: {
            value: attributes.value,
            modifiedBy: user._id,
            modified: moment(new Date()).toISOString()  }
        }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {

          }
        }
      );
    } else {
      throw new Meteor.Error(404, "Total not found!");
    }

    return true;
  },
  totalInc: function(attributes) {

    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update totals");

    var tot = Totals.findOne({empId: attributes.empId, year: attributes.year, month: attributes.month, type: attributes.type});

    if (tot) {
      Totals.update(
        tot._id, {
          $set: {
            value: tot.value + attributes.value,
            modifiedBy: user._id,
            modified: moment(new Date()).toISOString()  }
        }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {

          }
        }
      );
    } else {
      tot = _.extend(_.pick(attributes, 'empId', 'year', 'month', 'type', 'unit', 'value'), {
        createdBy: user._id,
        created: d,
        modifiedBy: user._id,
        modified: d
      });

      tot._id = Totals.insert(tot);
    }

    return true;
  },
  totalRemove: function(attributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete schedules");

    var tot = Totals.findOne({empId: attributes.empId, year: attributes.year, month: attributes.month, type: attributes.type});

    if (tot) {
	  Totals.remove(tot._id, function(error) {
        if (error) {
          // display the error to the user
          alert(error.reason);
      	} else {
      	}
      });
    }

    return true;
  }
});