Groups = new Meteor.Collection('groups');

Groups.allow({
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
  groupNew: function(grpAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to create groups");

    if (!grpAttributes.name)
      throw new Meteor.Error(422, 'Please enter a name for the group');

    grp = _.extend(_.pick(grpAttributes, 'name'), {
      nbEmp: 0,
      createdBy: user._id,
      created: moment(new Date()).toISOString(),
      modifiedBy: user._id,
      modified: moment(new Date()).toISOString()
    });

    // create the group, save the id
    grp._id = Groups.insert(grp);

    // now create a notification, informing the user that there's been a new group
    createGroupNotification(grp);

    return grp._id;
  },
  groupUpd: function(grpAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update groups");

    if (!grpAttributes.name)
      throw new Meteor.Error(422, 'Please enter a name for the group');

    var g = Groups.findOne(grpAttributes.id);

    if (g) {
      Groups.update(
        g._id, {
          $set: {
            name: grpAttributes.name,
		    modifiedBy: user._id,
		    modified: moment(new Date()).toISOString()  }
        }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {
            var employees = Employees.find({groupId: g._id});
            employees.forEach(function(e) {
              Employees.update(e._id, {$set: {group: grpAttributes.name}});
            });
          }
        }
      );
    }
    return true;
  },
  groupRemove: function(grpAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete groups");

    if (!Employees.find({group: grpAttributes.id}).count() == 0)
      throw new Meteor.Error(422, 'This group contains employees');

    Groups.remove(grpAttributes.id, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {

      }
    });

    return true;
  }
});