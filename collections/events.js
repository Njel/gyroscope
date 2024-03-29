Events = new Meteor.Collection('events');

Events.allow({
  insert: function(userId, doc) {
   // only allow posting if you are logged in
   return !! userId;
  },
  update: ownsDocument,
  remove: ownsDocument
});

// Events.deny({
//   update: function(userId, post, fieldNames) {
//     // may only edit the following three fields:
//     return (_.without(fieldNames, 'year', 'month').length > 0);
//   }
// });

Meteor.methods({
  eventNew: function(eventAttributes) {
    var user = Meteor.user();
    var post = Posts.findOne(eventAttributes.postId);
    //var post = Posts.findOne(eventAttributes.postId);

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to create events");

    if (!eventAttributes.type)
      throw new Meteor.Error(422, 'Please select a type of event');

    // if (!eventAttributes.title)
    //   throw new Meteor.Error(422, 'Please write some content');

    if (!eventAttributes.postId)
      throw new Meteor.Error(422, 'You must select a month to create a event');

    var d = moment(new Date()).toISOString();

    ev = _.extend(_.pick(eventAttributes, 'postId', 'start', 'end', 'duration', 'unit', 'period', 'type', 'title', 'status', 'allDay'), {
      empId: post.empId,
      year: post.year,
      month: post.month,
      // start: moment(new Date(eventAttributes.start)),
      // end: moment(new Date(eventAttributes.end)),
      // start: new Date(eventAttributes.start).toISOString(),
      // end: new Date(eventAttributes.end).toISOString(),
      approved: null,
      approver: null,
      reviewed: null,
      reviewer: null,
      submitted: new Date().getTime(),
      createdBy: user._id,
      created: d,
      modifiedBy: user._id,
      modified: d
    });

    // update the post with the number of events
    Posts.update(ev.postId, {$inc: {eventsCount: 1}, $set: {status: 'In progress'}});

    // create the event, save the id
    // console.log(ev.start);
    ev._id = Events.insert(ev);

    // now create a notification, informing the user that there's been a event
    // createEventNotification(ev);

    var et = EventTypes.findOne(eventAttributes.type);

    // Calculate Extra hours
    // if (et.code = 'X') {
    if (eventAttributes.X) {
      // console.log(eventAttributes.X);
      // var X = calcExtraHours(ev);
      var cValue = 0.0;
      eventAttributes.X.forEach(function(r) {
        if (r.code.substring(0, 1) == 'X') {
          var et = EventTypes.findOne({code: r.code});
          if (et) {
            cValue = cValue + (r.value * et.ratio);
            var tot = Totals.findOne({postId: post._id, type: et._id});
            if (tot) {
              Totals.update(tot._id, {
                $inc: {
                  value: r.value,
                  cValue: (r.value * et.ratio)
                }, 
                $set: {
                  modifiedBy: user._id, 
                  modified: d
                }
              });
            } else {
              Totals.insert({
                postId: post._id,
                empId: post.empId,
                year: post.year,
                month: post.month,
                type: et._id,
                code: et.code,
                unit: et.unit,
                value: r.value,
                cValue: (r.value * et.ratio),
                createdBy: user._id,
                created: d,
                modifiedBy: user._id,
                modified: d
              });
            }
          }
        }
      });
    } else {
      var cValue = (parseFloat(eventAttributes.duration) * et.ratio)
    }

    // var tot = Totals.findOne({empId: post.empId, year: post.year, month: post.month, type: eventAttributes.type});
    var tot = Totals.findOne({postId: post._id, type: eventAttributes.type});
    if (tot) {
      Totals.update(tot._id, {
        $inc: {
          value: parseFloat(eventAttributes.duration),
          cValue: cValue
        }, 
        $set: {
          modifiedBy: user._id,
          modified: d
        }
      });
    } else {
      Totals.insert({
        postId: post._id,
        empId: post.empId,
        year: post.year,
        month: post.month,
        type: et._id,
        code: et.code,
        unit: eventAttributes.unit,
        value: eventAttributes.duration,
        cValue: cValue,
        createdBy: user._id,
        created: d,
        modifiedBy: user._id,
        modified: d
      });
    }

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return ev._id;
  },
  eventRpl: function(eventAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update events");

    if (!eventAttributes.type)
      throw new Meteor.Error(422, 'Please select a type of event');

    // if (!eventAttributes.title)
    //   throw new Meteor.Error(422, 'Please write some content');

    var d = moment(new Date()).toISOString();

    var ev = Events.findOne(eventAttributes.eventId);
    var et = EventTypes.findOne(eventAttributes.type);
    var etp = EventTypes.findOne(ev.type);

    if (ev && et) {
      Events.update(
        ev._id, {
          $set: {
            type: et._id,
            title: et.code,
            textColor: et.textColor,
            borderColor: et.borderColor,
            backgroundColor: et.backgroundColor,
            typeUnit: et.unit,
            status: 'Replaced',
            modifiedBy: user._id,
            modified: d
          }
        }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {

          }
        }
      );

      // Update Totals
      // var post = Posts.findOne(ev.postId);
      // Totals.update({empId: post.empId, year: post.year, month: post.month, type: prevType}, {$inc: {value: -ev.duration}, $set: {modifiedBy: user._id, modified: d}});
      Totals.update({postId: ev.postId, type: etp._id}, {
        $inc: {
          value: -ev.duration,
          cValue: (-ev.duration * etp.ratio)
        }, 
        $set: {
          modifiedBy: user._id, 
          modified: d
        }
      });
      // var tot = Totals.findOne({empId: post.empId, year: post.year, month: post.month, type: et._id});
      var tot = Totals.findOne({postId: ev.postId, type: et._id});
      if (tot) {
        Totals.update(tot._id, {
          $inc: {
            value: ev.duration,
            cValue: (ev.duration * et.ratio)
          }, 
          $set: {
            modifiedBy: user._id, 
            modified: d
          }
        });
      } else {
        var post = Posts.findOne(ev.postId);
        Totals.insert({
          postId: post._id,
          empId: post.empId,
          year: post.year,
          month: post.month,
          type: et._id,
          code: et.code,
          unit: ev.unit,
          value: ev.duration,
          cValue: (ev.duration * et.ratio),
          createdBy: user._id,
          created: d,
          modifiedBy: user._id,
          modified: d
        });
      }
    }
    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },
  eventUpd: function(eventAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to update events");

    if (!eventAttributes.type)
      throw new Meteor.Error(422, 'Please select a type of event');

    // if (!eventAttributes.title)
    //   throw new Meteor.Error(422, 'Please write some content');

    var d = moment(new Date()).toISOString();

    var ev = Events.findOne(eventAttributes.eventId);
    var et = EventTypes.findOne(ev.type);

    // console.log(eventAttributes.eventId);
    if (ev) {
      prevDuration = ev.duration;
      Events.update(
        ev._id, {
          $set: {
            period: eventAttributes.period,
            type: et._id,
            title: eventAttributes.title,
            // start: moment(eventAttributes.start, 'MM/DD/YYYY HH:mm'),
            // end: moment(eventAttributes.end, 'MM/DD/YYYY HH:mm')
            start: eventAttributes.start,
            end: eventAttributes.end,
            duration: eventAttributes.duration,
            status: 'Updated',
            modifiedBy: user._id,
            modified: d
          }
        }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {

          }
        }
      );

      // Calculate Extra hours
      // if (et.code = 'X') {
      var cValue = 0.0;
      if (eventAttributes.pX) {
        // var X = calcExtraHours(ev);
        // console.log(eventAttributes.pX);
        // console.log(eventAttributes.nX);
        eventAttributes.pX.forEach(function(r) {
          if (r.code.substring(0, 1) == 'X') {
            var et = EventTypes.findOne({code: r.code});
            if (et) {
              cValue = cValue - (r.value * et.ratio);
              var tot = Totals.findOne({postId: ev.postId, type: et._id});
              if (tot) {
                Totals.update(tot._id, {
                  $inc: {
                    value: -r.value,
                    cValue: -(r.value * et.ratio)
                  }, 
                  $set: {
                    modifiedBy: user._id, 
                    modified: d
                  }
                });
              }
            }
          }
        });
      } else {
        var cValue = ((eventAttributes.duration * et.ratio) - (prevDuration * et.ratio)) 
      }

      if (eventAttributes.nX) {
        // var X = calcExtraHours(ev);
        eventAttributes.nX.forEach(function(r) {
          if (r.code.substring(0, 1) == 'X') {
            var et = EventTypes.findOne({code: r.code});
            if (et) {
              cValue = cValue + (r.value * et.ratio);
              var tot = Totals.findOne({postId: ev.postId, type: et._id});
              if (tot) {
                Totals.update(tot._id, {
                  $inc: {
                    value: r.value,
                    cValue: (r.value * et.ratio)
                  }, 
                  $set: {
                    modifiedBy: user._id, 
                    modified: d
                  }
                });
              }
            }
          }
        });
      }

      // var post = Posts.findOne(ev.postId);
      // var tot = Totals.findOne({empId: post.empId, year: post.year, month: post.month, type: eventAttributes.type});
      var tot = Totals.findOne({postId: ev.postId, type: et._id});
      if (tot)
        Totals.update(tot._id, {
          $inc: {
            value: (eventAttributes.duration - prevDuration),
            cValue: cValue
          }, 
          $set: {
            modifiedBy: user._id, 
            modified: d
          }
        });
    }
    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },
  eventMove: function(eventAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to move events");

    var d = moment(new Date()).toISOString();

    var ev = Events.findOne(eventAttributes.eventId);
    var et = EventTypes.findOne(ev.type);

    if (ev) {
      prevDuration = ev.duration;
      Events.update(
        ev._id, {
          $set: {
            // start: moment(eventAttributes.start, 'MM/DD/YYYY HH:mm'), 
            // end: moment(eventAttributes.end, 'MM/DD/YYYY HH:mm')
            start: eventAttributes.start,
            end: eventAttributes.end,
            duration: eventAttributes.duration,
            status: 'Moved',
            modifiedBy: user._id,
            modified: moment(new Date()).toISOString()  }
        }, function(error) {
          if (error) {
            // display the error to the user
            alert(error.reason);
          } else {

          }
        }
      );

      // Calculate Extra hours
      // if (et.code = 'X') {
      var cValue = 0.0;
      if (eventAttributes.pX) {
        // var X = calcExtraHours(ev);
        eventAttributes.pX.forEach(function(r) {
          if (r.code.substring(0, 1) == 'X') {
            var et = EventTypes.findOne({code: r.code});
            if (et) {
              cValue = cValue - (r.value * et.ratio);
              var tot = Totals.findOne({postId: ev.postId, type: et._id});
              if (tot) {
                Totals.update(tot._id, {
                  $inc: {
                    value: -r.value,
                    cValue: -(r.value * et.ratio)
                  }, 
                  $set: {
                    modifiedBy: user._id, 
                    modified: d
                  }
                });
              }
            }
          }
        });
      } else {
        cValue = ((eventAttributes.duration * et.ratio) - (prevDuration * et.ratio));
      }

      if (eventAttributes.nX) {
        // var X = calcExtraHours(ev);
        eventAttributes.nX.forEach(function(r) {
          if (r.code.substring(0, 1) == 'X') {
            var et = EventTypes.findOne({code: r.code});
            if (et) {
              cValue = cValue + (r.value * et.ratio);
              var tot = Totals.findOne({postId: ev.postId, type: et._id});
              if (tot) {
                Totals.update(tot._id, {
                  $inc: {
                    value: r.value,
                    cValue: (r.value * et.ratio)
                  }, 
                  $set: {
                    modifiedBy: user._id, 
                    modified: d
                  }
                });
              }
            }
          }
        });
      }

      // if (prevDuration != eventAttributes.duration) {
        // var post = Posts.findOne(ev.postId);
        // var tot = Totals.findOne({empId: post.empId, year: post.year, month: post.month, type: ev.type});
        var tot = Totals.findOne({postId: ev.postId, type: et._id});
        if (tot) {
          Totals.update(tot._id, {
            $inc: {
              value: (eventAttributes.duration - prevDuration),
              cValue: cValue
            }, 
            $set: {
              modifiedBy: user._id, 
              modified: d
            }
          });
        }
      // }
    }
    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  },
  eventDel: function(eventAttributes) {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to delete events");

    var d = moment(new Date()).toISOString();

    var ev = Events.findOne(eventAttributes.eventId);
    var et = EventTypes.findOne(ev.type);

    Events.remove(ev._id, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {

      }
    });

    // Calculate Extra hours
    // if (et.code = 'X') {
    if (eventAttributes.X) {
      // var X = calcExtraHours(ev);
      var cValue = 0.0;
      eventAttributes.X.forEach(function(r) {
        if (r.code.substring(0, 1) == 'X') {
          var et = EventTypes.findOne({code: r.code});
          if (et) {
            var tot = Totals.findOne({postId: ev.postId, type: et._id});
            if (tot) {
              cValue = cValue - (r.value * et.ratio);
              Totals.update(tot._id, {
                $inc: {
                  value: -r.value,
                  cValue: -(r.value * et.ratio)
                }, 
                $set: {
                  modifiedBy: user._id, 
                  modified: d
                }
              });
            }
          }
        }
      });
    } else {
      var cValue = -(ev.duration * et.ratio);
    }

    // var post = Posts.findOne(ev.postId);
    // var tot = Totals.findOne({empId: post.empId, year: post.year, month: post.month, type: ev.type});
    var tot = Totals.findOne({postId: ev.postId, type: et._id});
    if (tot)
      Totals.update(tot._id, {
        $inc: {
          value: -ev.duration,
          cValue: cValue
        }, 
        $set: {
          modifiedBy: user._id, 
          modified: d
        }
      });

    // update the post with the number of events
    Posts.update(ev.postId, {$inc: {eventsCount: -1}});

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});

    return true;
  }
});