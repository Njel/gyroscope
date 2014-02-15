Template.scheduleTotals.helpers({
  totals: function() {
  	var p = 0;
  	var h = 0;

  	periods = Periods.find({schId: this._id});
  	periods.forEach(function(i) {
  	  p += 1;
      h += i.hours;
      // var sD = new Date('2010-01-0' + (3 + i.day).toString() + 'T' + i.start + ':00.000Z');
      // var eD = new Date('2010-01-0' + (3 + i.day).toString() + 'T' + i.end + ':00.000Z');
      // if (eD < sD) 
      //   h += ((moment(eD).add('d', 1) - moment(sD)) / 1000 / 60 / 60);
      // else
      //   h += ((eD - sD) / 1000 / 60 / 60);
  	});

  	return {periods: p, hours: h};
  }
});