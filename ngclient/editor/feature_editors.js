angular.module('lampost_editor').controller('storeFeatureController', ['$scope', '$filter', 'room', 'feature', function($scope, $filter, room, feature) {

  var noCurrency = {dbo_id: '--None--'};
  var noItems = {dbo_id: '--No Items--', invalid: true};

  $scope.objType = 'article';
  $scope.store = angular.copy(feature);
  $scope.room = room;

  $scope.finishEdit = function() {
    angular.copy($scope.store, feature);
    $scope.dismiss();
  };

  $scope.areaChange = function() {};
  $scope.listChange = function(objects) {
    $scope.currencyList = $filter('filter')(objects, {divisible: true});
    $scope.currencyList.push(noCurrency);
    $scope.permList = $filter('filter')(objects, {divisible: false});
    if ($scope.permList.length === 0) {
      $scope.permList = [noItems];
    }
    $scope.newPerm = $scope.permList[0].dbo_id;
    $scope.newCurrency = $scope.currencyList[0].dbo_id;
  };

  $scope.updateCurrency = function() {
    if ($scope.newCurrency == noCurrency.dbo_id) {
      $scope.store.currency = null;
    } else {
      $scope.store.currency = $scope.newCurrency;
    }
  };

  $scope.currency = function() {
    return $scope.store.currency || noCurrency.dbo_id;
  };

  $scope.addPerm = function() {
    $scope.store.perm_inven.push($scope.newPerm);
  };

  $scope.permExists = function() {
    return $scope.newPerm.invalid || $scope.store.perm_inven.indexOf($scope.newPerm) > -1;
  };

  $scope.removePerm = function(perm) {
    var ix = $scope.store.perm_inven.indexOf(perm);
    if (ix > -1) {
      $scope.store.perm_inven.splice(ix, 1);
    }
  };


}]);