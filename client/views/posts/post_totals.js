Template.postTotals.helpers({
  totals: function() {
  	var sm = this.month;
  	if (sm < 10) sm = '0' + sm;
  	var em = this.month + 1;
  	if (em < 10)  em = '0' + em;

  	var start = this.year + '-' + sm + '-01';
  	var end = this.year + '-' + em + '-01';

    var e = [];
    var h = [];
    var types = EventTypes.find({active: true});
    types.forEach(function(t) {
      e[t._id] = 0;
      h[t._id] = 0.0;
    });
    e['Tot'] = 0;
    h['Tot'] = 0.0;
    h['N'] = 0.0;
    h['X100'] = 0.0;
    h['X125'] = 0.0;
    h['X150'] = 0.0;
    h['X200'] = 0.0;

  	// var e = {T: 0, C: 0, S: 0, R: 0, M: 0, Tot: 0};
  	// var h = {T: 0.0, C: 0.0, S: 0.0, R: 0.0, M: 0.0, Tot: 0.0, N: 0.0, S100: 0.0, S125: 0.0, S150: 0.0, S200: 0.0};

  	events = Events.find({postId: this._id, start: {$gte: start, $lt: end}});
  	events.forEach(function(i) {
  	  e[i.type] += 1;
  	  e['Tot'] += 1;

  	  if(e[i.type].code == 'W' || e[i.type].code == 'T') {
  	  	var cH = calcHours(i.start, i.end, i.allDay, 12, 00);
  	  	h[i.type] += cH['hrs'];
        h['N'] += cH['N'];
        h['X100'] += cH['X100'];
        h['X125'] += cH['X125'];
        h['X150'] += cH['X150'];
        h['X200'] += cH['X200'];
        h['Tot'] += cH['hrs'];
  	  } else {
  	    if(i.allDay) {
          h[i.type] += 7.5;
          h['Tot'] += 7.5;
  	    } else {
  	  	  var d = (new Date(i.end) - new Date(i.start)) / 1000 / 60 / 60;
          h[i.type] += d;
          h['Tot'] += d;
   	  	}
  	  }
  	});

  	// console.log(calcHours("2014-02-06T22:30:00.000Z","2014-02-07T02:30:00.000Z",false,17,00));

    var results = new Meteor.Collection(null);
    var types = EventTypes.find({active: true});
    types.forEach(function(t) {
      results.insert({
        code: t.code,
        txtColor: t.textColor,
        bgColor: t.backgroundColor,
        E: e[t._id],
        H: h[t._id],
        width: '30px'
      });
    });

    results.insert({
      code: 'Tot',
      txtColor: '#fff',
      bgColor: '#000',
      E: e['Tot'],
      H: h['Tot'],
      width: '40px'
    });

  	return {results: results.find()};
  }
});

function calcHours(start, end, allDay, supHH, supMM) {
  var T = 0.0;
  var N = 0.0;
  var X100 = 0.0;
  var X125 = 0.0;
  var X150 = 0.0;
  var X200 = 0.0;

  var sd = new Date(start);

  if(allDay) {
    T = 7.5;
    N = 7.5;
    if(sd.getDay() == 0 || sd.getDay() == 6) {
      X200 = N;
    }
  } else {
	var ed = new Date(end);

    T = (ed - sd) / 1000 / 60 / 60;

    if(sd.getDay() == 0 || sd.getDay() == 6) {
      X200 = T;
    } else {
	  var y = sd.getFullYear();
	  var m = sd.getMonth();
	  var d = sd.getDate();

	  var T100 = new Date(y, m, d, supHH, supMM, 0);
	  var T125 = new Date(y, m, d, 18, 0, 0);
	  var T150 = new Date(y, m, d, 21, 0, 0);

	  // console.log('sd   ' + sd);
	  // console.log('ed   ' + ed);
	  // console.log('T100 ' + T100);
	  // console.log('T125 ' + T125);
	  // console.log('T150 ' + T150);

	  if(sd < T100)
	  	N = (Math.min(ed, T100) - sd) / 1000 / 60 / 60;
	  if(sd < T125 && ed > T100)
	   	X100 = (Math.min(ed, T125) - Math.max(sd, T100)) / 1000 / 60 / 60;
	  if(sd < T150 && ed > T125)
	   	X125 = (Math.min(ed, T150) - Math.max(sd, T125)) / 1000 / 60 / 60;
	  if(ed > T150)
	    X150 = (ed - Math.max(sd, T150)) / 1000 / 60 / 60;
	}
  }

  return {hrs: T, N: N, X100: X100, X125: X125, X150: X150, X200: X200};
}