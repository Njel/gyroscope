Handlebars.registerHelper('pluralize', function(n, thing) {
  // fairly stupid pluralizer
  if (n === 1) {
    return '1 ' + thing;
  } else {
    return n + ' ' + thing + 's';
  }
});

Handlebars.registerHelper('userName', function(u) {
  var usr = Meteor.users.findOne(u);
  if (usr)
    return usr.username;
  else
    return '<System Account>';
});

Handlebars.registerHelper('empFullName', function(u) {
  var e = Employees.findOne(u);
  if (e)
    return e.fname + ' ' + e.lname;
  else
    return '<Unknown>';
});

Handlebars.registerHelper('currEmpFullName', function() {
  var e = Employees.findOne({userId: Meteor.userId()});
  if (e)
    return e.fname + ' ' + e.lname;
  else
    return '<Unknown>';
});

Handlebars.registerHelper('selectedValue', function(i, d) {
  // console.log("'" + i + "' === '" + d + "'?");
  if (i === d)
    return " selected='selected'";
  else
    return "";
});

Handlebars.registerHelper('daysInMonth', function(year, month) {
  return new Date(year, month, 0).getDate();
});

Handlebars.registerHelper('monthText', function(m) {
  var months = ['January', 'February', 'March',	'April', 'May',	'June',
  		  		    'July', 'August',	'September', 'October',	'November',	'December'];
  return months[m - 1];
});

Handlebars.registerHelper('dateTimeFormat', function(d) {
  return moment(d).format(Settings.findOne({name: 'DateTimeFormat'}).value); 
  // return moment(d).format('MM/DD/YYYY HH:mm'); 
  // return moment(new Date(d)).format('MM/DD/YYYY'); 
});

Handlebars.registerHelper('dateFormat', function(d) {
	// return moment(d._d).format('MM/DD/YYYY'); 
  return moment(new Date(d)).format('MM/DD/YYYY'); 
  // return moment(new Date(d)).format('MM/DD/YYYY'); 
});

Handlebars.registerHelper('timeFormat', function(d) {
	// return moment(d._d).format('HH:mm');
  return moment(new Date(d)).format('HH:mm');
  // return moment(new Date(d)).format('HH:mm');
});

Handlebars.registerHelper('calcHours', function(start, end) {
  return 'OK';
});

Handlebars.registerHelper('groupName', function(grpId) {
  var g = Groups.findOne(grpId);
  if (g)
    return g.name;
  else
    return '-';
});

Handlebars.registerHelper('roleName', function(roleId) {
  var r = Roles.findOne(roleId);
  if (r)
    return r.name;
  else
    return '-';
});

Handlebars.registerHelper('nbEmpInGroup', function(grpId) {
  return Employees.find({group: grpId}).count();
});





Handlebars.registerHelper('getSetting', function(setting, defaultArgument){
  return getSetting(setting, defaultArgument);
});
Handlebars.registerHelper('canView', function() {
  return canView(Meteor.user());
});
Handlebars.registerHelper('canPost', function() {
  return canPost(Meteor.user());
});
Handlebars.registerHelper('canComment', function() {
  return canComment(Meteor.user());
});
Handlebars.registerHelper('canUpvote', function(collection) {
  return canUpvote(Meteor.user(), collection);
});
Handlebars.registerHelper('canDownvote', function(collection) {
  return canDownvote(Meteor.user(), collection);
});
Handlebars.registerHelper('isAdmin', function(showError) {
  if(isAdmin(Meteor.user())){
    return true;
  }else{
    if((typeof showError === "string") && (showError === "true"))
      throwError(i18n.t('Sorry, you do not have access to this page'));
    return false;
  }
});
Handlebars.registerHelper('canEdit', function(collectionName, item, action) {
  var action = (typeof action !== 'string') ? null : action;
  var collection = (typeof collectionName !== 'string') ? Posts : eval(collectionName);
  console.log(item);
  // var itemId = (collectionName==="Posts") ? Session.get('selectedPostId') : Session.get('selectedCommentId');
  // var item=collection.findOne(itemId);
  return item && canEdit(Meteor.user(), item, action);
});