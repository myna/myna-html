describe("experiments with target() == false", function() {
  beforeEach(function() {
    this.myna = Myna.init({
      timeout: 25,
      experiments: [
        {
          uuid: 'uuid1',
          class: 'expt1',
          default: 'default1',
          callbacks: {
            target: function() { return false; }
          },
        },
        {
          uuid: 'uuid2',
          class: 'expt2',
          callbacks: {
            target: function() { return false; }
          }
        }
      ]
    });
    this.myna.clearSuggestions();
  });

  it("should not call the server", function() {
    var server  = spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());
    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    runs(function() {
      this.myna.suggest('uuid1', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      this.myna.suggest('uuid1', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(server.argsForCall).toEqual([]);
      expect(success.argsForCall).toEqual([
        [ { uuid : 'uuid1', choice : 'default1', token : null, skipped : true, rewarded : false } ],
        [ { uuid : 'uuid1', choice : 'default1', token : null, skipped : true, rewarded : false } ]
      ]);
      expect(error.argsForCall).toEqual([]);
    });
  });

  it("should infer the default variant from the DOM if possible", function() {
    var server  = spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());
    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    $("#experiments").html('<span class="expt2" data-show="variant1">V1</span>');

    runs(function() {
      this.myna.suggest('uuid2', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(server.argsForCall).toEqual([]);
      expect(success.argsForCall).toEqual([
        [ { uuid : 'uuid2', choice : 'variant1', token : null, skipped : true, rewarded : false } ]
      ]);
      expect(error.argsForCall).toEqual([]);
    });
  });

  it("should call the error handler if a default variant cannot be found", function() {
    var server  = spyOn(Myna.$, "ajax").andCallFake(fakeWorkingServer());
    var success = jasmine.createSpy("success");
    var error   = jasmine.createSpy("error");

    $("#experiments").html('');

    runs(function() {
      this.myna.suggest('uuid2', success, error);
    });

    waits(this.myna.options.timeout);

    runs(function() {
      expect(server.argsForCall).toEqual([]);
      expect(success.argsForCall).toEqual([]);
      expect(error.argsForCall).toEqual([
        [ null, "no-default-suggestion", "uuid2" ]
      ]);
    });
  });
});

function testTargetFunction(fn, expected) {
  var numTrues = 0;
  var numFalses = 0;
  for(var i = 0; i < 1000; i++) {
    if(fn()) {
      numTrues++;
    } else {
      numFalses++;
    }
  }

  var actual = numTrues / (numTrues + numFalses);

  expect(actual).toBeGreaterThan(expected - 0.1);
  expect(actual).toBeLessThan(expected + 0.1);
}

function createTargetFunction(expected) {
  return function() {
    return Math.random() < expected;
  }
}

describe("skipChance (deprecated)", function() {
  it("can be completely omitted", function() {
    var myna = Myna.init({
      experiments: [{
        uuid: 'uuid1', class: 'expt1'
      }]
    });

    testTargetFunction(myna.exptCallback('uuid1', 'target'), 1.0);
  });

  it("provides a global target callback", function() {
    var myna = Myna.init({
      skipChance: 0.2,
      experiments: [
        { uuid: 'uuid1', class: 'expt1' },
        { uuid: 'uuid2', class: 'expt2' }
      ]
    });

    testTargetFunction(myna.exptCallback('uuid1', 'target'), 0.2);
    testTargetFunction(myna.exptCallback('uuid2', 'target'), 0.2);
  });

  it("does not override a manually specified global callback", function() {
    var myna = Myna.init({
      skipChance: 0.2,
      callbacks: { target: createTargetFunction(0.8) },
      experiments: [
        { uuid: 'uuid1', class: 'expt1' },
        { uuid: 'uuid2', class: 'expt2' }
      ]
    });

    testTargetFunction(myna.exptCallback('uuid1', 'target'), 0.8);
    testTargetFunction(myna.exptCallback('uuid2', 'target'), 0.8);
  });

  it("provides a per-experiment callback", function() {
    var myna = Myna.init({
      skipChance: 0.2,
      callbacks: { target: createTargetFunction(0.8) },
      experiments: [
        { uuid: 'uuid1', class: 'expt1', skipChance: 0.2 },
        { uuid: 'uuid2', class: 'expt2' },
      ]
    });

    testTargetFunction(myna.exptCallback('uuid1', 'target'), 0.2);
    testTargetFunction(myna.exptCallback('uuid2', 'target'), 0.8);
  });

  it("does not override manually specified per-experiment callbacks", function() {
    var myna = Myna.init({
      skipChance: 0.2,
      callbacks: { target: createTargetFunction(0.8) },
      experiments: [
        { uuid: 'uuid1', class: 'expt1', skipChance: 0.2, callbacks: { target: createTargetFunction(0.8) } },
        { uuid: 'uuid2', class: 'expt2', skipChance: 0.2, callbacks: { target: createTargetFunction(0.5) } },
      ]
    });

    testTargetFunction(myna.exptCallback('uuid1', 'target'), 0.8);
    testTargetFunction(myna.exptCallback('uuid2', 'target'), 0.5);
  });
});