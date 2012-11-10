describe("myna.suggest", function() {
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
      this.myna.suggest('uuid1', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(success.mostRecentCall.args).toEqual([
        { uuid: 'uuid1', choice: 'variant1', token: 'token1', skipped: false, rewarded: false }
      ]);
      expect(error).not.toHaveBeenCalled();
      this.myna.suggest('uuid1', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(success.mostRecentCall.args).toEqual([
        { uuid: 'uuid1', choice: 'variant2', token: 'token2', skipped: false, rewarded: false }
      ]);
      expect(error).not.toHaveBeenCalled();
      this.myna.suggest('uuid1', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(success.mostRecentCall.args).toEqual([
        { uuid: 'uuid1', choice: 'variant1', token: 'token3', skipped: false, rewarded: false }
      ]);
      expect(error).not.toHaveBeenCalled();
    });
  });

  it("should call error handler if server offline", function() {
    spyOn(Myna.$, "ajax").andCallFake(fakeOfflineServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      this.myna.suggest('uuid1', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(success).not.toHaveBeenCalled();
      expect(error.mostRecentCall.args.slice(1, 3)).toEqual(["timeout", 25]);
      this.myna.suggest('uuid1', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(success).not.toHaveBeenCalled();
      expect(error.mostRecentCall.args.slice(1, 3)).toEqual(["timeout", 25]);
    });
  });

  it("should call error handler if exception thrown", function() {
    spyOn(Myna.$, "ajax").andThrow("will.robinson");

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    this.myna.suggest('uuid1', success, error);
    expect(success).not.toHaveBeenCalled();
    expect(error.mostRecentCall.args).toEqual([undefined, "error", "will.robinson"]);

    this.myna.suggest('uuid1', success, error);
    expect(success).not.toHaveBeenCalled();
    expect(error.mostRecentCall.args).toEqual([undefined, "error", "will.robinson"]);
  });
});

// If a sticky experiment is marked as skipped,     it stays skipped
// If a non-sticky experiment is marked as skipped, it doesn't stay skipped