Template.postTotals.helpers({
  totals: function() {
  	var sm = this.month;
  	if (sm < 10) sm = '0' + sm;
  	var em = this.month + 1;
  	if (em < 10)  em = '0' + em;

  	var start = this.year + '-' + sm + '-01';
  	var end = this.year + '-' + em + '-01';

  	var e = {T: 0, C: 0, S: 0, R: 0, M: 0, Tot: 0};
  	var h = {T: 0.0, C: 0.0, S: 0.0, R: 0.0, M: 0.0, Tot: 0.0, N: 0.0, S100: 0.0, S125: 0.0, S150: 0.0, S200: 0.0};

  	events = Events.find({postId: this._id, start: {$gte: start, $lt: end}});
  	events.forEach(function(i) {
  	  e[i.type] += 1;
  	  e['Tot'] += 1;

  	  if(i.type == 'T') {
  	  	var cH = calcHours(i.start, i.end, i.allDay, 12, 00);
  	  	h['T'] += cH['t'];
  	  	h['N'] += cH['n'];
  	  	h['S100'] += cH['s100'];
  	  	h['S125'] += cH['s125'];
  	  	h['S150'] += cH['s150'];
  	  	h['S200'] += cH['s200'];
  	  	h['Tot'] += cH['t'];
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
  	return {evts: e, hours: h};
  }
});

function calcHours(start, end, allDay, supHH, supMM) {
  var t = 0.0;
  var n = 0.0;
  var s100 = 0.0;
  var s125 = 0.0;
  var s150 = 0.0;
  var s200 = 0.0;

  var sd = new Date(start);

  if(allDay) {
    t = 7.5;
    n = 7.5;
    if(sd.getDay() == 0 || sd.getDay() == 6) {
      s200 = h;
    }
  } else {
	var ed = new Date(end);

    t = (ed - sd) / 1000 / 60 / 60;

    if(sd.getDay() == 0 || sd.getDay() == 6) {
      s200 = t;
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
	  	n = (Math.min(ed, T100) - sd) / 1000 / 60 / 60;
	  if(sd < T125 && ed > T100)
	   	s100 = (Math.min(ed, T125) - Math.max(sd, T100)) / 1000 / 60 / 60;
	  if(sd < T150 && ed > T125)
	   	s125 = (Math.min(ed, T150) - Math.max(sd, T125)) / 1000 / 60 / 60;
	  if(ed > T150)
	    s150 = (ed - Math.max(sd, T150)) / 1000 / 60 / 60;
	}
  }

  return {t: t, n: n, s100: s100, s125: s125, s150: s150, s200: s200};
}