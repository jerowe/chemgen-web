'use strict';

describe('Service: getPlates', function () {

  // load the service's module
  beforeEach(module('chemgenClientApp'));

  // instantiate service
  var getPlates;
  beforeEach(inject(function (_getPlates_) {
    getPlates = _getPlates_;
  }));

  it('should do something', function () {
    expect(!!getPlates).toBe(true);
  });

});
