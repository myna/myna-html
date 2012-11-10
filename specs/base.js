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

beforeEach(function() {
  console.log("----------");

  this.addMatchers({
    toBeOfType: function(expected) {
      return typeof(this.actual) == expected;
    }
  });
});
