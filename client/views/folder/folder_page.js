Template.folderPage.helpers({
  currentEmployee: function() {
  	var e = Employees.findOne(Session.get('currentEmpId'));
  	return e;
  },
  totals: function() {
    return Totals.find({empId: Session.get('currentEmpId')});
  }
});