angular.module('lampost_editor').controller('ImportsEditorCtrl', ['$scope', 'lmUtil', 'lmDialog',  function($scope, lmUtil, lmDialog) {


  $scope.setDatabaseDialog = function() {
     lmDialog.show({templateUrl: "editor/dialogs/select_db.html" , controller: "DbSelectorCtrl",
        scope: $scope});
  }
}]);


angular.module('lampost_editor').controller('DbSelectorCtrl', ['$scope', 'lmRemote',  function($scope, lmRemote) {
  $scope.newParams = {db_port: 6379, db_num:0, db_pw: null};
  if ($scope.dbParams) {
    angular.copy($scope.dbParams, $scope.newParams);
  }

  $scope.setDatabase = function() {
    lmRemote.request("editor/imports/set_db", $scope.newParams).then(function(newParams) {
      $scope.dbParams = newParams;
      $scope.dismiss();
    })
  }
}]);