'use strict';

describe('Service: lbService', function () {

  // load the service's module
  beforeEach(module('chemgenClientApp'));

  // instantiate service
  var lbService;
  beforeEach(inject(function (_lbService_) {
    lbService = _lbService_;
  }));

  it('should do something', function () {
    expect(!!lbService).toBe(true);
  });

});
