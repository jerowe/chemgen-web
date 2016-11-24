'use strict';

describe('Service: chemicalChembridge', function () {

  // load the service's module
  beforeEach(module('chemgenClientApp'));

  // instantiate service
  var chemicalChembridge;
  beforeEach(inject(function (_chemicalChembridge_) {
    chemicalChembridge = _chemicalChembridge_;
  }));

  it('should do something', function () {
    expect(!!chemicalChembridge).toBe(true);
  });

});
