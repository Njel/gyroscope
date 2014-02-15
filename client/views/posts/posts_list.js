Template.newPosts.helpers({
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
    // return Posts.find({}, {sort: {submitted: -1}});
    return Posts.find({}, {sort: this.sort, limit: this.handle.limit()});
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