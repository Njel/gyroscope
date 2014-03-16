Balances = new Meteor.Collection('balances');

Balances.allow({
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
  balanceNew: function(attributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to create balances");

    if (!attributes.empId)
      throw new Meteor.Error(422, 'Please select an employee for the balance');

    var d = moment(new Date()).toISOString();

    e = _.extend(_.pick(attributes, 'empId', 'year', 'AL', 'SL', 'X'), {
      createdBy: user._id,
      created: d,
      modifiedBy: user._id,
      modified: d
    });

    // create the balance, save the id
    e._id = Balances.insert(e);

    // now create a notification, informing the user that there's been a new balance
    // createEventNotification(grp);

    return e._id;
  },
  balanceUpd: function(attributes) {

    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update balances");

    if (attributes.id == '') {
      var e = Balances.findOne({empId: attributes.empId, year: attributes.year});
    } else {
      var e = Balances.findOne(attributes.id);
    }

    if (e) {
      Balances.update(
        e._id, {
          $set: {
            AL: attributes.AL,
            SL: attributes.SL,
            X: attributes.X,
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
      throw new Meteor.Error(404, "Balance not found!");
    }

    return true;
  },
  balanceRemove: function(attributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete balances");

    if (!Posts.find({empId: attributes.empId}).count() == 0)
      throw new Meteor.Error(422, 'This employee has posts and need a balance record');

    var bId = null;
    if (attributes.id == '') {
      var b = Balances.findOne({empId: attributes.empId, year: attributes.year});
      if (b) bId = b._id;
    } else {
      bId = attributes.id;
    }

    Balances.remove(bId, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {

      }
    });

    return true;
  }
});