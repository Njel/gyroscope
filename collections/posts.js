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

    var d = new Date().toISOString();

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
    } else {
      throw new Meteor.Error(404, "Timesheet not found!");
    }
    return true;
  },

  postRemove: function(postAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete timesheets");

    if (!Events.find({postId: postAttributes.id}).count() == 0) {
      if (postAttributes.delEvts)
        Events.remove({postId: postAttributes.id})
      else
        throw new Meteor.Error(422, 'This timesheet contains events');
    }

    Posts.remove(postAttributes.id, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {

      }
    });

    return true;
  },

  postResetCounters: function(post) {
    Posts.update(
      post._id, {
        $set: {
          eventsCount: 0
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

  postLock: function(postId) {
    console.log('postLock(' + postId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to lock timesheets");

    Posts.update(
      postId, {
        $set: {
          lockedBy: user._id,
          locked: new Date().toISOString()
          // status: 'locked'
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
    console.log('postUnlock(' + postId + ')');
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
    console.log('postApprove(' + postId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to approve timesheets");

    Posts.update(
      postId, {
        $set: {
          approvedBy: user._id, 
          approved: new Date().toISOString(), 
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
    return true;
  },

  postReject: function(postId) {
    console.log('postReject(' + postId + ')');
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to reject timesheets");

    Posts.update(
      postId, {
        $set: {
          rejectedBy: user._id, 
          rejected: new Date().toISOString(),
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
    return true;
  },

  postSubmit: function(postId) {
    console.log('postSubmit(' + postId + ')');
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
              submitted: new Date().toISOString(), 
              lockedBy: user._id,
              locked: new Date().toISOString(),
              status: 'Submitted'
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