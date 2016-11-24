'use strict';

describe('Service: getMainscreen', function () {

  // load the service's module
  beforeEach(module('chemgenClientApp'));

  // instantiate service
  var getMainscreen;
  beforeEach(inject(function (_getMainscreen_) {
    getMainscreen = _getMainscreen_;
  }));

  it('should do something', function () {
    expect(!!getMainscreen).toBe(true);
  });

});
