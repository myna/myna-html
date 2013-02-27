describe("Google Analytics integration", function() {
  it("should record suggest events (non-sticky)", function() {
    var myna = Myna.init({
      timeout: 25,
      experiments: [ { uuid: 'uuid1', class: 'expt1', sticky: false } ]
    });

    myna.clearSuggestions();

    window._gaq = [];

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      myna.suggest('uuid1', success, error);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1']
      ]);

      myna.suggest('uuid1', success, error);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1'],
        ['_trackEvent', 'myna', 'uuid1-view', 'variant2']
      ]);
    });
  });

  it("should record suggest events (sticky)", function() {
    var myna = Myna.init({
      timeout: 25,
      experiments: [ { uuid: 'uuid1', class: 'expt1' } ]
    });

    myna.clearSuggestions();

    window._gaq = [];

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      myna.suggest('uuid1', success, error);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1']
      ]);

      myna.suggest('uuid1', success, error);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1']
      ]);
    });
  });

  it("should not record suggest events if server offline", function() {
    var myna = Myna.init({
      timeout: 25,
      experiments: [ { uuid: 'uuid1', class: 'expt1', sticky: false } ]
    });

    myna.clearSuggestions();

    window._gaq = [];

    spyOn(Myna.$, "ajax").andCallFake(fakeOfflineServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      myna.suggest('uuid1', success, error);
      expect(window._gaq).toEqual([]);
    });

    waits(myna.options.timeout);

    runs(function() {
      myna.suggest('uuid1', success, error);
      expect(window._gaq).toEqual([]);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([]);
    });
  });

  it("should record reward events (non-sticky)", function() {
    var myna = Myna.init({
      timeout: 25,
      experiments: [
        { uuid: 'uuid1', class: 'expt1', sticky: false }
      ]
    });

    myna.clearSuggestions();

    window._gaq = [];

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      myna.suggest('uuid1');
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1']
      ]);

      myna.reward('uuid1', 1.0, success, error);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1'],
        ['_trackEvent', 'myna', 'uuid1-conversion', 'variant1']
      ]);

      myna.suggest('uuid1');
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1'],
        ['_trackEvent', 'myna', 'uuid1-conversion', 'variant1'],
        ['_trackEvent', 'myna', 'uuid1-view', 'variant2']
      ]);

      myna.reward('uuid1', 1.0, success, error);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1'],
        ['_trackEvent', 'myna', 'uuid1-conversion', 'variant1'],
        ['_trackEvent', 'myna', 'uuid1-view', 'variant2'],
        ['_trackEvent', 'myna', 'uuid1-conversion', 'variant2']
      ]);
    });
  });

  it("should not record reward events if rewarded without a suggestion", function() {
    var myna = Myna.init({
      timeout: 25,
      experiments: [
        { uuid: 'uuid1', class: 'expt1', sticky: false }
      ]
    });

    myna.clearSuggestions();

    window._gaq = [];

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      myna.reward('uuid1', 1.0, success, error);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([]);
    });
  });

  it("should not record reward events if rewarded twice", function() {
    var myna = Myna.init({
      timeout: 25,
      experiments: [
        { uuid: 'uuid1', class: 'expt1', sticky: false }
      ]
    });

    myna.clearSuggestions();

    window._gaq = [];

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      myna.suggest('uuid1');
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1']
      ]);

      myna.reward('uuid1');
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1'],
        ['_trackEvent', 'myna', 'uuid1-conversion', 'variant1']
      ]);

      myna.reward('uuid1');
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1'],
        ['_trackEvent', 'myna', 'uuid1-conversion', 'variant1']
      ]);
    });
  });

  it("should not record reward events if there is a server error", function() {
    var myna = Myna.init({
      timeout: 25,
      experiments: [
        { uuid: 'uuid1', class: 'expt1', sticky: false }
      ]
    });

    myna.clearSuggestions();

    window._gaq = [];

    spyOn(Myna.$, "ajax").andCallFake(fakeProblematicServer());

    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      myna.suggest('uuid1');
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1']
      ]);

      myna.reward('uuid1', 1.0, success, error);
    });

    waits(myna.options.timeout);

    runs(function() {
      expect(window._gaq).toEqual([
        ['_trackEvent', 'myna', 'uuid1-view', 'variant1']
      ]);
    });
  });
});
