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
  	  throw new Meteor.Error(401, 'You need to login to post new stories');

  	// ensure the post has a year
  	if (!postAttributes.year)
  	  throw new Meteor.Error(422, 'Please select a year');

    // ensure the post has a month
    if (!postAttributes.month)
      throw new Meteor.Error(422, 'Please select a month');

  	// check that there are no previous posts with the same link
    var postForSameMonth = Posts.findOne({year: postAttributes.year, month: postAttributes.month, userId: user._id});
  	if (postForSameMonth)
  	  throw new Meteor.Error(302, 'This month has already been posted', postForSameMonth._id);

    var d = new Date().toISOString();

  	// pick out the whitelisted keys
  	var post = _.extend(_.pick(postAttributes, 'title', 'year', 'month'), {
  	  userId: user._id,
  	  author: user.username,
  	  submitted: new Date().getTime(),
      daysCount: new Date(postAttributes.year, postAttributes.month, 0).getDate(),
      eventsCount: 0,
      createdBy: user._id,
      created: d,
      modifiedBy: user._id,
      modified: d      
  	});

  	var postId = Posts.insert(post);

  	return postId;
  },

  postUpd: function(postAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, 'You need to login to post new stories');

    // ensure the post has a year
    if (!postAttributes.year)
      throw new Meteor.Error(422, 'Please select a year');

    // ensure the post has a month
    if (!postAttributes.month)
      throw new Meteor.Error(422, 'Please select a month');

    // check that there are no previous posts with the same link
    var postForSameMonth = Posts.findOne({year: postAttributes.year, month: postAttributes.month, userId: user._id});
    if (postForSameMonth && postAttributes.id != postForSameMonth._id) {
      throw new Meteor.Error(302, 'This month has already been posted', postForSameMonth._id);
    }

    var p = Posts.findOne(postAttributes.id);

    if (p) {
      Posts.update(
        p._id, {
          $set: {
            year: postAttributes.year,
            month: postAttributes.month,
            title: postAttributes.title,
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
    } else {
      throw new Meteor.Error(404, "Month not found!");
    }
    return true;
  },

  postRemove: function(postAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete months");

    if (!Events.find({postId: postAttributes.id}).count() == 0) {
      if (postAttributes.delEvts)
        Events.remove({postId: postAttributes.id})
      else
        throw new Meteor.Error(422, 'This month contains events');
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