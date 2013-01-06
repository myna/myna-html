describe("data-goal", function() {
  it("should detect click events", function() {
    var myna = new Myna({ experiments: [
      { uuid: 'uuid1', class: 'expt1', sticky: false }
    ]});

    var server = spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    $("#experiments").html('<button id="v1" class="expt1" data-goal="click">V1</button>');

    myna.initExperiments();

    $("#v1").get(0).click();

    var rewardOptions = server.mostRecentCall.args[0];
    expect(rewardOptions.url).toEqual('//api.mynaweb.com/v1/experiment/uuid1/reward?token=token1&amount=1');
    expect(rewardOptions.dataType).toEqual('jsonp');
    expect(rewardOptions.crossDomain).toEqual(true);
    expect(rewardOptions.success).toBeOfType('function');
    expect(rewardOptions.error).toBeOfType('function');
  });

  it("should not interrupt links loading pages", function() {
    var hashToRestore = window.location.hash || "#";

    var myna = new Myna({
      timeout: 25,
      experiments: [
        { uuid: 'uuid1', class: 'expt1', sticky: false }
      ]
    });

    var server = spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());

    runs(function() {
      window.location.hash = "#foo";
      $("#experiments").html('<a id="v1" href="#bar" class="expt1" data-goal="click">V1</a>');

      myna.initExperiments();

      $("#v1").get(0).click();
    });

    waits(myna.options.timeout);

    runs(function() {
      var rewardOptions = server.mostRecentCall.args[0];
      expect(rewardOptions.url).toEqual('//api.mynaweb.com/v1/experiment/uuid1/reward?token=token1&amount=1');
      expect(rewardOptions.dataType).toEqual('jsonp');
      expect(rewardOptions.crossDomain).toEqual(true);
      expect(rewardOptions.success).toBeOfType('function');
      expect(rewardOptions.error).toBeOfType('function');
      expect(window.location.hash).toEqual("#bar");
    });

    waits(myna.options.timeout);

    runs(function() {
      window.location.hash = hashToRestore;
    });
  });

  it("should detect page load events", function() {
    // Not sure how to implement this one yet:
    expect("tests for data-goal=\"load\"").toEqual("written");
  });
});