(function(ng, Bacon) {
    var baconModule = ng.module('angular-bacon-bridge', []);

    baconModule.factory('Bacon', ['$window', '$parse', function($window, $parse) {
        var bacon = $window.Bacon;

        bacon.Observable.prototype.$assign = function(scope, property) {
            var setter = $parse(property).assign;

            var unSubscribe = this.subscribe(function(ev) {
                if(ev.hasValue()) {
                    if(!scope.$$phase) {
                        return scope.$apply(function() {
                            setter(scope, ev.value());
                        });
                    } else {
                        return setter(scope, ev.value());
                    }
                }
            });

            scope.$on('$destroy', unSubscribe);

            return this;
        };

        return bacon;
    }]);

    baconModule.config(['$provide', function($provide) {
        $provide.decorator('$rootScope', ['$delegate', 'Bacon', function($delegate, Bacon) {

            Object.defineProperties($delegate.constructor.prototype, {
                '$fromBinder': {
                    value: function(functionName, listener) {
                        var scope = this;

                        return Bacon.fromBinder(function(sink) {
                            scope[functionName] = function() {
                                sink(new Bacon.Next([]));
                            };

                            return function() {
                                delete scope[functionName];
                            };
                        });
                    },
                    enumerable: false
                },
                '$fromEvent': {
                    value: function(eventName) {
                        var scope = this;
                        return Bacon.fromBinder(function(sink) {
                            var unSubscribe = scope.$on(eventName, function(ev, data) {
                                sink(new Bacon.Next(data));
                            });

                            scope.$on('$destroy', unSubscribe);

                            return unSubscribe;
                        });
                    },
                    enumerable: false
                },
                '$fromWatch': {
                    value: function(watchExpression, objectEquality) {
                        var scope = this;

                        return Bacon.fromBinder(function(sink) {
                            function listener(newValue, oldValue) {
                                sink(new Bacon.Next({ oldValue:oldValue, newValue:newValue }));
                            }

                            var unSubscribe = scope.$watch(watchExpression, listener, objectEquality);

                            scope.$on('$destroy', unSubscribe);

                            return unSubscribe;
                        });
                    },
                    enumerable: false
                }
            });

            return $delegate;
        }]);
    }]);
})(angular, Bacon);