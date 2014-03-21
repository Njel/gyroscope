Template.groupDialog.selectedGroup = function() {
  return Session.get('selectedGroup');
};

Template.groupDialog.grp = function() {
  var grpId = Session.get('selectedGroup');

  if (grpId) {
    var g = Groups.findOne(grpId);
    if (g) {
      var grp = {
        name: g.name,
        createdBy: g.createdBy,
        created: new Date(g.created),
        modifiedBy: g.modifiedBy,
        modified: new Date(g.modified)
      }
    }
  } else {
    var grp = {
      name: ''
    }
  }
  return grp;
};

Template.groupDialog.employees = function() {
  var grpId = Session.get('selectedGroup');
  var el = Employees.find();
  var employees = [];

  el.forEach(function(e) {
    var emp = EmpGrp.findOne({empId: e._id, grpId: grpId});
    if (!emp) {
      employees.push({
        _id: e._id,
        fname: e.fname,
        lname: e.lname
      });
    }
  });
  return employees;
};

Template.groupDialog.selectedEmployees = function() {
  var grpId = Session.get('selectedGroup');
  var se = EmpGrp.find({grpId: grpId});
  var selectedEmployees = [];

  se.forEach(function(e) {
    var emp = Employees.findOne(e.empId);
    if (emp) {
      selectedEmployees.push({
        _id: emp._id,
        fname: emp.fname,
        lname: emp.lname
      });
    }
  });
  return selectedEmployees;
};

Template.groupDialog.rendered = function() {
  $(function() {
    $( "#sortable1, #sortable2" ).sortable({
      connectWith: ".connectedSortable",
      dropOnEmpty: true
    }).disableSelection();
  });
};

Template.groupDialog.events({
  'click .addAllEmp': function(evt, tmpl) {
  },
  'click .rmvAllEmp': function(evt, tmpl) {
  },
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedGroup', null);
    Session.set('showDialogGroup', false);
  },
  'click .closeBtn': function(evt, tmpl) {
    var e = tmpl.find('[name=name]').value
    Session.set('selectedGroup', null);
    Session.set('showDialogGroup', false);
  },
  'click .add': function(evt, tmpl) {
    var se = tmpl.find('[name=selectedEmployees]').getElementsByTagName("li");

    var g = {
      name: tmpl.find('[name=name]').value,
      nbEmp: se.length
    };
    
    // console.log(g);

    Meteor.call('groupNew', g, function(error, grpId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        // console.log(grpId);
        for (var i = 0; i < se.length; i++) {
          EmpGrp.insert({empId: se[i].id, grpId: grpId})
        }

        throwMessage('New group created successfully.');
        Session.set('selectedGroup', null);
        Session.set('showDialogGroup', false);
      }
    });
  },
  'click .save': function(evt, tmpl) {
    var employees = [];
    var selectedEmployees = [];

    var el = tmpl.find('[name=employees]').getElementsByTagName("li");
    for (var i = 0; i < el.length; i++) {
      employees.push({empId: el[i].id});
    }

    var se = tmpl.find('[name=selectedEmployees]').getElementsByTagName("li");
    for (var i = 0; i < se.length; i++) {
      selectedEmployees.push({empId: se[i].id});
    }

    var grpId = Session.get('selectedGroup');
    var empInGrp = EmpGrp.find({grpId: grpId});
    // console.log('Before: ' + empInGrp.count());

    employees.forEach(function(e) {
      var r = EmpGrp.findOne({empId: e.empId, grpId: grpId});
      if (r)
        EmpGrp.remove(r._id);
    });

    selectedEmployees.forEach(function(e) {
      var r = EmpGrp.findOne({empId: e.empId, grpId: grpId});
      if (!r)
        EmpGrp.insert({empId: e.empId, grpId: grpId});
    });

    empInGrp = EmpGrp.find({grpId: grpId});
    // console.log('After: ' + empInGrp.count());

    var g = {
      id: Session.get('selectedGroup'),
      name: tmpl.find('[name=name]').value,
      nbEmp: se.length
    };

    Meteor.call('groupUpd', g, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('Group updated successfully.');
        Session.set('selectedGroup', null);
        Session.set('showDialogGroup', false);
      }
    });
  }
});