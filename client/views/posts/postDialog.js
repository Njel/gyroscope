Template.postDialog.helpers({
  isAdmin: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if(currUser.username == 'Admin')
      return true;
    var adminRole = Roles.findOne({name: 'Admin'});
    if (adminRole) {
      var currEmp = Employees.findOne({userId: currUser._id});
      if (currEmp && currEmp.roleId == adminRole._id) {
        return true;
      }
    }
    return false;
  },
  months: function() {
    return Months.find();
  },
  users: function() {
    return Meteor.users.find();
  },
  employees: function() {
    return Employees.find();
  }
});

Template.postDialog.selectedPost = function() {
  return Session.get('selectedPost');
};

Template.postDialog.post = function() {
  var postId = Session.get('selectedPost');

  if (postId) {
    var p = Posts.findOne(postId);
    if (p) {
      var cBy = Meteor.users.findOne(p.createdBy);
      if (cBy)
        createdBy = cBy.username;
      else
        createdBy = '<System Account>';
      var mBy = Meteor.users.findOne(p.modifiedBy);
      if (mBy)
        modifiedBy = mBy.username;
      else
        modifiedBy = '<System Account>';

      var post = {
        empId: p.empId,
        year: p.year,
        month: p.month - 1,
        title: p.title,
        status: p.status,
        createdBy: createdBy,
        created: new Date(p.created),
        modifiedBy: modifiedBy,
        modified: new Date(p.modified)
      }
    }
  } else {
    var d = new Date();
    var currEmp = Employees.findOne({userId: Meteor.userId()});
    if (currEmp) {
      var lastPost = Posts.findOne({empId: currEmp._id}, {$sort: {year: -1, month: -1}, $limit: 1});
      if (lastPost)
        var m = lastPost.month;
      else
        var m = d.getMonth();
      var post = {
        empId: currEmp._id,
        year: d.getFullYear(),
        month: m,
        title: '',
        status: ''
      }
    } else {
      var post = {
        empId: null,
        year: d.getFullYear(),
        month: d.getMonth(),
        title: '',
        status: ''
      }
    }
  }
  return post;
};

Template.postDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedPost', null);
    Session.set('showDialogPost', false);
  },
  'click .close': function(evt, tmpl) {
    Session.set('selectedPost', null);
    Session.set('showDialogPost', false);
  },
  'click .add': function(evt, tmpl) {
    var empId = tmpl.find('[name=empId]').value;
    var year = parseInt(tmpl.find('[name=year]').value);
    var month = parseInt(tmpl.find('[name=month]').value);
    var title = moment(new Date(year, month, 1)).format('MMMM YYYY');
    var post = {
      empId: empId,
      title: title,
      year: year,
      month: (month + 1)
    };

    // console.log(post);

    Meteor.call('post', post, function(error, id) {
      if (error) {
        // display the error to the user
        throwError(error.reason);

        if (error.error === 302) {
          Session.set('showDialogPost', false);
          Meteor.Router.to('postPage', error.details);
        }
      // } else {
      //   Meteor.Router.to('postPage', id);
      } else {
        throwMessage('New month created successfully.');
        Session.set('selectedPost', null);
        Session.set('showDialogPost', false);
      }
    });
  },
  'click .save': function(evt, tmpl) {
    var empId = tmpl.find('[name=empId]').value;
    var year = parseInt(tmpl.find('[name=year]').value);
    var month = parseInt(tmpl.find('[name=month]').value);
    var title = moment(new Date(year, month, 1)).format('MMMM YYYY');
    var post = {
      id: Session.get('selectedPost'),
      empId: empId,
      title: title,
      year: year,
      month: (month + 1)
    };

    Meteor.call('postUpd', post, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('Month updated successfully.');
        Session.set('selectedPost', null);
        Session.set('showDialogPost', false);
      }
    });
  }
});