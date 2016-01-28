app.directive('landSquare', function() {
  return {
    restrict: 'E',
    scope: {
      building: '='
    },
    templateUrl: 'template/landSquare.html'
  };
});