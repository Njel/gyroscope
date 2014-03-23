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
  	  var e = {_id: 'All'};
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
  balances: function() {
    if (Session.get('currentEmpId') == 'All') {
      return {AL: '-', SL: '-', X: '-'};
    } else {
      var b = Balances.findOne({empId: Session.get('currentEmpId'), year: parseInt(Session.get('currentYear'))});
      return {
        AL: b.AL,
        SL: b.SL,
        X: b.X
      };
    }
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
    // return EventTypes.find({active: true, parent: null}, {sort: {order: 1}});
    return EventTypes.find({active: true}, {sort: {order: 1}});
  },
  months: function() {
    var M = [];
    var y = parseInt(Session.get('currentYear'));
    var e = Session.get('currentEmpId');
    if (e == 'All') {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        M.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          posted: true
        });
      }
    } else {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var t = Totals.findOne({empId: e, year: y, month: m});
        // console.log(e + ', ' + y + ', ' + m + ', ' + ' -> ' + p);
        if (t) {
          M.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            posted: true
          });
        } else {
          M.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            posted: false
          });
        }
      };
    }
  	return M;
  },
  totals: function() {
  	var R = [];
  	var i = 1;
  	var tot = 0.0;
  	var unit = '';
  	if (Session.get('currentEmpId') == 'All') {
  	  var T = Totals.find({year: parseInt(Session.get('currentYear')), type: this._id}, {sort: {month: 1}});
  	} else {
  	  var T = Totals.find({empId: Session.get('currentEmpId'), year: parseInt(Session.get('currentYear')), type: this._id}, {sort: {month: 1}});
  	}
  	var E = {};
  	var V = {};
  	var U = {};
  	T.forEach(function(t) {
	  while (t.month > i) {
	  	E[i] = true;
	  	V[i] = '-';
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
  	  V[i] = '-';
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
    	  unit: U[i],
        tot: false
    	});
    };
    R.push({
      value: tot,
      unit: unit,
      tot: true
    });
    return R;
  },
  etTotals: function() {
    var R = [];
    var Total = 0.0;
    var y = parseInt(Session.get('currentYear'));
    var e = Session.get('currentEmpId');
    if (e == 'All') {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var T = Totals.find({year: y, month: m, type: this._id});
        if (T.count() > 0) {
          var tot = 0.0;
          var unit = '';
          T.forEach(function(t) {
            tot = tot + t.value;
            unit = t.unit;
          });
          R.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            tot: tot,
            unit: unit,
            posted: true
          });
          Total = Total + tot;
        } else {
          R.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            tot: '-',
            unit: '',
            posted: false
          });
        }
      }
    } else {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var T = Totals.find({empId: e, year: y, month: m, type: this._id});
        if (T.count() > 0) {
          var tot = 0.0;
          var unit = '';
          T.forEach(function(t) {
            tot = tot + t.value;
            unit = t.unit;
          });
          R.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            tot: tot,
            unit: unit,
            posted: true
          });
          Total = Total + tot;
        } else {
          R.push({
            m: moment(d).format("MM"),
            mTxt: moment(d).format("MMM"),
            tot: '-',
            unit: '',
            posted: false
          });
        }
      };
    }
    R.push({
      m: null,
      mTxt: 'Total',
      tot: Total,
      unit: 'h',
      posted: true
    });

    return R;
  },
  mTotals: function() {
    return calcMTotals();
    // var R = [];
    // var i = 1;
    // var unit = '';
    // var y = parseFloat(Session.get('currentYear'));
    // var e = Session.get('currentEmpId');
    // if (e == 'All') {
    //   for (var m = 1; m <= 12; m++) {
    //     var d = new Date(y, m - 1, 1);
    //     var T = Totals.find({year: y, month: m});
    //     var tot = 0.0;
    //     var posted = false;
    //     T.forEach(function(t) {
    //       if (t.code.substring(0, 1) != 'X') 
    //         tot = tot + t.value;
    //       posted = true;
    //     });
    //     R.push({
    //       m: moment(d).format("MM"),
    //       mTxt: moment(d).format("MMM"),
    //       tot: tot,
    //       unit: 'h',
    //       posted: posted
    //     });
    //   }
    // } else {
    //   for (var m = 1; m <= 12; m++) {
    //     var d = new Date(y, m - 1, 1);
    //     var T = Totals.find({empId: e, year: y, month: m});
    //     var tot = 0.0;
    //     var posted = false;
    //     T.forEach(function(t) {
    //       if (t.code.substring(0, 1) != 'X') 
    //         tot = tot + t.value;
    //       posted = true;
    //     });
    //     R.push({
    //       m: moment(d).format("MM"),
    //       mTxt: moment(d).format("MMM"),
    //       tot: tot,
    //       unit: 'h',
    //       posted: posted
    //     });
    //   };
    // }
    // return R;
  },
  XTotals: function() {
    return calcXTotals();
    // var R = [];
    // var i = 1;
    // var unit = '';
    // var y = parseFloat(Session.get('currentYear'));
    // var e = Session.get('currentEmpId');
    // var XId = EventTypes.findOne({code: 'X'})._id;
    // if (e == 'All') {
    //   for (var m = 1; m <= 12; m++) {
    //     var d = new Date(y, m - 1, 1);
    //     var T = Totals.find({year: y, month: m, type: XId});
    //     var tot = 0.0;
    //     var posted = false;
    //     T.forEach(function(t) {
    //       tot = tot + t.cValue;
    //       posted = true;
    //     });
    //     R.push({
    //       m: moment(d).format("MM"),
    //       mTxt: moment(d).format("MMM"),
    //       tot: tot,
    //       unit: 'h',
    //       posted: posted
    //     });
    //   }
    // } else {
    //   for (var m = 1; m <= 12; m++) {
    //     var d = new Date(y, m - 1, 1);
    //     var T = Totals.find({empId: e, year: y, month: m, type: XId});
    //     var tot = 0.0;
    //     var posted = false;
    //     T.forEach(function(t) {
    //       tot = tot + t.cValue;
    //       posted = true;
    //     });
    //     R.push({
    //       m: moment(d).format("MM"),
    //       mTxt: moment(d).format("MMM"),
    //       tot: tot,
    //       unit: 'h',
    //       posted: posted
    //     });
    //   };
    // }
    // return R;
  },XBalances: function() {
    return calcExtraBal();
    // var R = [];
    // var i = 1;
    // var unit = '';
    // var y = parseFloat(Session.get('currentYear'));
    // var e = Session.get('currentEmpId');
    // var XId = EventTypes.findOne({code: 'X'})._id;
    // var RId = EventTypes.findOne({code: 'R'})._id;
    // var prevBal = 0.0;
    // if (e == 'All') {
    //   for (var m = 1; m <= 12; m++) {
    //     var d = new Date(y, m - 1, 1);
    //     var XT = Totals.find({year: y, month: m, type: XId});
    //     var RT = Totals.find({year: y, month: m, type: RId});
    //     var XTot = 0.0;
    //     var RTot = 0.0;
    //     var posted = false;
    //     XT.forEach(function(t) {
    //       XTot = XTot + t.cValue;
    //       posted = true;
    //     });
    //     RT.forEach(function(t) {
    //       RTot = RTot + t.cValue;
    //       posted = true;
    //     });
    //     var bal = prevBal + XTot - RTot
    //     R.push({
    //       m: moment(d).format("MM"),
    //       mTxt: moment(d).format("MMM"),
    //       tot: bal,
    //       unit: 'h',
    //       posted: posted
    //     });
    //     prevBal = bal;
    //   }
    // } else {
    //   for (var m = 1; m <= 12; m++) {
    //     var d = new Date(y, m - 1, 1);
    //     var XT = Totals.find({empId: e, year: y, month: m, type: XId});
    //     var RT = Totals.find({empId: e, year: y, month: m, type: RId});
    //     var XTot = 0.0;
    //     var RTot = 0.0;
    //     var posted = false;
    //     XT.forEach(function(t) {
    //       XTot = XTot + t.cValue;
    //       posted = true;
    //     });
    //     RT.forEach(function(t) {
    //       RTot = RTot + t.cValue;
    //       posted = true;
    //     });
    //     var bal = prevBal + XTot - RTot
    //     R.push({
    //       m: moment(d).format("MM"),
    //       mTxt: moment(d).format("MMM"),
    //       tot: bal,
    //       unit: 'h',
    //       posted: posted
    //     });
    //     prevBal = bal;
    //   };
    // }
    // return R;
  },
  ALEventType: function() {
    return EventTypes.findOne({code: 'A'});
  },
  ALBalances: function() {
    return calcALBal();
  },
  SLEventType: function() {
    return EventTypes.findOne({code: 'S'});
  },
  SLBalances: function() {
    return calcSLBal();
  },
  hasSubTypes: function(et) {
    var n = EventTypes.find({parent: et}).count();
    if (n > 0) return true;
    return false;
  },
  isSubType: function(et) {
    return (et.parent ? true : false);
  },
  isExpand: function(et) {
    if (!et.parent) return true;
    var parent = EventTypes.findOne(et.parent);
    var lnk = $('#lnk' + parent.code).get(0);
    if (lnk && lnk.text == '+') return false;
    return true;
  }
});

Template.folderPage.rendered = function() {
  Deps.autorun(function() {
  	drawChart();
  });
};

Template.folderPage.events({
  'click .lnkBtn': function(evt, tmpl) {
    evt.preventDefault();
    // console.log(evt.toElement.name);
    if (evt.toElement.text == '+') {
      $('#' + evt.toElement.name).text('-');
      $('.' + evt.toElement.name).show();
    } else {
      $('#' + evt.toElement.name).text('+');
      $('.' + evt.toElement.name).hide();
    }
  },
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

function calcMTotals() {
  var R = [];
  var i = 1;
  var unit = '';
  var y = parseInt(Session.get('currentYear'));
  var e = Session.get('currentEmpId');
  if (e == 'All') {
    for (var m = 1; m <= 12; m++) {
      var d = new Date(y, m - 1, 1);
      var T = Totals.find({year: y, month: m});
      var tot = 0.0;
      var posted = false;
      T.forEach(function(t) {
        if (t.code.substring(0, 1) != 'X') 
          tot = tot + t.value;
        posted = true;
      });
      R.push({
        m: moment(d).format("MM"),
        mTxt: moment(d).format("MMM"),
        tot: tot,
        unit: 'h',
        posted: posted
      });
    }
  } else {
    for (var m = 1; m <= 12; m++) {
      var d = new Date(y, m - 1, 1);
      var T = Totals.find({empId: e, year: y, month: m});
      var tot = 0.0;
      var posted = false;
      T.forEach(function(t) {
        if (t.code.substring(0, 1) != 'X') 
          tot = tot + t.value;
        posted = true;
      });
      R.push({
        m: moment(d).format("MM"),
        mTxt: moment(d).format("MMM"),
        tot: tot,
        unit: 'h',
        posted: posted
      });
    };
  }
  return R;
}

function calcXTotals() {
  var R = [];
  var i = 1;
  var unit = '';
  var y = parseInt(Session.get('currentYear'));
  var e = Session.get('currentEmpId');
  var X = EventTypes.findOne({code: 'X'});
  if (X) {
    var XId = X._id;
    if (e == 'All') {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var T = Totals.find({year: y, month: m, type: XId});
        var tot = 0.0;
        var posted = false;
        T.forEach(function(t) {
          tot = tot + t.cValue;
          posted = true;
        });
        R.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: tot,
          unit: 'h',
          posted: posted
        });
      }
    } else {
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var T = Totals.find({empId: e, year: y, month: m, type: XId});
        var tot = 0.0;
        var posted = false;
        T.forEach(function(t) {
          tot = tot + t.cValue;
          posted = true;
        });
        R.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: tot,
          unit: 'h',
          posted: posted
        });
      };
    }
  }
  return R;
}

function calcExtraBal() {
  var B = [];
  var i = 1;
  var unit = '';
  var y = parseInt(Session.get('currentYear'));
  var e = Session.get('currentEmpId');
  var X = EventTypes.findOne({code: 'X'});
  var R = EventTypes.findOne({code: 'R'});
  if (X && R) {
    var XId = X._id;
    var RId = R._id;
    if (e == 'All') {
      var prevBal = 0.0;
      var b = Balances.find({year: y});
      b.forEach(function(r) {
        prevBal = prevBal + r.X;
      });
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var XT = Totals.find({year: y, month: m, type: XId});
        var RT = Totals.find({year: y, month: m, type: RId});
        var XTot = 0.0;
        var RTot = 0.0;
        var posted = false;
        XT.forEach(function(t) {
          XTot = XTot + t.cValue;
          posted = true;
        });
        RT.forEach(function(t) {
          RTot = RTot + t.cValue;
          posted = true;
        });
        var bal = prevBal + XTot - RTot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      }
    } else {
      var prevBal = 0.0;
      var b = Balances.findOne({year: y, empId: e});
      if (b)
        prevBal = b.X;
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var XT = Totals.find({empId: e, year: y, month: m, type: XId});
        var RT = Totals.find({empId: e, year: y, month: m, type: RId});
        var XTot = 0.0;
        var RTot = 0.0;
        var posted = false;
        XT.forEach(function(t) {
          XTot = XTot + t.cValue;
          posted = true;
        });
        RT.forEach(function(t) {
          RTot = RTot + t.cValue;
          posted = true;
        });
        var bal = prevBal + XTot - RTot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      };
    }
  }
  return B;
}

function calcALBal() {
  var B = [];
  var i = 1;
  var unit = '';
  var y = parseInt(Session.get('currentYear'));
  var e = Session.get('currentEmpId');
  var A = EventTypes.findOne({code: 'A'});
  if (A) {
    var AId = A._id;
    if (e == 'All') {
      var prevBal = 0.0;
      var b = Balances.find({year: y});
      b.forEach(function(r) {
        prevBal = prevBal + r.AL;
      });
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var AT = Totals.find({year: y, month: m, type: AId});
        var ATot = 0.0;
        var posted = false;
        AT.forEach(function(t) {
          ATot = ATot + t.cValue;
          posted = true;
        });
        var bal = prevBal - ATot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      }
    } else {
      var prevBal = 0.0;
      var b = Balances.findOne({year: y, empId: e});
      if (b)
        prevBal = b.AL;
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var AT = Totals.find({empId: e, year: y, month: m, type: AId});
        var ATot = 0.0;
        var posted = false;
        AT.forEach(function(t) {
          ATot = ATot + t.cValue;
          posted = true;
        });
        var bal = prevBal - ATot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      };
    }
  }
  return B;
}

function calcSLBal() {
  var B = [];
  var i = 1;
  var unit = '';
  var y = parseInt(Session.get('currentYear'));
  var e = Session.get('currentEmpId');
  var S = EventTypes.findOne({code: 'S'});
  if (S) {
    var SId = S._id;
    if (e == 'All') {
      var prevBal = 0.0;
      var b = Balances.find({year: y});
      b.forEach(function(r) {
        prevBal = prevBal + r.AL;
      });
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var ST = Totals.find({year: y, month: m, type: SId});
        var STot = 0.0;
        var posted = false;
        ST.forEach(function(t) {
          STot = STot + t.cValue;
          posted = true;
        });
        var bal = prevBal - STot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      }
    } else {
      var prevBal = 0.0;
      var b = Balances.findOne({year: y, empId: e});
      if (b)
        prevBal = b.SL;
      for (var m = 1; m <= 12; m++) {
        var d = new Date(y, m - 1, 1);
        var ST = Totals.find({empId: e, year: y, month: m, type: SId});
        var STot = 0.0;
        var posted = false;
        ST.forEach(function(t) {
          STot = STot + t.cValue;
          posted = true;
        });
        var bal = prevBal - STot;
        B.push({
          m: moment(d).format("MM"),
          mTxt: moment(d).format("MMM"),
          tot: bal,
          unit: 'h',
          posted: posted
        });
        prevBal = bal;
      };
    }
  }
  return B;
}

function drawChart() {
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
  var year = parseInt(Session.get('currentYear'));
  // var year = $('#yearCb').val();
  // console.log($('#yearCb').val());
  var ET = EventTypes.find({active: true, parent: null});
  var e = 0;
  var max = 0;
  var min = 0;

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
        if (V[j] < min) min = V[j];
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

    var chk = $('#totalsChk').get(0);
    if (chk && chk.checked) {
      var D = [];
      var R = calcMTotals();
      R.forEach(function(r) {
        if (r.posted) {
          if (r.tot > max) max = r.tot;
          D.push(r.tot);
        }
      });
      data.datasets.push({
        fillColor: '#ddd',
        strokeColor: '#000',
        data: D
      });
    }

    var chk = $('#extraTotChk').get(0);
    if (chk && chk.checked) {
      var D = [];
      var R = calcXTotals();
      R.forEach(function(r) {
        if (r.posted) {
          if (r.tot > max) max = r.tot;
          if (r.tot < min) min = r.tot;
          D.push(r.tot);
        }
      });
      data.datasets.push({
        fillColor: '#555',
        strokeColor: '#555',
        data: D
      });
    }

    var chk = $('#extraBalChk').get(0);
    if (chk && chk.checked) {
      var D = [];
      var R = calcExtraBal();
      R.forEach(function(r) {
        if (r.posted) {
          if (r.tot > max) max = r.tot;
          if (r.tot < min) min = r.tot;
          D.push(r.tot);
        }
      });
      data.datasets.push({
        fillColor: '#333',
        strokeColor: '#333',
        data: D
      });
    }

    var chk = $('#ALBalChk').get(0);
    if (chk && chk.checked) {
      var D = [];
      var R = calcALBal();
      R.forEach(function(r) {
        if (r.posted) {
          if (r.tot > max) max = r.tot;
          if (r.tot < min) min = r.tot;
          D.push(r.tot);
        }
      });
      var ET = EventTypes.findOne({code: 'A'});
      if (ET) {
        var fillColor = ET.backgroundColor;
        var strokeColor = ET.borderColor;
      } else {
        var fillColor = '#005000'; //#5CC65E';
        var strokeColor = '#000';
      }
      data.datasets.push({
        fillColor: fillColor,
        strokeColor: strokeColor,
        data: D
      });
    }

    var chk = $('#SLBalChk').get(0);
    if (chk && chk.checked) {
      var D = [];
      var R = calcSLBal();
      R.forEach(function(r) {
        if (r.posted) {
          if (r.tot > max) max = r.tot;
          if (r.tot < min) min = r.tot;
          D.push(r.tot);
        }
      });
      var ET = EventTypes.findOne({code: 'S'});
      if (ET) {
        var fillColor = ET.backgroundColor;
        var strokeColor = ET.borderColor;
      } else {
        var fillColor = '#500000'; //#b00';
        var strokeColor = '#000';
      }
      data.datasets.push({
        fillColor: fillColor,
        strokeColor: strokeColor,
        data: D
      });
    }

  	var obj = $("#dataChart").get(0)
  	// console.log(obj);
  	var m = 5;
  	// while (m * 10 < (max - min)) m += 5;
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