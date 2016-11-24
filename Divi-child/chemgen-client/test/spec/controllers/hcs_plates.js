'use strict';

describe('Controller: HcsPlatesCtrl', function () {

  // load the controller's module
  beforeEach(module('chemgenClientApp'));

  var HcsPlatesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HcsPlatesCtrl = $controller('HcsPlatesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(HcsPlatesCtrl.awesomeThings.length).toBe(3);
  });
});
