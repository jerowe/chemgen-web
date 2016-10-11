'use strict';

describe('Controller: UigridCtrl', function () {

  // load the controller's module
  beforeEach(module('chemgenClientApp'));

  var UigridCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UigridCtrl = $controller('UigridCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(UigridCtrl.awesomeThings.length).toBe(3);
  });
});
