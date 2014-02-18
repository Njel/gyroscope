Template.postDelConfDialog.selectedPost = function() {
  return Session.get('selectedPost');
};

Template.postDelConfDialog.post = function() {
  var postId = Session.get('selectedPost');

  if (postId) {
    var p = Posts.findOne(postId);
    if (p) {
      var post = {
        empId: p.empId,
        year: p.year,
        month: p.month,
        title: p.title,
        nbEvts: Events.find({postId: postId}).count()
      }
    }
  } else {
    var post = {
      empId: '',
      year: '',
      month: '',
      title: '',
      nbEvts: 0
    }
  }
  return post;
};

Template.postDelConfDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedPost', null);
    Session.set('showDialogPostDelConf', false);
  },
  'click .delete': function(evt, tmpl) {
    var e = {
      id: Session.get('selectedPost'),
      delEvts: tmpl.find('[name=delEvts]').checked
    }

    Meteor.call('postRemove', e, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('Month deleted successfully.');
        Session.set('selectedPost', null);
        Session.set('showDialogPostDelConf', false);
      }
    });
  }
});