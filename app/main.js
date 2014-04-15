(function(ng, Bacon) {
    var app = ng.module('app', ['angular-bacon-bridge']);

    var MainController = function($scope) {
        var decStream = $scope.$fromBinder('dec').map(-1);
        var incStream = $scope.$fromBinder('inc').map(1);

        var sum = function(a, b) {
          return a + b;
        };

        incStream.merge(decStream).scan(0, sum).$assign($scope, 'value');

        $scope.$fromEvent('value').$assign($scope, 'letter');

        $scope.$fromWatch('message').map(function(ev) {
            return ev.newValue;
        }).filter(function(value) {
            return value != undefined;
        }).map(function(value) {
            return value.replace(/([aoe])/g, function(v) {
                return String.fromCharCode(v.charCodeAt(0) + 10);
            });
        }).doAction(function(value){
            $scope.$broadcast('value', {
                value: value
            });
        }).$assign($scope, 'text');
    };

    app.controller('MainController', ['$scope', 'Bacon', MainController]);
})(angular, Bacon);