'use strict';

describe('Service: getFormlyPromise', function () {

  // load the service's module
  beforeEach(module('chemgenClientApp'));

  // instantiate service
  var getFormlyPromise;
  beforeEach(inject(function (_getFormlyPromise_) {
    getFormlyPromise = _getFormlyPromise_;
  }));

  it('should do something', function () {
    expect(!!getFormlyPromise).toBe(true);
  });

});
