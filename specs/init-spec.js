describe("Myna.init", function() {
  it("should create a Myna object with the correct options", function() {
    expect(Myna.defaults.sticky).toEqual(true);
    expect(Myna.defaults.cookieOptions.expires).toEqual(7);
    expect(Myna.defaults.cookieOptions.path).toEqual("/");

    var myna = Myna.init({ cookieOptions: { path: "/foo" }})

    expect(myna.options.sticky).toEqual(true);
    expect(myna.options.cookieOptions.expires).toEqual(7);
    expect(myna.options.cookieOptions.path).toEqual("/foo");
  });

  it("should not affect jQuery", function() {
    var numMethods1a = Object.keys($).length;
    var numMethods1b = Object.keys($.fn).length;

    var myna = Myna.init({});

    var numMethods2a = Object.keys($).length;
    var numMethods2b = Object.keys($.fn).length;

    expect(numMethods1a).toEqual(numMethods2a);
    expect(numMethods1b).toEqual(numMethods2b);
  });

  it("should create a Myna object with the correct Google Analytics options", function() {
    expect(Myna.defaults.googleAnalytics.enabled).toEqual(true);

    var myna = window.myna = Myna.init({
      experiments: [
        { uuid: "uuid1", class: "class1", },
        { uuid: "uuid2", class: "class2", googleAnalytics: { enabled: true, viewEvent: "foo" } },
        { uuid: "uuid3", class: "class3", googleAnalytics: { enabled: false, conversionEvent: "bar" } }
      ]
    });

    console.log(myna.options);
    console.log(myna.exptOptions("uuid1"));

    expect(myna.exptGoogleOption("uuid1", "enabled")).toEqual(true);
    expect(myna.exptGoogleOption("uuid2", "enabled")).toEqual(true);
    expect(myna.exptGoogleOption("uuid3", "enabled")).toEqual(false);

    expect(myna.exptGoogleOption("uuid1", "viewEvent")).toEqual("uuid1-view");
    expect(myna.exptGoogleOption("uuid2", "viewEvent")).toEqual("foo");
    expect(myna.exptGoogleOption("uuid3", "viewEvent")).toEqual("uuid3-view");

    expect(myna.exptGoogleOption("uuid1", "conversionEvent")).toEqual("uuid1-conversion");
    expect(myna.exptGoogleOption("uuid2", "conversionEvent")).toEqual("uuid2-conversion");
    expect(myna.exptGoogleOption("uuid3", "conversionEvent")).toEqual("bar");
  });

  it("should create default callbacks", function() {
    var myna = Myna.init({
      experiments: [{
        uuid: 'uuid1',
        class: 'myna'
      }]
    });

    console.log(myna.options);

    expect(typeof myna.exptCallback("uuid1", "beforeSave")).toBe("function");
    expect(typeof myna.exptCallback("uuid1", "beforeSuggest")).toBe("function");
    expect(typeof myna.exptCallback("uuid1", "target")).toBe("function");
  });

  it("should create globally-scoped callbacks correctly", function() {
    var a = function() {};
    var b = function() {};
    var c = function() {};

    var myna = Myna.init({
      experiments: [{
        uuid: 'uuid1',
        class: 'myna',
      }],
      callbacks: {
        beforeSave: a,
        beforeSuggest: b,
        target: c
      }
    });

    expect(myna.exptCallback("uuid1", "beforeSave")).toBe(a);
    expect(myna.exptCallback("uuid1", "beforeSuggest")).toBe(b);
    expect(myna.exptCallback("uuid1", "target")).toBe(c);
  });

  it("should create experiment-scoped callbacks correctly", function() {
    var a1 = function() {};
    var b1 = function() {};
    var c1 = function() {};
    var a2 = function() {};
    var b2 = function() {};
    var c2 = function() {};

    var myna = Myna.init({
      experiments: [{
        uuid: 'uuid1',
        class: 'myna',
        callbacks: {
          beforeSave: a2,
          beforeSuggest: b2,
          target: c2
        }
      }],
      callbacks: {
        beforeSave: a1,
        beforeSuggest: b1,
        target: c1
      }
    });

    expect(myna.exptCallback("uuid1", "beforeSave")).toBe(a2);
    expect(myna.exptCallback("uuid1", "beforeSuggest")).toBe(b2);
    expect(myna.exptCallback("uuid1", "target")).toBe(c2);
  });
});
