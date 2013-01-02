describe("data-show", function() {

  it("should show/hide elements", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    $("#experiments").html(
      ' <span id="v1" class="expt1" data-show="variant1">V1</span> ' +
      ' <span id="v2" class="expt1" data-show="variant2">V2</span> '
    );

    expect($("#v1").is(":visible")).toEqual(true);
    expect($("#v2").is(":visible")).toEqual(true);

    this.myna.initExperiments();
    expect($("#v1").is(":visible")).toEqual(true);
    expect($("#v2").is(":visible")).toEqual(false);

    this.myna.initExperiments();
    expect($("#v1").is(":visible")).toEqual(false);
    expect($("#v2").is(":visible")).toEqual(true);
  });

  it("should work with multiple experiments", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false },
      { uuid: 'uuid2', class: 'expt2', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer({ choices: [ 'a', 'b', 'c' ] }));

    $("#experiments").html(
      ' <span id="v1" class="expt1" data-show="a">V1</span> ' +
      ' <span id="v2" class="expt1" data-show="c">V2</span> ' +
      ' <span id="v3" class="expt2" data-show="b">V1</span> ' +
      ' <span id="v4" class="expt2" data-show="a">V2</span> '
    );

    expect($("#v1").is(":visible")).toEqual(true);
    expect($("#v2").is(":visible")).toEqual(true);
    expect($("#v3").is(":visible")).toEqual(true);
    expect($("#v4").is(":visible")).toEqual(true);

    this.myna.initExperiments();
    expect($("#v1").is(":visible")).toEqual(true);
    expect($("#v2").is(":visible")).toEqual(false);
    expect($("#v3").is(":visible")).toEqual(true);
    expect($("#v4").is(":visible")).toEqual(false);

    this.myna.initExperiments();
    expect($("#v1").is(":visible")).toEqual(false);
    expect($("#v2").is(":visible")).toEqual(true);
    expect($("#v3").is(":visible")).toEqual(false);
    expect($("#v4").is(":visible")).toEqual(true);
  });
});

describe("data-bind", function() {
  it("should alter an element's text", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer({ choices: [ '<v1>', '<v2>' ] }));

    $("#experiments").html(
      ' <span id="v1" class="expt1" data-bind="text"></span> '
    );

    expect($("#v1").html()).toEqual("");

    this.myna.initExperiments();
    expect($("#v1").html()).toEqual("&lt;v1&gt;");

    this.myna.initExperiments();
    expect($("#v1").html()).toEqual("&lt;v2&gt;");
  });

  it("should alter an element's html", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer({ choices: [ '<v1>', '<v2>' ] }));

    $("#experiments").html(
      ' <span id="v1" class="expt1" data-bind="html"></span> '
    );

    expect($("#v1").html()).toEqual("");

    this.myna.initExperiments();
    expect($("#v1").html()).toEqual("<v1></v1>");

    this.myna.initExperiments();
    expect($("#v1").html()).toEqual("<v2></v2>");
  });

  it("should add to an element's class", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    $("#experiments").html(
      ' <span id="v1" class="expt1" data-bind="class"></span> '
    );

    expect($("#v1").attr("class")).toEqual("expt1");

    this.myna.initExperiments();
    expect($("#v1").attr("class")).toEqual("expt1 variant1");

    this.myna.initExperiments();
    expect($("#v1").attr("class")).toEqual("expt1 variant1 variant2");
  });

  it("should alter an element's title attribute", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    $("#experiments").html(
      ' <span id="v1" class="expt1" data-bind="@title"></span> '
    );

    expect($("#v1").attr("title")).toEqual(null);

    this.myna.initExperiments();
    expect($("#v1").attr("title")).toEqual("variant1");

    this.myna.initExperiments();
    expect($("#v1").attr("title")).toEqual("variant2");
  });

  it("should work with multiple experiments", function() {
    this.myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false },
      { uuid: 'uuid2', class: 'expt2', sticky: false }
    ]});

    spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer({ choices: [ 'a', 'b', 'c' ] }));

    $("#experiments").html(
      ' <span id="v1" class="expt1" data-bind="@title"></span> ' +
      ' <span id="v2" class="expt2" data-bind="@style"></span> '
    );

    expect($("#v1").attr("title")).toEqual(null);
    expect($("#v1").attr("style")).toEqual(null);
    expect($("#v2").attr("title")).toEqual(null);
    expect($("#v2").attr("style")).toEqual(null);

    this.myna.initExperiments();
    expect($("#v1").attr("title")).toEqual("a");
    expect($("#v1").attr("style")).toEqual(null);
    expect($("#v2").attr("title")).toEqual(null);
    expect($("#v2").attr("style")).toEqual("b");

    this.myna.initExperiments();
    expect($("#v1").attr("title")).toEqual("c");
    expect($("#v1").attr("style")).toEqual(null);
    expect($("#v2").attr("title")).toEqual(null);
    expect($("#v2").attr("style")).toEqual("a");
  });
});
