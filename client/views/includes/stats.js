Template.stats.helpers({
  stats: function() {
  	var types = EventTypes.find({active: true, parent: null}, {sort: {order: 1}});
  	var stats = [];
  	var tot = 0.0;
  	var postId = this._id;
  	types.forEach(function(et) {
  	  var t = Totals.findOne({postId: postId, type: et._id});
  	  if (t) {
  	  	stats.push({
  	  	  code: et.code,
	  	  value: t.value,
	  	  unit: t.unit,
	  	  textColor: et.textColor,
	  	  backColor: et.backgroundColor,
	  	  width: (t.value) + 'px',
	  	  title: t.value + ' ' + t.unit + ' - ' + et.title + ' (' + et.code + ')',
	  	  text: (t.value < 10 ? '' : t.value)
	    });
	    tot = tot + t.value;
  	  }
  	});
	return {tots: stats, tot: tot};

	// // var tots = Totals.find({year: this.year, month: this.month, empId: this.empId});
	// var tots = Totals.find({postId: this._id});
	// if (tots) {
	//   var stats = [];
	//   var tot = 0.0;
	//   tots.forEach(function(t) {
	//     var et = EventTypes.findOne(t.type);
	//     stats.push({
	//       code: et.code,
	//   	 value: t.value,
	//   	 unit: t.unit,
	//   	 textColor: et.textColor,
	//   	 backColor: et.backgroundColor,
	//   	 width: (t.value) + 'px',
	//   	 title: t.value + ' ' + t.unit + ' - ' + et.title + ' (' + et.code + ')',
	//   	 text: (t.value < 10 ? '' : t.value)
	//     });
	//     tot = tot + t.value;
	//   });
	//   return {tots: stats, tot: tot};
	// } else {
	//   return null;
	// }
  },
  notZero: function(v) {
  	return (v > 0.0);
  }
});