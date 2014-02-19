Template.header.helpers({
  activeRouteClass: function(/* route names */) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();

	// console.log(location.pathname);
	if (location.pathname === '/') {
	  var active = _.any(args, function(name) {
      	return location.pathname === Meteor.Router[name + 'Path']();
      });
    } else {
  	  var active = _.any(args, function(name) {
      	if (Meteor.Router[name + 'Path']().length > 1)
      	  return location.pathname.substring(0, Meteor.Router[name + 'Path']().length) === Meteor.Router[name + 'Path']();
      	return false;
      });
    }

    return active && 'active';
  }
});