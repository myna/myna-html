describe("experiments with skipChance = 1.0", function() {
  beforeEach(function() {
    this.myna = Myna.init({
      timeout: 25,
      experiments: [
        { uuid: 'uuid1', class: 'expt1', skipChance: 1.0, default: 'default1' },
        { uuid: 'uuid2', class: 'expt2', skipChance: 1.0 }
      ]
    });
    this.myna.clearSuggestions();
  });

  it("should not call the server", function() {
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
      expect(server.argsForCall).toEqual([]);
      expect(success.argsForCall).toEqual([
        [ { uuid : 'uuid1', choice : 'default1', token : null, skipped : true, rewarded : false } ],
        [ { uuid : 'uuid1', choice : 'default1', token : null, skipped : true, rewarded : false } ]
      ]);
      expect(error.argsForCall).toEqual([]);
    });
  });

  it("should infer the default variant from the DOM if possible", function() {
    var server  = spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());
    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    $("#experiments").html('<span class="expt2" data-show="variant1">V1</span>');

    runs(function() {
      this.myna.suggest('uuid2', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(server.argsForCall).toEqual([]);
      expect(success.argsForCall).toEqual([
        [ { uuid : 'uuid2', choice : 'variant1', token : null, skipped : true, rewarded : false } ]
      ]);
      expect(error.argsForCall).toEqual([]);
    });
  });

  it("should call the error handler if a default variant cannot be found", function() {
    var server  = spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());
    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    $("#experiments").html('');

    runs(function() {
      this.myna.suggest('uuid2', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(server.argsForCall).toEqual([]);
      expect(success.argsForCall).toEqual([]);
      expect(error.argsForCall).toEqual([
        [ null, "no-default-suggestion", "uuid2" ]
      ]);
    });
  });
});
