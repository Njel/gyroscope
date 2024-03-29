Template.legend.helpers({
  title: function() {
  	if (location.pathname === '/')
  	  return 'Dashboard';
  	if (location.pathname === '/employees')
  	  return 'Employees';
    if (location.pathname.substring(0, 7) === '/folder')
      return 'Employee Folder';
    if (location.pathname === '/groups')
      return 'Groups';
    if (location.pathname === '/schedules')
      return 'Schedules';
    if (location.pathname === '/reports')
      return 'Reports';
    if (location.pathname.substring(0, 9) === '/calendar')
      return 'Calendar';
    if (location.pathname === '/holidays')
      return 'Holidays';
  	if (location.pathname === '/settings')
  	  return 'Settings';
  	if (location.pathname === '/submit')
  	  return 'Submit a new month';

    return '';
  }
});