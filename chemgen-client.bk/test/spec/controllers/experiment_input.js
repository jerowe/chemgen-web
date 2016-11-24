'use strict';

describe('Controller: ExperimentInputCtrl', function () {

  // load the controller's module
  beforeEach(module('chemgenClientApp'));

  var ExperimentInputCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ExperimentInputCtrl = $controller('ExperimentInputCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ExperimentInputCtrl.awesomeThings.length).toBe(3);
  });
});
