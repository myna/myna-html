function fakeWorkingServer(options) {
  options = options || {};

  var choices = options.choices || ["variant1", "variant2"];
  var choiceNums = {};
  var tokenNums = {};

  function choiceNum(suggestUrl) {
    var last = choiceNums[suggestUrl];
    var curr = typeof last == "undefined" ? 0 : (last + 1) % choices.length;
    choiceNums[suggestUrl] = curr;
    return curr;
  }

  function tokenNum(suggestUrl) {
    var last = tokenNums[suggestUrl];
    var curr = typeof last == "undefined" ? 1 : last + 1;
    tokenNums[suggestUrl] = curr;
    return curr;
  }

  return function(params) {
    if(/suggest/.test(params.url)) {
      var choice = choices[choiceNum(params.url)];
      var token  = "token" + tokenNum(params.url);

      console.log(" ### ");
      console.log(" === ", choiceNums);
      console.log(" === ", tokenNums);

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

beforeEach(function() {
  this.addMatchers({
    toBeOfType: function(expected) {
      return typeof(this.actual) == expected;
    }
  });
});
