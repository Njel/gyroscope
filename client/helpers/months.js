// Local (client-only) collection
Months = new Meteor.Collection(null);

for (var i = 0; i < 12; i++) {
  Months.insert({
    v: i,
    m: moment(new Date(2014, i, 1)).format('MMMM')
  });
};