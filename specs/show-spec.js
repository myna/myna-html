describe("data-show", function() {
  it("should show/hide elements", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    Myna.$("#experiments").html(
      ' <span id="v1" class="expt1" data-show="variant1">V1</span> ' +
      ' <span id="v2" class="expt1" data-show="variant2">V2</span> '
    );

    expect(Myna.$("#v1").is(":visible")).toEqual(true);
    expect(Myna.$("#v2").is(":visible")).toEqual(true);

    this.myna.initExperiments();
    expect(Myna.$("#v1").is(":visible")).toEqual(true);
    expect(Myna.$("#v2").is(":visible")).toEqual(false);

    this.myna.initExperiments();
    expect(Myna.$("#v1").is(":visible")).toEqual(false);
    expect(Myna.$("#v2").is(":visible")).toEqual(true);
  });

  it("should work with multiple experiments", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false },
      { uuid: 'uuid2', class: 'expt2', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer({ choices: [ 'a', 'b', 'c' ] }));

    Myna.$("#experiments").html(
      ' <span id="v1" class="expt1" data-show="a">V1</span> ' +
      ' <span id="v2" class="expt1" data-show="b">V2</span> ' +
      ' <span id="v3" class="expt2" data-show="a">V1</span> ' +
      ' <span id="v4" class="expt2" data-show="c">V2</span> '
    );

    expect(Myna.$("#v1").is(":visible")).toEqual(true);
    expect(Myna.$("#v2").is(":visible")).toEqual(true);
    expect(Myna.$("#v3").is(":visible")).toEqual(true);
    expect(Myna.$("#v4").is(":visible")).toEqual(true);

    this.myna.initExperiments();
    expect(Myna.$("#v1").is(":visible")).toEqual(true);
    expect(Myna.$("#v2").is(":visible")).toEqual(false);
    expect(Myna.$("#v3").is(":visible")).toEqual(true);
    expect(Myna.$("#v4").is(":visible")).toEqual(false);

    this.myna.initExperiments();
    expect(Myna.$("#v1").is(":visible")).toEqual(false);
    expect(Myna.$("#v2").is(":visible")).toEqual(true);
    expect(Myna.$("#v3").is(":visible")).toEqual(false);
    expect(Myna.$("#v4").is(":visible")).toEqual(false);

    this.myna.initExperiments();
    expect(Myna.$("#v1").is(":visible")).toEqual(false);
    expect(Myna.$("#v2").is(":visible")).toEqual(false);
    expect(Myna.$("#v3").is(":visible")).toEqual(false);
    expect(Myna.$("#v4").is(":visible")).toEqual(true);
  });
});

describe("data-bind", function() {
  it("should alter an element's text", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer({ choices: [ '<v1>', '<v2>' ] }));

    Myna.$("#experiments").html(
      ' <span id="v1" class="expt1" data-bind="text"></span> '
    );

    expect(Myna.$("#v1").html()).toEqual("");

    this.myna.initExperiments();
    expect(Myna.$("#v1").html()).toEqual("&lt;v1&gt;");

    this.myna.initExperiments();
    expect(Myna.$("#v1").html()).toEqual("&lt;v2&gt;");
  });

  it("should alter an element's html", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer({ choices: [ '<v1>', '<v2>' ] }));

    Myna.$("#experiments").html(
      ' <span id="v1" class="expt1" data-bind="html"></span> '
    );

    expect(Myna.$("#v1").html()).toEqual("");

    this.myna.initExperiments();
    expect(Myna.$("#v1").html()).toEqual("<v1></v1>");

    this.myna.initExperiments();
    expect(Myna.$("#v1").html()).toEqual("<v2></v2>");
  });

  it("should add to an element's class", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    Myna.$("#experiments").html(
      ' <span id="v1" class="expt1" data-bind="class"></span> '
    );

    expect(Myna.$("#v1").attr("class")).toEqual("expt1");

    this.myna.initExperiments();
    expect(Myna.$("#v1").attr("class")).toEqual("expt1 variant1");

    this.myna.initExperiments();
    expect(Myna.$("#v1").attr("class")).toEqual("expt1 variant1 variant2");
  });

  it("should alter an element's title attribute", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    Myna.$("#experiments").html(
      ' <span id="v1" class="expt1" data-bind="@title"></span> '
    );

    expect(Myna.$("#v1").attr("title")).toEqual(null);

    this.myna.initExperiments();
    expect(Myna.$("#v1").attr("title")).toEqual("variant1");

    this.myna.initExperiments();
    expect(Myna.$("#v1").attr("title")).toEqual("variant2");
  });

  it("should work with multiple experiments", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false },
      { uuid: 'uuid2', class: 'expt2', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer({ choices: [ 'a', 'b', 'c' ] }));

    Myna.$("#experiments").html(
      ' <span id="v1" class="expt1" data-bind="@title"></span> ' +
      ' <span id="v2" class="expt2" data-bind="@style"></span> '
    );

    expect(Myna.$("#v1").attr("title")).toEqual(null);
    expect(Myna.$("#v1").attr("style")).toEqual(null);
    expect(Myna.$("#v2").attr("title")).toEqual(null);
    expect(Myna.$("#v2").attr("style")).toEqual(null);

    this.myna.initExperiments();
    expect(Myna.$("#v1").attr("title")).toEqual("a");
    expect(Myna.$("#v1").attr("style")).toEqual(null);
    expect(Myna.$("#v2").attr("title")).toEqual(null);
    expect(Myna.$("#v2").attr("style")).toEqual("a");

    this.myna.initExperiments();
    expect(Myna.$("#v1").attr("title")).toEqual("b");
    expect(Myna.$("#v1").attr("style")).toEqual(null);
    expect(Myna.$("#v2").attr("title")).toEqual(null);
    expect(Myna.$("#v2").attr("style")).toEqual("b");
  });
});