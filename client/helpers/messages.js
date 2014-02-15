// Local (client-only) collection
Messages = new Meteor.Collection(null);

throwMessage = function(message) {
  Messages.insert({message: message, seen: false});
}

clearMessages = function() {
  Messages.remove({seen: true});
}