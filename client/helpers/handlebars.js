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
  var usr = Employees.findOne(u);
  if (usr)
    return usr.fname + ' ' + usr.lname;
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

Handlebars.registerHelper('nbEmpInGroup', function(grpId) {
  return Employees.find({group: grpId}).count();
});