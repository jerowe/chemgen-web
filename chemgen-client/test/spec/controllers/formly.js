'use strict';

describe('Controller: FormlyCtrl', function () {

  // load the controller's module
  beforeEach(module('chemgenClientApp'));

  var FormlyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FormlyCtrl = $controller('FormlyCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(FormlyCtrl.awesomeThings.length).toBe(3);
  });
});
