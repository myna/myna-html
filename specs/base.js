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

      return new Myna.$.Deferred().done(params.success).resolve({
        "typename" : "suggestion",
        "token"    : token,
        "choice"   : choice
      }).promise();
    } else if(/reward/.test(params.url)) {
      return new Myna.$.Deferred().done(params.success).resolve({
        "typename" : "ok"
      }).promise();
    } else {
      throw [ "bad url", params.url ];
    }
  }
}

function fakeProblematicServer(options) {
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

      return new Myna.$.Deferred().done(params.success).resolve({
        "typename" : "suggestion",
        "token"    : token,
        "choice"   : choice
      }).promise();
    } else if(/reward/.test(params.url)) {
      return new Myna.$.Deferred().done(params.success).resolve({
        "typename" : "problem",
        "subtype"  : 400,
        "messages" : [
          {"typename": "malformedRequest"},
          {"typename": "info", "message": "Reward token not present in cache"}
        ]
      }).promise();
    } else {
      throw [ "bad url", params.url ];
    }
  }
}

function fakeOfflineServer(options) {
  return function(params) {
    return new Myna.$.Deferred().done(params.success).promise();
  }
}

function resetDom() {
  Myna.$("#experiments *").each(function() {
    var self = Myna.$(this);

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
