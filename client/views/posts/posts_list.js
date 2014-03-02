Template.newPosts.helpers({
  isAuthorized: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if(currUser.username == 'Admin')
      return true;
    var currEmp = Employees.findOne({userId: currUser._id});
    if (currEmp)
      return true;
    return false;
  },
  hasAccess: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if ((this.empId == currUser._id) || (this.createdBy == currUser._id))
      return true;
    if(currUser.username == 'Admin')
      return true;
    var adminRole = Roles.findOne({name: 'Admin'});
    if (adminRole) {
      var currEmp = Employees.findOne({userId: currUser._id});
      if (currEmp && (currEmp.roleId == adminRole._id || currEmp._id == this.empId)) {
        return true;
      }
    }
    return false;
  },
  isAdmin: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if(currUser.username == 'Admin')
      return true;
    var adminRole = Roles.findOne({name: 'Admin'});
    if (adminRole) {
      var currEmp = Employees.findOne({userId: currUser._id});
      if (currEmp && (currEmp.roleId == adminRole._id || currEmp._id == this.empId)) {
        return true;
      }
    }
    return false;
  },
  options: function() {
  	return {
  	  sort: {submitted: -1},
  	  handle: newPostsHandle
  	}
  }
});

Template.newPosts.showDialogPost = function() {
  return Session.get('showDialogPost');
};

Template.newPosts.showDialogPostDelConf = function() {
  return Session.get('showDialogPostDelConf');
};

Template.newPosts.showDialogGroup = function() {
  return Session.get('showDialogGroup');
};

Template.newPosts.events({
  'click .add': function(event) {
    // console.log('Add month click');
    event.preventDefault();
    Session.set('selectedPost', null);
    Session.set('showDialogPost', true);
  },
  'click .add-group': function(event) {
    // console.log('Add group click');
    event.preventDefault();
    Session.set('selectedGroup', null);
    Session.set('showDialogGroup', true);
  }
});

Template.postsList.helpers({
  postsWithRank: function() {
    var i = 0, options = {sort: this.sort, limit: this.handle.limit()};
    return Posts.find({}, options).map(function(post) {
      post._rank = i;
      i += 1;
      return post;
    });
  },

  posts: function() {
    var user = Meteor.user();
    // console.log(user);
    if (!user)
      return [];
    if (isAdmin(user))
      // return Posts.find({}, {sort: this.sort, limit: this.handle.limit()});
      return Posts.find({}, {sort: {year: -1, month: -1, modified: -1}, limit: this.handle.limit()});
    var adminRole = Roles.findOne({name: 'Admin'});
    if (adminRole) {
      var emp = Employees.findOne({userId: user._id});
      if (emp) {
        if (emp.roleId === adminRole._id) {
          return Posts.find({}, {sort: {year: -1, month: -1, modified: -1}, limit: this.handle.limit()});
        } else {
          return Posts.find({empId: emp._id}, {sort: {year: -1, month: -1}, limit: this.handle.limit()});
        }
      }
    }
    // var where = "this.empId == '" + emp._id + "'";
    // var e = Events.findOne({postId: Session.get('currentPostId'), period: p._id, $where: where});
    // return Posts.find({}, {sort: this.sort, limit: this.handle.limit()});
    return [];
  },

  postsReady: function() {
  	return this.handle.ready();
  },
  
  allPostsLoaded: function() {
  	return this.handle.ready() &&
  	  Posts.find().count() < this.handle.loaded();
  }
});

Template.postsList.events({
  'click .load-more': function(event) {
  	event.preventDefault();
  	this.handle.loadNextPage();
  }
});