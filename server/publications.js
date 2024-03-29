Meteor.publish('posts', function() {
  return Posts.find();
});

// Meteor.publish('posts', function() {
Meteor.publish('newPosts', function(limit) {
  // return Posts.find();
  return Posts.find({}, {sort: {year: -1, month: -1, modified: -1}, limit: limit});
});

// Meteor.publish('singlePost', function(id) {
//   return id && Posts.find(id);
// });

Meteor.publish('employees', function() {
  return Employees.find();
});

Meteor.publish('balances', function() {
  return Balances.find();
});

Meteor.publish('groups', function() {
  return Groups.find();
});

Meteor.publish('emp_grp', function() {
  return EmpGrp.find();
});

Meteor.publish('holidays', function() {
  return Holidays.find();
});

Meteor.publish('schedules', function() {
  return Schedules.find();
});

Meteor.publish('totals', function() {
  return Totals.find();
});

Meteor.publish('periods', function() {
  return Periods.find();
});

Meteor.publish('roles', function() {
  return Roles.find();
});

// Meteor.publish('events', function(postId) {
//   return Events.find({postId: postId});
// });

Meteor.publish('events', function() {
  return Events.find();
});

Meteor.publish('eventTypes', function() {
  return EventTypes.find();
});

// Meteor.publish('settings', function() {
//   return Settings.find();
// });





var privacyOptions = { // false means private
  secret_id: false,
  isAdmin: false,
  emails: false,
  notifications: false,
  inviteCount: false,
  'profile.email': false,
  'services.twitter.accessToken': false,
  'services.twitter.accessTokenSecret': false,
  'services.twitter.id': false,
  'services.password': false,
  'services.resume': false
};

// -------------------------------------------- Users -------------------------------------------- //

// Publish the current user

Meteor.publish('currentUser', function() {
  var user = Meteor.users.find(this.userId);
  return user;
});

// Publish a single user

Meteor.publish('singleUser', function(userIdOrSlug) {
  if(canViewById(this.userId)){
    var options = isAdminById(this.userId) ? {limit: 1} : {limit: 1, fields: privacyOptions};
    var findById = Meteor.users.find(userIdOrSlug, options);
    var findBySlug = Meteor.users.find({slug: userIdOrSlug}, options)
    // if we find something when treating the argument as an ID, return that; else assume it's a slug
    return findById.count() ? findById : findBySlug;
  }
  return [];
});

// Publish authors of the current post and its comments

Meteor.publish('postUsers', function(postId) {
  if(canViewById(this.userId)){
    // publish post author and post commenters
    var post = Posts.findOne(postId),
        users = [];
        
    if(post) {
      var comments = Comments.find({post: post._id}).fetch();
      // get IDs from all commenters on the post, plus post author's ID
      users = _.pluck(comments, "userId");
      users.push(post.userId);
      users = _.unique(users);
    }
    
    return Meteor.users.find({_id: {$in: users}}, {fields: privacyOptions});
  }
  return [];
});

// Publish author of the current comment

Meteor.publish('commentUser', function(commentId) {
  if(canViewById(this.userId)){
    var comment = Comments.findOne(commentId);
    return Meteor.users.find({_id: comment && comment.userId}, {fields: privacyOptions});
  }
  return [];
});

// Publish all the users that have posted the currently displayed list of posts

Meteor.publish('postsListUsers', function(terms) {
  if(canViewById(this.userId)){
    var parameters = getParameters(terms),
        posts = Posts.find(parameters.find, parameters.options),
        userIds = _.pluck(posts.fetch(), 'userId');
    return Meteor.users.find({_id: {$in: userIds}}, {fields: privacyOptions, multi: true});
  }
  return [];
});

// Publish all users

Meteor.publish('allUsers', function(filterBy, sortBy, limit) {
  if(canViewById(this.userId)){
    // var parameters = getUsersParameters(filterBy, sortBy, limit);
    // if (!isAdminById(this.userId)) // if user is not admin, filter out sensitive info
    //   parameters.options = _.extend(parameters.options, {fields: privacyOptions});
    // return Meteor.users.find(parameters.find, parameters.options);  
    return Meteor.users.find();
  }
  return [];
});

// publish all users for admins to make autocomplete work
// TODO: find a better way

Meteor.publish('allUsersAdmin', function() {
  if (isAdminById(this.userId)) {
    return Meteor.users.find();
  } else {
    return [];
  }
});

// -------------------------------------------- Posts -------------------------------------------- //

// Publish a single post

Meteor.publish('singlePost', function(id) {
  if(canViewById(this.userId)){
    return Posts.find(id);
  }
  return [];
});

// Publish the post related to the current comment

Meteor.publish('commentPost', function(commentId) {
  if(canViewById(this.userId)){
    var comment = Comments.findOne(commentId);
    return Posts.find({_id: comment && comment.post});
  }
  return [];
});

// Publish a list of posts

Meteor.publish('postsList', function(terms) {
  if(canViewById(this.userId)){
    var parameters = getParameters(terms),
        posts = Posts.find(parameters.find, parameters.options);
    if(terms.query)
      logSearch(terms.query);
    // console.log('//-------- Subscription Parameters:');
    // console.log(parameters.find);
    // console.log(parameters.options);
    // console.log('Found '+posts.fetch().length+ ' posts:');
    // posts.rewind();
    // console.log(_.pluck(posts.fetch(), 'headline'));
    return posts;
  }
  return [];
});

// -------------------------------------------- Comments -------------------------------------------- //

// Publish comments for a specific post

Meteor.publish('postComments', function(postId) {
  if(canViewById(this.userId)){  
    return Comments.find({post: postId});
  }
  return [];
});

// Publish a single comment

Meteor.publish('singleComment', function(commentId) {
  if(canViewById(this.userId)){
    return Comments.find(commentId);
  }
  return [];
});

// -------------------------------------------- Other -------------------------------------------- //

Meteor.publish('settings', function() {
  var options = {};
  if(!isAdminById(this.userId)){
    options = _.extend(options, {
      fields: {
        mailChimpAPIKey: false,
        mailChimpListId: false
      }
    });
  }
  return Settings.find({}, options);
});

Meteor.publish('notifications', function() {
  return Notifications.find();
});

// Meteor.publish('notifications', function() {
//   // only publish notifications belonging to the current user
//   if(canViewById(this.userId)){
//     return Notifications.find({userId:this.userId});
//   }
//   return [];
// });

// Meteor.publish('categories', function() {
//   if(canViewById(this.userId)){
//     return Categories.find();
//   }
//   return [];
// });

// Meteor.publish('searches', function(limit) {
//   var limit = typeof limit === undefined ? 20 : limit; 
//   if(isAdminById(this.userId)){
//    return Searches.find({}, {limit: limit, sort: {timestamp: -1}});
//   }
//   return [];
// });