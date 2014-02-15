Template.legend.helpers({
  title: function() {
  	if (location.pathname === '/')
  	  return 'Dashboard';
  	if (location.pathname === '/reports')
  	  return 'Reports';
  	if (location.pathname === '/employees')
  	  return 'Employees';
    if (location.pathname === '/groups')
      return 'Groups';
    if (location.pathname === '/schedules')
      return 'Schedules';
    if (location.pathname === '/holidays')
      return 'Holidays';
  	if (location.pathname === '/settings')
  	  return 'Settings';
  	if (location.pathname === '/submit')
  	  return 'Submit a new month';

    return '';
  }
});