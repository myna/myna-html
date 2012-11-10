describe("$.cookie", function() {
  it("should be present", function() {
    expect($.cookie).toBeOfType("function")
    expect($.removeCookie).toBeOfType("function")
  });

  it("should save data", function() {
    $.removeCookie("a");
    expect($.cookie("a")).toBeFalsy();

    $.cookie("a", "b");
    expect($.cookie("a")).toEqual("b");

    $.removeCookie("a");
    expect($.cookie("a")).toBeFalsy();
  });
});

describe("myna.{load,save,clear}Suggestions", function() {
  it("should save and load data", function() {
    var myna = Myna.init();

    myna.clearSuggestions();
    expect(myna.loadSuggestions()).toEqual([]);

    myna.saveSuggestions([ "foo", "bar", "baz" ]);
    expect(myna.loadSuggestions()).toEqual([ "foo", "bar", "baz" ]);

    myna.clearSuggestions();
    expect(myna.loadSuggestions()).toEqual([]);
  });
});

describe("myna.{load,save,delete}Suggestion", function() {
  it("should save and load data", function() {
    var myna = Myna.init();

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
