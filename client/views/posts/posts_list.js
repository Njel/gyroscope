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

Template.newPosts.selectedMonthFilter = function() {
  return Session.get('selectedMonthFilter');
};

Template.newPosts.selectedYearFilter = function() {
  return Session.get('selectedYearFilter');
};

Template.newPosts.selectedGroupFilter = function() {
  return Session.get('selectedGroupFilter');
};

Template.newPosts.showDialogPost = function() {
  return Session.get('showDialogPost');
};

Template.newPosts.showDialogPostDelConf = function() {
  return Session.get('showDialogPostDelConf');
};

Template.newPosts.showDialogGroup = function() {
  return Session.get('showDialogGroup');
};

Template.newPosts.groups = function() {
  return Groups.find({}, {sort: {name: 1}});
};

Template.newPosts.years = function() {
  var Y = Posts.find({},{sort: {year: -1}});
  var R = [];
  var E = {};
  Y.forEach(function(y) {
    if (!E[y.year]) {
      E[y.year] = true;
      R.push({year: y.year});
    }
  });
  return R;
};

Template.newPosts.months = function() {
  var M = [];
  for (var m = 0; m < 12; m++) {
    M.push({m: m +1, mm: moment(new Date(2014, m, 1)).format("MMM")});
  }
  return M;
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
  },
  'change #mm': function(event, tmpl) {
    var month = parseInt(tmpl.find('[name=mm]').value);
    if (month == '') {
      Session.set('selectedMonthFilter', null);
    } else {
      Session.set('selectedMonthFilter', month);
    }
  },
  'change #yr': function(event, tmpl) {
    var year = parseInt(tmpl.find('[name=yr]').value);
    if (year == '') {
      Session.set('selectedYearFilter', null);
    } else {
      Session.set('selectedYearFilter', year);
    }
  },
  'change #groupId': function(event, tmpl) {
    var groupId = tmpl.find('[name=groupId]').value;
    if (groupId == '') {
      Session.set('selectedGroupFilter', null);
    } else {
      Session.set('selectedGroupFilter', groupId);
    }
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
    var posts = null;
    var limit = this.handle.limit();
    var n = 0;
    var filter = {};
    var month = Session.get('selectedMonthFilter');
    var year = Session.get('selectedYearFilter');
    if (month) {
      if (year) {
        filter = {month: month, year: year};
      } else {
        filter = {month: month};
      }
    } else {
      if (year) {
        filter = {year: year};
      }
    }
    if (isAdmin(user)) {
      // return Posts.find({}, {sort: {year: -1, month: -1, modified: -1}, limit: this.handle.limit()});
      var groupId = Session.get('selectedGroupFilter');
      if (groupId) {
        var aPosts = new Meteor.Collection(null);
        var empIds = new Meteor.Collection(null);
        var empInGrp = EmpGrp.find({grpId: groupId});
        empInGrp.forEach(function(e) {
          ePosts = Posts.find({empId: e.empId}, {sort: {year: -1, month: -1}, limit: limit});
          ePosts.forEach(function(p) {
            aPosts.insert(p);
            n++;
          });
        });
        posts = aPosts.find(filter, {sort: {year: -1, month: -1}, limit: limit});
      } else {
        posts = Posts.find(filter, {sort: {year: -1, month: -1, modified: -1}, limit: limit});
      }
    } else {
      var userRole = Roles.findOne({name: 'User'});
      var approverRole = Roles.findOne({name: 'Approver'});
      var supervisorRole = Roles.findOne({name: 'Supervisor'});
      var adminRole = Roles.findOne({name: 'Admin'});
      if (userRole && approverRole && supervisorRole && adminRole) {
        var emp = Employees.findOne({userId: user._id});
        if (emp) {
          switch (emp.roleId) {
            case userRole._id:
              posts = Posts.find({empId: emp._id}, {sort: {year: -1, month: -1}, limit: limit});
              break;
            case supervisorRole._id:
              var aPosts = new Meteor.Collection(null);
              var groupId = Session.get('selectedGroupFilter');
              if (groupId) {
                var empIds = new Meteor.Collection(null);
                var empInGrp = EmpGrp.find({grpId: groupId});
                empInGrp.forEach(function(e) {
                  empIds.insert({empId: e.empId});
                });
                if(empIds.findOne({empId: emp._id})) {
                  // var eFilter = _.extend(_.pick(filter, 'month', 'year'), {
                  //   empId: emp._id
                  // });
                  var ePosts = Posts.find({empId: emp._id}, {sort: {year: -1, month: -1}, limit: limit});
                  // var ePosts = Posts.find(eFilter, {sort: {year: -1, month: -1}, limit: limit});
                  ePosts.forEach(function(p) {
                    aPosts.insert(p);
                    n++;
                  });
                }
                var employees = Employees.find({supervisorId: emp._id});
                employees.forEach(function(e) {
                  if (empIds.findOne({empId: e._id})) {
                    // var eFilter = _.extend(_.pick(filter, 'month', 'year'), {
                    //   empId: emp._id
                    // });
                    ePosts = Posts.find({empId: e._id}, {sort: {year: -1, month: -1}, limit: limit});
                    // ePosts = Posts.find(eFilter, {sort: {year: -1, month: -1}, limit: limit});
                    ePosts.forEach(function(p) {
                      aPosts.insert(p);
                      n++;
                    });
                  }
                });
              } else {
                var ePosts = Posts.find({empId: emp._id}, {sort: {year: -1, month: -1}, limit: limit});
                ePosts.forEach(function(p) {
                  aPosts.insert(p);
                  n++;
                });
                var employees = Employees.find({supervisorId: emp._id});
                employees.forEach(function(e) {
                  // var eFilter = _.extend(_.pick(filter, 'month', 'year'), {
                  //   empId: emp._id
                  // });
                  ePosts = Posts.find({empId: e._id}, {sort: {year: -1, month: -1}, limit: limit});
                  // ePosts = Posts.find(eFilter, {sort: {year: -1, month: -1}, limit: limit});
                  ePosts.forEach(function(p) {
                    aPosts.insert(p);
                    n++;
                  });
                });
              }
              posts = aPosts.find(filter, {sort: {year: -1, month: -1}, limit: limit});
              break;
            case adminRole._id:
            case approverRole._id:
              var groupId = Session.get('selectedGroupFilter');
              if (groupId) {
                var aPosts = new Meteor.Collection(null);
                var n = 0;
                var empIds = new Meteor.Collection(null);
                var empInGrp = EmpGrp.find({grpId: groupId});
                empInGrp.forEach(function(e) {
                  ePosts = Posts.find({empId: e.empId}, {sort: {year: -1, month: -1}, limit: limit});
                  ePosts.forEach(function(p) {
                    aPosts.insert(p);
                    n++;
                  });
                });
                posts = aPosts.find(filter, {sort: {year: -1, month: -1}, limit: limit});
              } else {
                posts = Posts.find(filter, {sort: {year: -1, month: -1, modified: -1}, limit: limit});
              }
              break;
          }
        }
      }
    }
    // var where = "this.empId == '" + emp._id + "'";
    // var e = Events.findOne({postId: Session.get('currentPostId'), period: p._id, $where: where});
    // return Posts.find({}, {sort: this.sort, limit: this.handle.limit()});

    if (posts) {
      n = posts.count();
    }
    Session.set('nbPosts', n);
    // console.log('Limit: ' + limit + ', ' + n + ' post(s) found.');
    return posts;
  },

  postsReady: function() {
  	return this.handle.ready();
  },
  
  allPostsLoaded: function() {
    // return false;
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