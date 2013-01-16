describe("myna.reward", function() {
  beforeEach(function() {
    this.myna = Myna.init({
      timeout: 25,
      experiments: [
        { uuid: 'uuid1', class: 'expt1', sticky: false }
      ]
    });
    this.myna.clearSuggestions();
  });

  it("should retrieve a suggestion", function() {
    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      this.myna.suggest('uuid1');
    });

    waits(this.myna.options.timeout);

    runs(function() {
      this.myna.reward('uuid1', 1.0, success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(success.mostRecentCall.args).toEqual([{ uuid: 'uuid1', choice: 'variant1', token: 'token1', skipped: false, rewarded: true }]);
      expect(error).not.toHaveBeenCalled();
      this.myna.suggest('uuid1');
    });

    waits(this.myna.options.timeout);

    runs(function() {
      this.myna.reward('uuid1', 1.0, success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(success.mostRecentCall.args).toEqual([{ uuid: 'uuid1', choice: 'variant2', token: 'token2', skipped: false, rewarded: true }]);
      expect(error).not.toHaveBeenCalled();
    });
  });

  it("should call error handler if rewarded without suggestion", function() {
    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      this.myna.reward('uuid1', 1.0, success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(success).not.toHaveBeenCalled();
      expect(error.mostRecentCall.args.slice(1, 3)).toEqual(["no-suggestion", 'uuid1']);
    });
  });

  it("should call error handler if rewarded twice", function() {
    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      this.myna.suggest('uuid1');
    });

    waits(this.myna.options.timeout);

    runs(function() {
      this.myna.reward({ uuid: 'uuid1' });
    });

    waits(this.myna.options.timeout);

    runs(function() {
      this.myna.reward('uuid1', 0.0);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      this.myna.reward('uuid1', 1.0, success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(success).not.toHaveBeenCalled();
      expect(error.mostRecentCall.args.slice(1, 3)).toEqual(["repeat-reward", 'uuid1']);
    });
  });

  it("should call error handler if response is not ok", function() {
    spyOn(Myna.$, "ajax").andCallFake(fakeProblematicServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      this.myna.suggest('uuid1');
    });

    waits(this.myna.options.timeout);

    runs(function() {
      this.myna.reward('uuid1', 1.0, success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(success).not.toHaveBeenCalled();
      expect(error.mostRecentCall.args[2]).toEqual({
        "typename" : "problem",
        "subtype"  : 400,
        "messages" : [
          {"typename": "malformedRequest"},
          {"typename": "info", "message": "Reward token not present in cache"}
        ]
      });
    });
  });

  it("should call error handler if server offline", function() {
    var spy     = spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      this.myna.suggest('uuid1');
    });

    waits(this.myna.options.timeout);

    runs(function() {
      spy.andCallFake(fakeOfflineServer());
      this.myna.reward('uuid1', 1.0, success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(success).not.toHaveBeenCalled();
      expect(error.mostRecentCall.args.slice(1, 3)).toEqual(["timeout", 25]);
    });
  });

  it("should call error handler if exception thrown", function() {
    var spy     = spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      this.myna.suggest('uuid1');
    });

    waits(this.myna.options.timeout);

    runs(function() {
      spy.andThrow("will.robinson");
      this.myna.reward('uuid1', 1.0, success, error);
    });

    runs(function() {
      expect(success).not.toHaveBeenCalled();
      expect(error.mostRecentCall.args).toEqual([undefined, "error", "will.robinson"]);
    });
  });
});
