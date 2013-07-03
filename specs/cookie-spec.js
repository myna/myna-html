describe("$.cookie", function() {
  it("should be present", function() {
    expect(Myna.$.cookie).toBeOfType("function")
    expect(Myna.$.removeCookie).toBeOfType("function")
  });

  it("should save data", function() {
    Myna.$.removeCookie("a");
    expect(Myna.$.cookie("a")).toBeFalsy();

    Myna.$.cookie("a", "b");
    expect(Myna.$.cookie("a")).toEqual("b");

    Myna.$.removeCookie("a");
    expect(Myna.$.cookie("a")).toBeFalsy();
  });
});

describe("myna.{load,save,clear}Suggestions", function() {
  it("should save and load data", function() {
    var myna = Myna.init({ experiments: [{ uuid: 'uuid1', class: 'expt1' }] });

    myna.clearSuggestions();
    expect(myna.loadSuggestions()).toEqual([]);

    myna.saveSuggestions([ "foo", "bar", "baz" ]);
    expect(myna.loadSuggestions()).toEqual([ "foo", "bar", "baz" ]);

    myna.clearSuggestions();
    expect(myna.loadSuggestions()).toEqual([]);
  });

  it("should set cookie expiry date", function() {
    var myna = Myna.init({ experiments: [{ uuid: 'uuid1', class: 'expt1' }] });

    myna.clearSuggestions();
    expect(myna.loadSuggestions()).toEqual([]);

    var cookie = myna.saveSuggestions(["foo"]);
    expect(cookie).toMatch(/expires/)

    myna.clearSuggestions();
  })
});

describe("myna.{load,save,delete}Suggestion", function() {
  it("should save and load data", function() {
    var myna = Myna.init({ experiments: [
      { uuid: 'uuid1', class: 'expt1' },
      { uuid: 'uuid2', class: 'expt2' }
    ]});

    var uuid1 = 'uuid1';
    var uuid2 = 'uuid2';

    var expt1 = { uuid: 'uuid1', choice: 'choice1', token: 'token1', skipped: true, rewarded: false };
    var expt2 = { uuid: 'uuid2', choice: 'choice2', token: 'token2', skipped: false, rewarded: true };

    myna.clearSuggestions();
    expect(myna.loadSuggestions()).toEqual([]);

    myna.saveSuggestion(uuid1, expt1.choice, expt1.token, expt1.skipped, expt1.rewarded);
    expect(myna.loadSuggestions()).toEqual({ uuid1 : expt1 });
    expect(myna.loadSuggestion(uuid1)).toEqual(expt1);
    expect(myna.loadSuggestion(uuid2)).toEqual(null);

    myna.saveSuggestion(uuid2, expt2.choice, expt2.token, expt2.skipped, expt2.rewarded);
    expect(myna.loadSuggestions()).toEqual({ uuid1 : expt1, uuid2 : expt2 });
    expect(myna.loadSuggestion(uuid1)).toEqual(expt1);
    expect(myna.loadSuggestion(uuid2)).toEqual(expt2);

    myna.deleteSuggestion(uuid1);
    expect(myna.loadSuggestions()).toEqual({ uuid2 : expt2 });
    expect(myna.loadSuggestion(uuid1)).toEqual(null);
    expect(myna.loadSuggestion(uuid2)).toEqual(expt2);
  });
});

describe("beforeSave", function() {
  it("should be called on save", function() {
    var beforeSave  = jasmine.createSpy("beforeSave");
    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    var myna = Myna.init({
      timeout: 25,
      experiments: [{ uuid: 'uuid1', class: 'expt1', sticky: false }],
      callbacks: {
        beforeSave: beforeSave
      }
    });

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    runs(function() {
      myna.clearSuggestions();
      myna.suggest('uuid1', success, error);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(beforeSave.mostRecentCall.args).toEqual([
        { uuid: 'uuid1', choice: 'variant1', token: 'token1', skipped: false, rewarded: false }
      ]);
      expect(success.mostRecentCall.args).toEqual([
        { uuid: 'uuid1', choice: 'variant1', token: 'token1', skipped: false, rewarded: false }
      ]);
      expect(error).not.toHaveBeenCalled();
    });
  });

  it("should be able to customise the saved data", function() {
    var beforeSave = jasmine.createSpy("beforeSave").andCallFake(function(obj) {
      return Myna.$.extend({ foo: 'bar' }, obj);
    });
    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    var myna = Myna.init({
      timeout: 25,
      experiments: [{ uuid: 'uuid1', class: 'expt1', sticky: false }],
      callbacks: {
        beforeSave: beforeSave
      }
    });

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    runs(function() {
      myna.clearSuggestions();
      myna.suggest('uuid1', success, error);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(beforeSave.callCount).toEqual(1);
      expect(beforeSave.mostRecentCall.args).toEqual([
        { uuid: 'uuid1', choice: 'variant1', token: 'token1', skipped: false, rewarded: false }
      ]);
      expect(success.mostRecentCall.args).toEqual([
        { uuid: 'uuid1', choice: 'variant1', token: 'token1', skipped: false, rewarded: false, foo: 'bar' }
      ]);
      expect(error).not.toHaveBeenCalled();
    });
  });
});
