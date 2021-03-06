angular.module('lampost_util', []);

angular.module('lampost_util').service('lpEvent', ['$log', '$timeout', function ($log, $timeout) {
  var self = this;
  var registry = {};

  function applyCallback(callback, args, scope) {
    if (scope)  {
      if (scope.$$phase || (scope.$root && scope.$root.$$phase)) {
        callback.apply(scope, args);
      } else {
        scope.$apply(function() {
           callback.apply(scope, args)
        })
      }
    } else {
      callback.apply(this, args)
    }
  }

  function dispatchMap(eventMap) {
    for (var key in eventMap) {
      if (eventMap.hasOwnProperty(key)) {
        self.dispatch(key, eventMap[key]);
      }
    }
  }

  this.register = function (event_type, callback, scope, priority) {
    if (!registry[event_type]) {
      registry[event_type] = [];
    }

    var registration = {event_type: event_type, callback: callback,priority: priority || 0};
    registry[event_type].push(registration);
    registry[event_type].sort(function (a, b) {
      return a.priority - b.priority
    });
    if (scope) {
      registration.scope = scope;
      if (!scope.hasOwnProperty('lpRegs')) {
        scope.lpRegs = [];
        scope.$on('$destroy', function (event) {
          var copy = event.currentScope.lpRegs.slice();
          for (var i = 0; i < copy.length; i++) {
            self.unregister(copy[i]);
          }
        });
      }
      scope.lpRegs.push(registration);
    }
    return registration;
  };

  this.unregister = function (registration) {
    var registrations = registry[registration.event_type];
    if (!registrations) {
      $log.log("Unregistering event for " + registration.event_type + " that was never registered");
      return;
    }
    var found = false;
    var i;
    for (i = 0; i < registrations.length; i++) {
      if (registrations[i] === registration) {
        registrations.splice(i, 1);
        found = true;
        break;
      }
    }

    if (!registrations.length) {
      delete registry[registration.event_type];
    }

    if (!found) {
      $log.log("Failed to unregister event " + registration.event_type + " " + registration.callback);
      return;
    }
    if (registration.scope) {
      var listeners = registration.scope.lpRegs;
      for (i = 0; i < listeners.length; i++) {
        if (listeners[i] === registration) {
          listeners.splice(i, 1);
          break;
        }
      }
      if (!listeners.length) {
        delete registration.scope.lpRegs;
      }
    }
  };

  this.dispatchSync = function() {
    var event_type = arguments[0];
    var i;
    var args = [];
    for (i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    var registrations = registry[event_type];
    if (registrations) {
      for (i = 0; i < registrations.length; i++) {
        registrations[i].callback.apply(this, args);
      }
    }
  };

  this.dispatchLater = function() {
    var originalArgs = arguments;
    $timeout(function() {
      self.dispatch.apply(self, originalArgs);
    })
  }

  this.dispatch = function () {
    var event_type = arguments[0];
    var i;
    var args = [];
    for (i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    var registrations = registry[event_type];
    if (registrations) {
      for (i = 0; i < registrations.length; i++) {
        applyCallback(registrations[i].callback, args, registrations[i].scope)
      }
    }
  };

  this.dispatchMap = function (eventMap) {
    if (Array.isArray(eventMap)) {
      angular.forEach(eventMap, dispatchMap);
    } else {
      dispatchMap(eventMap);
    }
  }
}]);


angular.module('lampost_util').service('lpUtil', [function () {

  function rawCmp(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
  }

  function naturalCmp(a, b) {
      var x = [], y = [];

      a.replace(/(\d+)|(\D+)/g, function($0, $1, $2) { x.push([$1 || 0, $2]) })
      b.replace(/(\d+)|(\D+)/g, function($0, $1, $2) { y.push([$1 || 0, $2]) })

      while(x.length && y.length) {
          var xx = x.shift();
          var yy = y.shift();
          var nn = (xx[0] - yy[0]) || rawCmp(xx[1], yy[1]);
          if(nn) return nn;
      }

      if(x.length) return -1;
      if(y.length) return 1;

      return 0;
  }

  this.naturalCmp = naturalCmp;

  this.naturalSort = function(array) {
    return array.sort(naturalCmp);
  };

  this.stringSort = function (array, field) {
    array.sort(function (a, b) {
      var aField = a[field].toLowerCase();
      var bField = b[field].toLowerCase();
      return ((aField < bField) ? -1 : ((aField > bField) ? 1 : 0));
    });
  };

  this.fieldSortFunc = function(field) {
    return function(array) {
      array.sort(function(a, b) {
        return naturalCmp(a[field], b[field]);
      });
    }
  };

  this.intSort = function (array, field) {
    array.sort(function (a, b) {
      return a[field] - b[field];
    })
  };

  this.descIntSort = function (array, field) {
    array.sort(function (a, b) {
      return b[field] - a[field];
    })
  };

  this.fieldCmpSort = function(field, cmp) {
    return function(array) {
      array.sort(function(a, b) {
        return cmp(a[field], b[field]);
      });
    }
  };

  this.urlVars = function () {
    var vars = {};
    var keyValuesPairs = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < keyValuesPairs.length; i++) {
      var kvp = keyValuesPairs[i].split('=');
      vars[kvp[0]] = kvps[1];
    }
    return vars;
  };

  this.capitalize = function(name) {
    return name && name.substring(0, 1).toLocaleUpperCase() + name.substring(1);
  };

  this.getScrollBarSizes = function () {
    var inner = $('<p></p>').css({
      'width': '100%',
      'height': '100%'
    });
    var outer = $('<div></div>').css({
      'position': 'absolute',
      'width': '100px',
      'height': '100px',
      'top': '0',
      'left': '0',
      'visibility': 'hidden',
      'overflow': 'hidden'
    }).append(inner);
    $(document.body).append(outer);
    var w1 = inner.width(), h1 = inner.height();
    outer.css('overflow', 'scroll');
    var w2 = inner.width(), h2 = inner.height();
    if (w1 == w2 && outer[0].clientWidth) {
      w2 = outer[0].clientWidth;
    }
    if (h1 == h2 && outer[0].clientHeight) {
      h2 = outer[0].clientHeight;
    }
    outer.detach();
    return [(w1 - w2), (h1 - h2)];
  };
}]);


angular.module('lampost_util').filter('cap', ['lpUtil', function(lpUtil) {
  return lpUtil.capitalize;
}]);

angular.module('lampost_util').filter('idOnly', [function() {
  return function (model) {
    return model && model.dbo_id && model.dbo_id.split(':')[1];
  };
}]);

angular.module('lampost_util').filter('model_prop', [function() {
  return function(model, prop) {
    return model[prop];
  }
}]);

angular.module('lampost_util').filter('join', [function() {
   return function (values, del) {
      return values.join(del || ' ');
    };
}]);

angular.module('lampost_util').filter('eval', ['$filter', function($filter) {
    return function() {
        var filterName = [].splice.call(arguments, 1, 1)[0];
        return filterName ? $filter(filterName).apply(null, arguments) : arguments[0];
    };
}]);