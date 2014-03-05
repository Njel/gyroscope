Template.folderPage.helpers({
  currentEmployee: function() {
  	var e = Employees.findOne(Session.get('currentEmpId'));
  	return e;
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
  	var T = Totals.find({empId: Session.get('currentEmpId'), type: this._id}, {sort: {month: 1}});
  	T.forEach(function(t) {
	  while (t.month > i) {
	  	R.push({
	  	  value: 0,
	  	  unit: ''
	  	});
	  	i++;
	  };
	  R.push({
	  	value: t.value,
	  	unit: t.unit
	  });
	  tot += t.value;
	  unit = t.unit;
	  i++;
  	});
  	while (i < 13) {
	  R.push({
  	    value: 0,
  	    unit: ''
  	  });
  	  i++;
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
  var ET = EventTypes.find({active: true});
  var e = 0;

  if (ET) {
  	ET.forEach(function(et) {
  	  var chk = $('#eventType' + et.code).get(0);
  	  // console.log(chk.checked);
  	  if (chk && chk.checked) {
	  	  var D1 = [];
	  	  var i = 1;
		  var D = Totals.find({empId: empId, year: 2014, type: et._id}, {sort: {month: 1}});
		  D.forEach(function(v) {
		  	while (v.month > i) {
		  	  D1.push(0);
		  	  i++;
		  	};
	  	    D1.push(v.value);
	  	    i++;
		  });

		  data.datasets.push({
		    fillColor: et.backgroundColor,
		    strokeColor: et.borderColor,
		    data: D1
	  	  });
	  }
	  e++;
  	});

	var obj = $("#dataChart").get(0)
	if (obj) {
	  var ctx = obj.getContext("2d");
	  var c = new Chart(ctx).Bar(data, {
		//Boolean - If we show the scale above the chart data			
		scaleOverlay : false,
		
		//Boolean - If we want to override with a hard coded scale
		scaleOverride : false,
		
		//** Required if scaleOverride is true **
		//Number - The number of steps in a hard coded scale
		scaleSteps : null,
		//Number - The value jump in the hard coded scale
		scaleStepWidth : null,
		//Number - The scale starting value
		scaleStartValue : null,

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
		scaleFontSize : 12,
		
		//String - Scale label font weight style	
		scaleFontStyle : "normal",
		
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