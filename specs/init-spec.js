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

  it("should create default callbacks", function() {
    var myna = Myna.init({
      experiments: [{
        uuid: 'uuid1',
        class: 'myna'
      }]
    });

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
