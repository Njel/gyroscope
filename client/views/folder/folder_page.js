Template.folderPage.helpers({
  hasAccess: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    // if (this.userId == currUser._id)
    //   return true;
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
  isAdmin: function() {
    var currUser = Meteor.user();
    if (!currUser) {
      return false;
    } else {
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
    }
  },
  currentEmployee: function() {
  	if (Session.get('currentEmpId') == 'All') {
  	  var e = {
  	  	_id: 'All'
  	  };
  	} else {
	  var e = Employees.findOne(Session.get('currentEmpId'));
  	}
  	return e;
  },
  employees: function() {
  	return Employees.find({}, {sort: {fname: 1, lname: 1}});
  },
  currentYear: function() {
  	return Session.get('currentYear');
  },
  years: function() {
  	if (Session.get('currentEmpId') == 'All') {
  	  var Y = Posts.find({},{sort: {year: -1}});
  	} else {
	  var Y = Posts.find({empId: Session.get('currentEmpId')},{sort: {year: -1}});
  	}
  	var R = [];
  	var E = {};
  	Y.forEach(function(y) {
  	  if (!E[y.year]) {
  	  	E[y.year] = true;
  	  	R.push({year: y.year});
  	  }
  	});
  	return R;
  },
  eventTypes: function() {
    return EventTypes.find({active: true}, {sort: {order: 1}});
  },
  months: function() {
  	return [
  	  {m: '01', mTxt: 'Jan'},
  	  {m: '02', mTxt: 'Feb'},
  	  {m: '03', mTxt: 'Mar'},
  	  {m: '04', mTxt: 'Apr'},
  	  {m: '05', mTxt: 'May'},
  	  {m: '06', mTxt: 'Jun'},
  	  {m: '07', mTxt: 'Jul'},
  	  {m: '08', mTxt: 'Aug'},
  	  {m: '09', mTxt: 'Sep'},
  	  {m: '10', mTxt: 'Oct'},
  	  {m: '11', mTxt: 'Nov'},
  	  {m: '12', mTxt: 'Dec'}
  	];
  },
  totals: function() {
  	var R = [];
  	var i = 1;
  	var tot = 0.0;
  	var unit = '';
  	if (Session.get('currentEmpId') == 'All') {
  	  var T = Totals.find({year: parseFloat(Session.get('currentYear')), type: this._id}, {sort: {month: 1}});
  	} else {
  	  var T = Totals.find({empId: Session.get('currentEmpId'), year: parseFloat(Session.get('currentYear')), type: this._id}, {sort: {month: 1}});
  	}
  	var E = {};
  	var V = {};
  	var U = {};
  	T.forEach(function(t) {
	  while (t.month > i) {
	  	E[i] = true;
	  	V[i] = 0;
	  	U[i] = '';
	  	// R.push({
	  	//   value: 0,
	  	//   unit: ''
	  	// });
	  	i++;
	  };
  	  if (!E[t.month]) {
  	  	E[t.month] = true;
  	  	V[t.month] = t.value;
  	  	U[t.month] = t.unit;
		// R.push({
		//   value: t.value,
		//   unit: t.unit
		// });
  	  } else {
  	  	V[t.month] = V[t.month] + t.value;
  	  }
	  tot += t.value;
	  unit = t.unit;
	  i++;
  	});
  	while (i < 13) {
  	  E[i] = true;
  	  V[i] = 0;
  	  U[i] = '';
      // R.push({
  	  //   value: 0,
  	  //   unit: ''
  	  // });
  	  i++;
    };
    for (var i = 1; i < 13; i++) {
    	R.push({
    	  value: V[i],
    	  unit: U[i]
    	});
    };
    R.push({
      value: tot,
      unit: unit
    });
    return R;
  }
});

Template.folderPage.rendered = function() {
  Deps.autorun(function() {
  	drawChart();
  });
};

Template.folderPage.events({
  'click .eventTypeChk': function(evt, tmpl) {
    // console.log(evt.toElement.id);
    // evt.preventDefault();
    // console.log(evt.toElement.id + ' - ' + evt.toElement.checked);
    // console.log(evt.toElement.id.substring(9,10));
    // ETChart = Session.get('ETChart');
    // ETChart[evt.toElement.id.substring(9,10)] = evt.toElement.checked;
    // Session.set('ETChart', ETChart);
    drawChart();
  },
  'change .empIdCb': function(evt, tmpl) {
    // console.log(tmpl.find('[name=yearCb]').value);
    Session.set('currentEmpId', tmpl.find('[name=empIdCb]').value);
    drawChart();
  },
  'change .yearCb': function(evt, tmpl) {
    // console.log(tmpl.find('[name=yearCb]').value);
    Session.set('currentYear', tmpl.find('[name=yearCb]').value);
    drawChart();
  }
});

function drawChart(){
 //  var ETChart = Session.get('ETChart');
 //  if (!ETChart) {
 //    var ETChart = new Array();
 //  	ETChart['W'] = true;
 //  	ETChart['A'] = true;
 //  	ETChart['X'] = true;
 //  	ETChart['R'] = true;
 //  	ETChart['S'] = true;
	// Session.set('ETChart', ETChart);
 //  }

  var data = {
    // labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
	  // {
	  //   // fillColor: "rgba(220,220,220,0.5)",
	  //   strokeColor: "rgba(220,220,220,1)",
	  //   fillColor: A.backgroundColor,
	  //   strokeColor: A.borderColor,
	  //   // data: [65, 59, 90, 81, 56, 55, 40, 0, 0, 0, 0, 0]
	  //   data: D1
	  // },
	  // {
	  //   fillColor: "rgba(151,187,205,0.5)",
	  //   strokeColor: "rgba(151,187,205,1)",
	  //   data: [28, 48, 40, 19, 96, 27, 100, 0, 0, 0, 0, 0]
	  // }
    ]
  }

  var empId = Session.get('currentEmpId');
  var year = parseFloat(Session.get('currentYear'));
  // var year = $('#yearCb').val();
  // console.log($('#yearCb').val());
  var ET = EventTypes.find({active: true});
  var e = 0;
  var max = 0;

  if (ET) {
  	ET.forEach(function(et) {
  	  var chk = $('#eventType' + et.code).get(0);
  	  // console.log(chk.checked);
  	  if (chk && chk.checked) {
	  	  var D1 = [];
	  	  var i = 1;
	  	  if (Session.get('currentEmpId') == 'All') {
	  	  	var D = Totals.find({year: year, type: et._id}, {sort: {month: 1}});
	  	  } else {
	  	  	var D = Totals.find({empId: empId, year: year, type: et._id}, {sort: {month: 1}});
	  	  }
		  var E = {};
		  var V = {};
		  D.forEach(function(v) {
		  	while (v.month > i) {
		  	  E[i] = true;
	  	  	  V[i] = 0;
		  	  // D1.push(0);
		  	  i++;
		  	};
	  	    if (!E[v.month]) {
	  	  	  E[v.month] = true;
	  	  	  V[v.month] = v.value;
	  	  	} else {
	  	  	  V[v.month] = V[v.month] + v.value;
	  	  	}
	  	    // D1.push(v.value);
	  	    i++;
		  });

	      for (var j = 1; j < i; j++) {
	      	if (V[j] > max) max = V[j];
	    	D1.push(V[j]);
	      };

		  data.datasets.push({
		    fillColor: et.backgroundColor,
		    strokeColor: et.borderColor,
		    data: D1
	  	  });
	  }
	  e++;
  	});

	var obj = $("#dataChart").get(0)
	// console.log(obj);
	var m = 5;
	while (m * 10 < max) m += 5;
	if (obj) {
	  var ctx = obj.getContext("2d");
	  var c = new Chart(ctx).Bar(data, {
		//Boolean - If we show the scale above the chart data			
		scaleOverlay : false,
		
		//Boolean - If we want to override with a hard coded scale
		scaleOverride : true,
		
		//** Required if scaleOverride is true **
		//Number - The number of steps in a hard coded scale
		scaleSteps : 10,
		//Number - The value jump in the hard coded scale
		scaleStepWidth : m,
		//Number - The scale starting value
		scaleStartValue : 0,

		//String - Colour of the scale line	
		scaleLineColor : "rgba(0,0,0,.1)",
		
		//Number - Pixel width of the scale line	
		scaleLineWidth : 1,

		//Boolean - Whether to show labels on the scale	
		scaleShowLabels : true,
		
		//Interpolated JS string - can access value
		scaleLabel : "<%=value%>",
		
		//String - Scale label font declaration for the scale label
		scaleFontFamily : "'Arial'",
		
		//Number - Scale label font size in pixels	
		scaleFontSize : 10,
		
		//String - Scale label font weight style	
		scaleFontStyle : "bold",
		
		//String - Scale label font colour	
		scaleFontColor : "#666",	
		
		///Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,
		
		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",
		
		//Number - Width of the grid lines
		scaleGridLineWidth : 1,	

		//Boolean - If there is a stroke on each bar	
		barShowStroke : true,
		
		//Number - Pixel width of the bar stroke	
		barStrokeWidth : 2,
		
		//Number - Spacing between each of the X value sets
		barValueSpacing : 5,
		
		//Number - Spacing between data sets within X values
		barDatasetSpacing : 1,
		
		//Boolean - Whether to animate the chart
		animation : true,

		//Number - Number of animation steps
		animationSteps : 60,
		
		//String - Animation easing effect
		animationEasing : "easeOutQuart",

		//Function - Fires when the animation is complete
		onAnimationComplete : null
	  });
	}
  }
}