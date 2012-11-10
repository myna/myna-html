describe("sticky experiments", function() {
  beforeEach(function() {
    this.myna = Myna.init({
      timeout: 25,
      experiments: [
        { uuid: 'uuid1', class: 'expt1', sticky: true }
      ]
    });
    this.myna.clearSuggestions();
  });

  it("should not call the server if a suggestion has already been cached", function() {
    var server  = spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());
    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      this.myna.suggest('uuid1', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      this.myna.suggest('uuid1', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(server.argsForCall.length).toEqual(1);
      expect(success.argsForCall.length).toEqual(2);
      expect(error.argsForCall.length).toEqual(0);
    });
  });
});

describe("non-sticky experiments", function() {
  beforeEach(function() {
    this.myna = Myna.init({
      timeout: 25,
      experiments: [
        { uuid: 'uuid1', class: 'expt1', sticky: false }
      ]
    });
    this.myna.clearSuggestions();
  });

  it("should call the server even if a suggestion has already been cached", function() {
    var server  = spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());
    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      this.myna.suggest('uuid1', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      this.myna.suggest('uuid1', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(server.argsForCall.length).toEqual(2);
      expect(success.argsForCall.length).toEqual(2);
      expect(error.argsForCall.length).toEqual(0);
    });
  });
});
