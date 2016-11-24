'use strict';

describe('Service: getReagentsReagentlibrary', function () {

  // load the service's module
  beforeEach(module('chemgenClientApp'));

  // instantiate service
  var getReagentsReagentlibrary;
  beforeEach(inject(function (_getReagentsReagentlibrary_) {
    getReagentsReagentlibrary = _getReagentsReagentlibrary_;
  }));

  it('should do something', function () {
    expect(!!getReagentsReagentlibrary).toBe(true);
  });

});
