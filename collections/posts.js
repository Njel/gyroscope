Posts = new Meteor.Collection('posts');

Posts.allow({
  // insert: function(userId, doc) {
  // 	// only allow posting if you are logged in
  // 	return !! userId;
  // }
  update: ownsDocument,
  remove: ownsDocument
});

Posts.deny({
  update: function(userId, post, fieldNames) {
  	// may only edit the following three fields:
  	return (_.without(fieldNames, 'year', 'month').length > 0);
  }
});

Meteor.methods({
  post: function(postAttributes) {
  	var user = Meteor.user();

  	// ensure the user is logged in
  	if (!user)
  	  throw new Meteor.Error(401, 'You need to login to post new timesheets');

  	// ensure the post has a year
  	if (!postAttributes.year)
  	  throw new Meteor.Error(422, 'Please select a year');

    // ensure the post has a month
    if (!postAttributes.month)
      throw new Meteor.Error(422, 'Please select a month');

  	// check that there are no previous posts with the same link
    var postForSameMonth = Posts.findOne({year: postAttributes.year, month: postAttributes.month, empId: postAttributes.empId});
  	if (postForSameMonth)
  	  throw new Meteor.Error(302, 'This timesheet has already been posted', postForSameMonth._id);

    var d = moment(new Date()).toISOString();

  	// pick out the whitelisted keys
  	var post = _.extend(_.pick(postAttributes, 'empId', 'title', 'year', 'month'), {
  	  submitted: new Date().getTime(),
      daysCount: new Date(postAttributes.year, postAttributes.month, 0).getDate(),
      eventsCount: 0,
      createdBy: user._id,
      created: d,
      modifiedBy: user._id,
      modified: d,
      status: 'New'
  	});

  	var postId = Posts.insert(post);

    var bal = Balances.findOne({year: postAttributes.year, empId: postAttributes.empId});
    if (!bal) {
      var emp = Employees.findOne(postAttributes.empId);
      var prevBal = Balances.findOne({year: postAttributes.year - 1, empId: emp._id});
      if (prevBal) {
        var AL = parseFloat(prevBal.AL) + parseFloat(emp.AL * 7.5);
        var SL = parseFloat(prevBal.SL) + parseFloat(emp.SL * 7.5);
        var X = parseFloat(prevBal.X);
      } else {
        var AL = parseFloat(emp.AL * 7.5);
        var SL = parseFloat(emp.SL * 7.5);
        var X = 0.0;
      }
      Balances.insert({
        year: postAttributes.year,
        empId: postAttributes.empId,
        AL: AL,
        SL: SL,
        X: X
      });
    }

  	return postId;
  },

  postGenEvents: function(postAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, 'You need to login to post new timesheets');

    // ensure the post has a year
    if (!postAttributes.year)
      throw new Meteor.Error(422, 'Please select a year');

    // ensure the post has a month
    if (!postAttributes.month)
      throw new Meteor.Error(422, 'Please select a month');

    // check that there are no previous posts with the same link
    var post = Posts.findOne({year: postAttributes.year, month: postAttributes.month, empId: postAttributes.empId});
    if (!post) {
      var d = moment(new Date()).toISOString();

      // pick out the whitelisted keys
      var post = _.extend(_.pick(postAttributes, 'empId', 'title', 'year', 'month'), {
        submitted: new Date().getTime(),
        daysCount: new Date(postAttributes.year, postAttributes.month, 0).getDate(),
        eventsCount: 0,
        createdBy: user._id,
        created: d,
        modifiedBy: user._id,
        modified: d,
        status: 'Generated'
      });

      var postId = Posts.insert(post);

      var bal = Balances.findOne({year: postAttributes.year, empId: postAttributes.empId});
      if (!bal) {
        var emp = Employees.findOne(postAttributes.empId);
        var prevBal = Balances.findOne({year: postAttributes.year - 1, empId: emp._id});
        if (prevBal) {
          var AL = parseFloat(prevBal.AL) + parseFloat(emp.AL * 7.5);
          var SL = parseFloat(prevBal.SL) + parseFloat(emp.SL * 7.5);
          var X = parseFloat(prevBal.X);
        } else {
          var AL = parseFloat(emp.AL * 7.5);
          var SL = parseFloat(emp.SL * 7.5);
          var X = 0.0;
        }
        Balances.insert({
          year: postAttributes.year,
          empId: postAttributes.empId,
          AL: AL,
          SL: SL,
          X: X
        });
      }
    } else {
      var postId = post._id;
    }

    var type = EventTypes.findOne({code: postAttributes.type});
    var sid = postAttributes.schId;

    if (type && sid) {
      var nbDays = post.daysCount;
      // console.log('Nb Days: ' + nbDays);
      // console.log(D);

      var n = 0;
      var value = 0.0;
      var cValue = 0.0;

      for (var i = 1; i <= nbDays; i++) {
        // console.log(post.year + '-' + post.month + ': ' + i);
        var d0 = moment(new Date(post.year, post.month - 1, i));
        var d = d0.day();
        if (d != 0 && d != 6) {
          D = d0.format("YYYY-MM-DD").substring(0,10);
          var H = Holidays.findOne({date: D});
          if (!H) {
            var periods = Periods.find({schId: sid, day: d});
            periods.forEach(function(p) {
              var ev = {
                postId: postId,
                empId: postAttributes.empId,
                year: parseInt(post.year),
                month: parseInt(post.month),
                start: D + 'T' + p.start + ':00.000Z',
                end: D + 'T' + p.end + ':00.000Z',
                duration: p.hours,
                unit: 'h',
                period: p._id,
                type: type._id,
                title: type.code,
                status: 'Generated',
                allDay: false,
                approved: null,
                approver: null,
                reviewed: null,
                reviewer: null,
                submitted: new Date().getTime(),
                createdBy: user._id,
                created: d,
                modifiedBy: user._id,
                modified: d
              };
              n++;
              value += p.hours;
              cValue += (p.hours * type.ratio);

              // create the event, save the id
              Events.insert(ev);
            });
          }
        }
      };

      var tot = Totals.findOne({postId: postId, type: type._id});
      if (tot) {
        Totals.update(tot._id, {
          $inc: {
            value: value,
            cValue: cValue
          }, 
          $set: {
            modifiedBy: user._id,
            modified: d
          }
        });
      } else {
        Totals.insert({
          postId: postId,
          empId: post.empId,
          year: post.year,
          month: post.month,
          type: type._id,
          code: type.code,
          unit: 'h',
          value: value,
          cValue: cValue,
          createdBy: user._id,
          created: d,
          modifiedBy: user._id,
          modified: d
        });
      }

      // update the post with the number of events
      Posts.update(postId, {$set: {status: 'Generated'}, $inc: {eventsCount: n}});
    }

    return postId;
  },

  postUpd: function(postAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, 'You need to login to post new timesheets');

    // ensure the post has a year
    if (!postAttributes.year)
      throw new Meteor.Error(422, 'Please select a year');

    // ensure the post has a month
    if (!postAttributes.month)
      throw new Meteor.Error(422, 'Please select a month');

    // check that there are no previous posts with the same link
    var postForSameMonth = Posts.findOne({year: postAttributes.year, month: postAttributes.month, userId: postAttributes.empId});
    if (postForSameMonth && postAttributes.id != postForSameMonth._id) {
      throw new Meteor.Error(302, 'This timesheet has already been posted', postForSameMonth._id);
    }

    var p = Posts.findOne(postAttributes.id);

    if (p) {
      if (p.locked) {
        throw new Meteor.Error(401, 'Timesheet locked!');
      } else {
        Posts.update(
          p._id, {
            $set: {
              empId: postAttributes.empId,
              title: postAttributes.title,
              year: postAttributes.year,
              month: postAttributes.month,
              daysCount: new Date(postAttributes.year, postAttributes.month, 0).getDate(),
              status: 'Updated',
              modifiedBy: user._id,
              modified: moment(new Date()).toISOString()
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
    } else {
      throw new Meteor.Error(404, "Timesheet not found!");
    }
    return true;
  },

  postRemove: function(post) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete timesheets");

    if (!Events.find({postId: post.id}).count() == 0) {
      if (post.delEvts) {
        Events.remove({postId: post.id});
        Totals.remove({postId: post.id});
      } else {
        throw new Meteor.Error(422, 'This timesheet contains events');
      }
    }

    Posts.remove(post.id, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {

      }
    });

    return true;
  },

  postUpdateStatus: function(post) {
    var user = Meteor.user();
    Posts.update(
      post.postId, {
        $set: {
          eventsCount: post.eventsCount,
          status: post.status,
          modifiedBy: user._id,
          modified: moment(new Date()).toISOString()
        }
      }, function(error) {
        if (error) {
          // display the error to the user
          alert(error.reason);
        } else {

        }
      }
    );
  },

  postResetCounters: function(post) {
    var user = Meteor.user();

    Posts.update(
      post._id, {
        $set: {
          eventsCount: 0,
          status: 'Reset',
          modifiedBy: user._id,
          modified: moment(new Date()).toISOString()
        }
      }, function(error) {
        if (error) {
          // display the error to the user
          alert(error.reason);
        } else {
        }
      }
    );
    Totals.remove({postId: post._id});
  },

  postLock: function(postId) {
    // console.log('postLock(' + postId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to lock timesheets");

    Posts.update(
      postId, {
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

  postUnlock: function(postId) {
    // console.log('postUnlock(' + postId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to unlock timesheets");

    Posts.update(
      postId, {
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

  postApprove: function(postId) {
    // console.log('postApprove(' + postId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to approve timesheets");

    Posts.update(
      postId, {
        $set: {
          approvedBy: user._id, 
          approved: moment(new Date()).toISOString(), 
          status: 'Approved',
          modifiedBy: user._id,
          modified: moment(new Date()).toISOString()
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

  postReject: function(postId) {
    // console.log('postReject(' + postId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to reject timesheets");

    Posts.update(
      postId, {
        $set: {
          rejectedBy: user._id, 
          rejected: moment(new Date()).toISOString(),
          submittedBy: null,
          submitted: null,
          lockedBy: null,
          locked: null,
          status: 'Rejected',
          modifiedBy: user._id,
          modified: moment(new Date()).toISOString()
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

  postSubmit: function(postId) {
    // console.log('postSubmit(' + postId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to submit timesheets");

    var p = Posts.findOne(postId);
    if (p) {
      if (p.locked) {
        alert('Post locked.');
        return false;
      } else {
        Posts.update(
          postId, {
            $set: {
              rejectedBy: null,
              rejected: null,
              approvedBy: null,
              approved: null,
              submittedBy: user._id, 
              submitted: moment(new Date()).toISOString(), 
              lockedBy: user._id,
              locked: moment(new Date()).toISOString(),
              status: 'Submitted',
              modifiedBy: user._id,
              modified: moment(new Date()).toISOString()
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
    } else {
      throw new Meteor.Error(404, "Timesheet not found!");
    }
    return true;
  },

  upvote: function(postId) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, 'You need to login to upvote');

    // var post = Posts.findOne(postId);
    // if (!post)
    //   throw new Meteor.Error(422, 'Post not found');

    // if (_.include(post.upvoters, user._id))
    //   throw new Meteor.Error(422, 'Already upvoted this post');

    Posts.update({
      _id: postId,
      upvoters: {$ne: user._id}
    }, {
      $addToSet: {upvoters: user._id},
      $inc: {votes: 1}
    });
  }
});