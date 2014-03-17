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
    var currUser = Meteor.user();

    // ensure the user is logged in
    if (!currUser)
      throw new Meteor.Error(401, "You need to login to create employees");

    if (!empAttributes.fname)
      throw new Meteor.Error(422, 'Please enter a first name for the employee');

    if (!empAttributes.lname)
      throw new Meteor.Error(422, 'Please enter a last name for the employee');

    if (!empAttributes.email)
      throw new Meteor.Error(422, 'Please enter a email for the employee');

    var d = moment(new Date()).toISOString();
    var role = Roles.findOne(empAttributes.roleId);
    if (role) {
      var roleName = role.name;
    } else {
      var roleName = '';
    }
    var supervisor = Employees.findOne(empAttributes.supervisorId);
    if (supervisor) {
      var supervisorName = supervisor.fname + ' ' + supervisor.lname;
    } else {
      var supervisorName = '';
    }
    var user = Meteor.users.findOne(empAttributes.userId);
    if (user) {
      var userName = user.username;
    } else {
      var userName = '';
    }
    var group = Groups.findOne(empAttributes.groupId);
    if (group) {
      var groupName = group.name;
    } else {
      var groupName = '';
    }

    e = _.extend(_.pick(empAttributes, 'fname', 'lname', 'email', 'roleId', 'supervisorId', 'userId', 'groupId'), {
      role: roleName,
      supervisor: supervisorName,
      user: userName,
      group: groupName,
      AL: parseFloat(empAttributes.AL),
      SL: parseFloat(empAttributes.SL),
      createdBy: currUser._id,
      created: d,
      modifiedBy: currUser._id,
      modified: d
    });

    // create the employee, save the id
    e._id = Employees.insert(e);

    Groups.update(group._id, {$inc: {nbEmp: 1}});

    // now create a notification, informing the user that there's been a new employee
    // createEventNotification(grp);

    var s = Settings.findOne({name: 'lastEmpMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return e._id;
  },
  employeeUpd: function(empAttributes) {

    var currUser = Meteor.user();

    // ensure the user is logged in
    if (!currUser)
      throw new Meteor.Error(401, "You need to login to update employees");

    if (!empAttributes.fname)
      throw new Meteor.Error(422, 'Please enter a first name for the employee');

    if (!empAttributes.lname)
      throw new Meteor.Error(422, 'Please enter a last name for the employee');

    if (!empAttributes.email)
      throw new Meteor.Error(422, 'Please enter a email for the employee');

    var e = Employees.findOne(empAttributes.id);

    if (e) {
      var role = Roles.findOne(empAttributes.roleId);
      if (role) {
        var roleName = role.name;
      } else {
        var roleName = '';
      }
      var supervisor = Employees.findOne(empAttributes.supervisorId);
      if (supervisor) {
        var supervisorName = supervisor.fname + ' ' + supervisor.lname;
      } else {
        var supervisorName = '';
      }
      var user = Meteor.users.findOne(empAttributes.userId);
      if (user) {
        var userName = user.username;
      } else {
        var userName = '';
      }
      var group = Groups.findOne(empAttributes.groupId);
      if (group) {
        var groupName = group.name;
      } else {
        var groupName = '';
      }

      Employees.update(
        e._id, {
          $set: {
            fname: empAttributes.fname,
            lname: empAttributes.lname,
            email: empAttributes.email,
            roleId: empAttributes.roleId,
            role: roleName,
            supervisorId: empAttributes.supervisorId,
            supervisor: supervisorName,
            userId: empAttributes.userId,
            user: userName,
            groupId: empAttributes.groupId,
            group: groupName,
            AL: parseFloat(empAttributes.AL),
            SL: parseFloat(empAttributes.SL),
            modifiedBy: currUser._id,
            modified: moment(new Date()).toISOString()  }
        }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {
            if (e.fname != empAttributes.fname || e.lname != empAttributes.lname) {
              var empName = empAttributes.fname + ' ' + empAttributes.lname;
              var schedules = Schedules.find({empId: e._id});
              schedules.forEach(function(s) {
                Schedules.update(s._id, {$set: {emp: empName}});
              });
            }
          }
        }
      );

      if (e.groupId != group._id) {
        Groups.update(e.groupId, {$inc: {nbEmp: -1}});
        Groups.update(group._id, {$inc: {nbEmp: 1}});
      }
    } else {
      throw new Meteor.Error(404, "Employee not found!");
    }

    var s = Settings.findOne({name: 'lastEmpMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },
  employeeRemove: function(empAttributes) {
    var currUser = Meteor.user();

    // ensure the user is logged in
    if (!currUser)
      throw new Meteor.Error(401, "You need to login to delete employees");

    if (!Posts.find({userId: empAttributes.id}).count() == 0)
      throw new Meteor.Error(422, 'This employee has posts');

    if (!Schedules.find({empId: empAttributes.id}).count() == 0)
      throw new Meteor.Error(422, 'This employee has schedules');

    var e = Employees.findOne(empAttributes.id);

    if (e) {
      Employees.remove(empAttributes.id, function(error) {
        if (error) {
          // display the error to the user
          alert(error.reason);
        } else {

        }
      });
      Groups.update(e.groupId, {$inc: {nbEmp: -1}});
    } else {
      throw new Meteor.Error(404, "Employee not found!");
    }

    var s = Settings.findOne({name: 'lastEmpMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  }
});