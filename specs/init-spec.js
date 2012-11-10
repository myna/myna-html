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
});
