'use strict';

describe('Controller: ScreenInputCtrl', function () {

  // load the controller's module
  beforeEach(module('chemgenClientApp'));

  var ScreenInputCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ScreenInputCtrl = $controller('ScreenInputCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ScreenInputCtrl.awesomeThings.length).toBe(3);
  });
});
