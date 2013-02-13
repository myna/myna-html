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

describe("beforeSuggest", function() {
  it("should be called with the correct arguments", function() {
    var stickySuggest   = jasmine.createSpy("stickySuggest");
    var stickySuccess   = jasmine.createSpy("stickySuccess");
    var stickyError     = jasmine.createSpy("stickyError");

    var nonStickSuggest = jasmine.createSpy("nonStickSuggest");
    var nonStickSuccess = jasmine.createSpy("nonStickSuccess");
    var nonStickError   = jasmine.createSpy("nonStickError");

    var myna = Myna.init({
      timeout: 25,
      experiments: [
        {
          uuid: 'sticky-uuid',
          class: 'sticky-class',
          sticky: true,
          callbacks: {
            beforeSuggest: stickySuggest
          }
        },
        {
          uuid: 'non-stick-uuid',
          class: 'non-sticky-class',
          sticky: false,
          callbacks: {
            beforeSuggest: nonStickSuggest
          }
        }
      ]
    });

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    runs(function() {
      myna.clearSuggestions();
      myna.suggest('sticky-uuid', stickySuccess, stickyError);
      myna.suggest('non-stick-uuid', nonStickSuccess, nonStickError);
    });

    waits(myna.options.timeout);

    runs(function() {
      myna.suggest('sticky-uuid', stickySuccess, stickyError);
      myna.suggest('non-stick-uuid', nonStickSuccess, nonStickError);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(stickySuccess.callCount).toEqual(2);
      expect(nonStickSuccess.callCount).toEqual(2);

      expect(stickyError).not.toHaveBeenCalled();
      expect(nonStickError).not.toHaveBeenCalled();

      expect(stickySuggest.callCount).toEqual(2);
      expect(stickySuggest.argsForCall[0]).toEqual([
        { uuid: 'sticky-uuid', choice: 'variant1', token: 'token1', skipped: false, rewarded: false },
        true
      ]);
      expect(stickySuggest.argsForCall[1]).toEqual([
        { uuid: 'sticky-uuid', choice: 'variant1', token: 'token1', skipped: false, rewarded: false },
        false
      ]);

      expect(nonStickSuggest.callCount).toEqual(2);
      expect(nonStickSuggest.argsForCall[0]).toEqual([
        { uuid: 'non-stick-uuid', choice: 'variant1', token: 'token1', skipped: false, rewarded: false },
        true
      ]);
      expect(nonStickSuggest.argsForCall[1]).toEqual([
        { uuid: 'non-stick-uuid', choice: 'variant2', token: 'token2', skipped: false, rewarded: false },
        true
      ]);
    });
  });
});
