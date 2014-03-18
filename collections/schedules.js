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

    var d = moment(new Date()).toISOString();
    var e = Employees.findOne(schAttributes.empId);

    if (e) {
      var empName = e.fname + ' ' + e.lname;
      sch = _.extend(_.pick(schAttributes, 'empId', 'validS', 'validE', 'status'), {
        emp: empName,
        lockedBy: null,
        locked: null,
        submittedBy: null,
        submitted: null,
        approvedBy: null,
        approved: null,
        rejectedBy: null,
        rejected: null,
        reviewedBy: null,
        reviewed: null,
        periodsCount: 0,
        hoursCount: 0,
        createdBy: user._id,
        created: d,
        modifiedBy: user._id,
        modified: d
      });

      // create the employee, save the id
      sch._id = Schedules.insert(sch);
    } else {
      throw new Meteor.Error(404, "Employee not found!");
    }

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
      var e = Employees.findOne(schAttributes.empId);
      if (e) {
        var empName = e.fname + ' ' + e.lname;
        Schedules.update(
          sch._id, {
            $set: {
              empId: schAttributes.empId,
              emp: empName,
              validS: schAttributes.validS,
              validE: schAttributes.validE,
              status: schAttributes.status,
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
        throw new Meteor.Error(404, "Employee not found!");
      }
    } else {
      throw new Meteor.Error(404, "Schedule not found!");
    }

    var s = Settings.findOne({name: 'lastSchMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },

  scheduleResetCounters: function(schAttributes) {

    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update schedules");

    var sch = Schedules.findOne(schAttributes.schId);

    if (sch) {
      Schedules.update(
        sch._id, {
          $set: {
            lockedBy: null,
            locked: null,
            submittedBy: null,
            submitted: null,
            approvedBy: null,
            approved: null,
            rejectedBy: null,
            rejected: null,
            reviewedBy: null,
            reviewed: null,
            periodsCount: 0,
            hoursCount: 0,
            status: 'Not Submitted',
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
  },

  scheduleLock: function(schId) {
    // console.log('scheduleLock(' + schId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to lock schedules");

    Schedules.update(
      schId, {
        $set: {
          lockedBy: user._id,
          locked: moment(new Date()).toISOString()  // status: 'locked'
        }
      }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {

          }
        }
      );
    return true;
  },

  scheduleUnlock: function(schId) {
    // console.log('scheduleUnlock(' + schId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to unlock schedules");

    Schedules.update(
      schId, {
        $set: {
          lockedBy: null,
          locked: null
          // status: 'unlocked'
        }
      }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {

          }
        }
      );
    return true;
  },

  scheduleApprove: function(schId) {
    // console.log('scheduleApprove(' + schId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to approve schedules");
    var d = moment(new Date()).toISOString();

    Schedules.update(
      schId, {
        $set: {
          approvedBy: user._id, 
          approved: d, 
          status: 'Approved'
        }
      }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {

          }
        }
      );

    var periods = Periods.find({schId: schId});
    periods.forEach(function(p) {
      if (p.status != 'Approved') {
        Periods.update(
          p._id, {
            $set: {
              status: 'Approved',
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
    });

    var sch = Schedules.findOne(schId);
    var emp = Employees.findOne(sch.empId);
    var sup = Employees.findOne({userId: user._id});
    if (sup) {
      Notifications.insert({
        title: 'Schedule approved',
        authorName: sup.fname + ' ' + sup.lname,
        link: '/schedules/' + sch._id,
        read: false,
        userId: emp.userId,
        time: new Date()
      });
    } else {
      Notifications.insert({
        title: 'Schedule approved',
        authorName: user.username,
        link: '/schedules/' + sch._id,
        read: false,
        userId: emp.userId,
        time: new Date()
      });
    }

    return true;
  },

  scheduleReject: function(schId) {
    // console.log('scheduleReject(' + schId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to reject schedules");

    Schedules.update(
      schId, {
        $set: {
          rejectedBy: user._id, 
          rejected: moment(new Date()).toISOString(),
          submittedBy: null,
          submitted: null,
          lockedBy: null,
          locked: null,
          status: 'Rejected'
        }
      }, function(error) {
        if (error) {
          // display the error to the user
          alert(error.reason);
        } else {

        }
      }
    );

    var sch = Schedules.findOne(schId);
    var emp = Employees.findOne(sch.empId);
    var sup = Employees.findOne({userId: user._id});
    if (sup) {
      Notifications.insert({
        title: 'Schedule rejected',
        authorName: sup.fname + ' ' + sup.lname,
        link: '/schedules/' + sch._id,
        read: false,
        userId: emp.userId,
        time: new Date()
      });
    } else {
      Notifications.insert({
        title: 'Schedule rejected',
        authorName: user.username,
        link: '/schedules/' + sch._id,
        read: false,
        userId: emp.userId,
        time: new Date()
      });
    }

    return true;
  },

  scheduleSubmit: function(schAttributes) {
    // console.log('scheduleSubmit("' + schAttributes + '")');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete schedules");

    var sch = Schedules.findOne(schAttributes);
    if (sch) {
      if (!sch.empId)
        throw new Meteor.Error(422, 'Please select an employee for the schedule');

      if (!sch.validS)
        throw new Meteor.Error(422, 'Please enter a starting date for the schedule');

      if (!sch.validE)
        throw new Meteor.Error(422, 'Please enter a ending date for the schedule');

      if (sch.periodsCount == 0)
        throw new Meteor.Error(422, 'No period defined. Please fill the schedule before submission');

      Schedules.update(
        sch._id, {
          $set: {
            rejectedBy: null,
            rejected: null,
            approvedBy: null,
            approved: null,
            submittedBy: user._id, 
            submitted: moment(new Date()).toISOString(), 
            lockedBy: user._id,
            locked: moment(new Date()).toISOString(),
            status: 'Pending',
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

      // console.log('user._id: ' + user._id);
      var emp = Employees.findOne(sch.empId);
      if (emp) {
        // console.log('Employee found: ' + emp.fname + ' ' + emp.lname);
        var userId = null;
        if (emp.supervisorId) {
          var sup = Employees.findOne(emp.supervisorId);
          if (sup) {
            userId = sup.userId;
          }
        }
        if(!userId) {
          var adminUser = Meteor.users.findOne({username: 'Admin'});
          if (adminUser) {
            userId = adminUser._id;
          }
        }

        Notifications.insert({
          title: 'Schedule submitted',
          authorName: emp.fname + ' ' + emp.lname,
          link: '/schedules/' + sch._id,
          read: false,
          userId: userId,
          time: new Date()
        });
      } else {
        throw new Meteor.Error(404, "Employee not found!");  
      }
    } else {
      throw new Meteor.Error(404, "Schedule not found!");
    }

    var s = Settings.findOne({name: 'lastSchMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  }
});