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
    var userRole = Roles.findOne({name: 'User'});
    var approverRole = Roles.findOne({name: 'Approver'});
    var supervisorRole = Roles.findOne({name: 'Supervisor'});
    var adminRole = Roles.findOne({name: 'Admin'});
    if (userRole && approverRole && supervisorRole && adminRole) {
      var emp = Employees.findOne({userId: user._id});
      if (emp) {
        var limit = this.handle.limit();
        switch (emp.roleId) {
          case userRole._id:
            Session.set('nbPosts', Posts.find({empId: emp._id}).count());
            return Posts.find({empId: emp._id}, {sort: {year: -1, month: -1}, limit: limit});
            break;
          case approverRole._id:
            Session.set('nbPosts', Posts.find({empId: emp._id}).count());
            return [];
            break;
          case supervisorRole._id:
            var aPosts = new Meteor.Collection(null);
            var n = 0;
            var ePosts = Posts.find({empId: emp._id}, {sort: {year: -1, month: -1}, limit: limit});
            ePosts.forEach(function(p) {
              aPosts.insert(p);
              n++;
            });
            var employees = Employees.find({supervisorId: emp._id});
            employees.forEach(function(e) {
              ePosts = Posts.find({empId: e._id}, {sort: {year: -1, month: -1}, limit: limit});
              ePosts.forEach(function(p) {
                aPosts.insert(p);
                n++;
              });
            });
            console.log('Limit: ' + limit + ', ' + n + ' post(s) found.');
            Session.set('nbPosts', n);
            return aPosts.find({}, {sort: {year: -1, month: -1}, limit: limit});
            break;
          case adminRole._id:
            Session.set('nbPosts', Posts.find({}).count());
            return Posts.find({}, {sort: {year: -1, month: -1, modified: -1}, limit: limit});
            break;
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
    return false;
    return this.handle.ready() &&
      Session.get('nbPosts') < this.handle.loaded();

    // var user = Meteor.user();
    // if (user) {
    //   if (isAdmin(user)) {
    //     var n = Posts.find().count();
    //   } else {
    //     var adminRole = Roles.findOne({name: 'Admin'});
    //     if (adminRole) {
    //       var emp = Employees.findOne({userId: user._id});
    //       if (emp) {
    //         if (emp.roleId === adminRole._id) {
    //           var n =  Posts.find().count();
    //         } else {
    //           var n = Posts.find({empId: emp._id}).count();
    //         }
    //       }
    //     }
    //   }
    // 	return this.handle.ready() &&
    // 	  n < this.handle.loaded();
    // } else {
    //   return true;
    // }
  }
});

Template.postsList.events({
  'click .load-more': function(event) {
  	event.preventDefault();
  	this.handle.loadNextPage();
  }
});