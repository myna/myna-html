function fakeWorkingServer(options) {
  options = options || {};

  var tokenNum  = 1;
  var choices   = options.choices || ["variant1", "variant2"];
  var choiceNum = 0;

  return function(params) {
    if(/suggest/.test(params.url)) {
      var token  = "token" + tokenNum;
      var choice = choices[choiceNum];

      tokenNum   = tokenNum + 1;
      choiceNum  = (choiceNum + 1) % choices.length;

      return new $.Deferred().done(params.success).resolve({
        "typename" : "suggestion",
        "token"    : token,
        "choice"   : choice
      }).promise();
    } else if(/reward/.test(params.url)) {
      return new $.Deferred().done(params.success).resolve({
        "typename" : "ok"
      }).promise();
    } else {
      throw [ "bad url", params.url ];
    }
  }
}

function fakeOfflineServer(options) {
  return function(params) {
    return new $.Deferred().done(params.success).promise();
  }
}

function resetDom() {
  $("#experiments *").each(function() {
    var self = $(this);

    if(self.data("show")) {
      self.show();
    }

    if(self.data("goal")) {
      self.off("click");
    }
  });
}

function addExperiments() {
  // Add #experiments
  $('body').append('<div id="experiments" style="padding: 20px 0; text-align: center; font-family: sans-serif; font-size: .8em"> \
    Test data: \
    <span class="expt1" data-show="variant1">Ex1v1</span> \
    <span class="expt1" data-show="variant2">Ex1v2</span> \
    <a class="expt1" data-goal="click" href="#">Ex1goal</a> \
    <span class="expt2" data-show="variant1">Ex2v1</span> \
    <span class="expt2" data-show="variant2">Ex2v2</span> \
    <a class="expt2" data-goal="click" href="#">Ex2goal</a> \
    </div>');
}

function removeExperiments() {
  // Remove #experiments
  $('#experiments').remove();
}


beforeEach(function() {
  this.addMatchers({
    toBeOfType: function(expected) {
      return typeof(this.actual) == expected;
    }
  });
  addExperiments();
});

afterEach(function() {
  removeExperiments();
})
