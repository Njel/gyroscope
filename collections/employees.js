Employees = new Meteor.Collection('employees');

Employees.allow({
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
  employeeNew: function(empAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to create employees");

    if (!empAttributes.fname)
      throw new Meteor.Error(422, 'Please enter a first name for the employee');

    if (!empAttributes.lname)
      throw new Meteor.Error(422, 'Please enter a last name for the employee');

    if (!empAttributes.email)
      throw new Meteor.Error(422, 'Please enter a email for the employee');

    var d = new Date().toISOString();

    e = _.extend(_.pick(empAttributes, 'fname', 'lname', 'email', 'roleId', 'userId', 'group'), {
      AL: parseFloat(empAttributes.AL),
      SL: parseFloat(empAttributes.SL),
      createdBy: user._id,
      created: d,
      modifiedBy: user._id,
      modified: d
    });

    // create the employee, save the id
    e._id = Employees.insert(e);

    // now create a notification, informing the user that there's been a new employee
    // createEventNotification(grp);

    var s = Settings.findOne({name: 'lastEmpMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return e._id;
  },
  employeeUpd: function(empAttributes) {

    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update employees");

    if (!empAttributes.fname)
      throw new Meteor.Error(422, 'Please enter a first name for the employee');

    if (!empAttributes.lname)
      throw new Meteor.Error(422, 'Please enter a last name for the employee');

    if (!empAttributes.email)
      throw new Meteor.Error(422, 'Please enter a email for the employee');

    var e = Employees.findOne(empAttributes.id);

    if (e) {
      Employees.update(
        e._id, {
          $set: {
            fname: empAttributes.fname,
            lname: empAttributes.lname,
            email: empAttributes.email,
            roleId: empAttributes.roleId,
            userId: empAttributes.userId,
            group: empAttributes.group,
            AL: parseFloat(empAttributes.AL),
            SL: parseFloat(empAttributes.SL),
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
      throw new Meteor.Error(404, "Employee not found!");
    }

    var s = Settings.findOne({name: 'lastEmpMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },
  employeeRemove: function(empAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete employees");

    if (!Posts.find({userId: empAttributes.id}).count() == 0)
      throw new Meteor.Error(422, 'This employee has posts');

    Employees.remove(empAttributes.id, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {

      }
    });

    var s = Settings.findOne({name: 'lastEmpMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  }
});