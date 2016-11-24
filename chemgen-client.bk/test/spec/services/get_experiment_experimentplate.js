'use strict';

describe('Service: getExperimentExperimentplate', function () {

  // load the service's module
  beforeEach(module('chemgenClientApp'));

  // instantiate service
  var getExperimentExperimentplate;
  beforeEach(inject(function (_getExperimentExperimentplate_) {
    getExperimentExperimentplate = _getExperimentExperimentplate_;
  }));

  it('should do something', function () {
    expect(!!getExperimentExperimentplate).toBe(true);
  });

});
