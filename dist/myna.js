/*!
Myna jQuery Client Library
Copyright 2012 Myna Ltd
Released under the Apache 2.0 License
*/

var initPlugin,
  __slice = [].slice;

initPlugin = function($) {
  var eachVariantAndGoal, initRewardHandlers, loadSuggestions, saveSuggestions, showVariant,
    _this = this;
  $.mynaDefaults = {
    apiRoot: "http://api.mynaweb.com",
    sticky: true,
    cookieName: "myna",
    cookieOptions: {
      expires: 7
    }
  };
  $.mynaLog = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log(args) : void 0 : void 0;
  };
  $.mynaError = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    $.mynaLog.apply($, args);
    throw args;
  };
  $.mynaSuggestions = {};
  loadSuggestions = function() {
    var cookieName;
    $.mynaLog("loadSuggestions");
    cookieName = $.mynaDefaults.cookieName;
    $.mynaLog(" - ", cookieName);
    try {
      return JSON.parse($.cookie(cookieName)) || {};
    } catch (exn) {
      return {};
    }
  };
  saveSuggestions = function(suggestions) {
    var cookieName, cookieOptions, cookieValue;
    $.mynaLog("saveSuggestions", suggestions);
    cookieName = $.mynaDefaults.cookieName;
    cookieValue = JSON.stringify(suggestions);
    cookieOptions = $.mynaDefaults.cookieOptions;
    $.mynaLog(" - ", cookieName, cookieValue, cookieOptions);
    $.cookie(cookieName, cookieValue);
    $.mynaLog(" - ", document.cookie);
  };
  $.mynaSaveSuggestion = function(uuid, choice, token, rewarded) {
    var suggestions;
    if (rewarded == null) {
      rewarded = false;
    }
    $.mynaLog("mynaSaveSuggestion", uuid, choice, token, rewarded);
    suggestions = loadSuggestions();
    suggestions[uuid] = {
      choice: choice,
      token: token,
      rewarded: rewarded
    };
    saveSuggestions(suggestions);
  };
  $.mynaDeleteSuggestion = function(uuid) {
    var suggestions;
    $.mynaLog("mynaDeleteSuggestion", uuid);
    suggestions = loadSuggestions();
    delete suggestions[uuid];
    saveSuggestions(suggestions);
  };
  $.mynaLoadSuggestion = function(uuid) {
    $.mynaLog("mynaLoadSuggestion", uuid);
    return loadSuggestions()[uuid] || null;
  };
  $.mynaSuggest = function(options) {
    var error, success, url, uuid;
    options = $.extend({}, $.mynaDefaults, options);
    success = options.success || (function() {});
    error = options.error || (function() {});
    uuid = options.uuid || $.mynaError("mynaSuggest: no uuid");
    url = "" + options.apiRoot + "/v1/experiment/" + uuid + "/suggest";
    $.ajax({
      url: url,
      dataType: "jsonp",
      crossDomain: true,
      success: function(data, textStatus, jqXHR) {
        if (data.typename === "suggestion") {
          $.mynaSaveSuggestion(uuid, data.choice, data.token);
          success({
            uuid: uuid,
            choice: data.choice,
            token: data.token
          });
        } else {
          $.mynaLog("mynaSuggest received " + data.typename, data, textStatus, jqXHR);
          error(data, textStatus, jqXHR);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $.mynaLog("mynaSuggest received error", jqXHR, textStatus, errorThrown);
        error({}, textStatus, jqXHR, errorThrown);
      }
    });
  };
  $.mynaReward = function(options) {
    var amount, choice, error, stored, success, token, url, uuid;
    options = $.extend({}, $.mynaDefaults, options);
    success = options.success || (function() {});
    error = options.error || (function() {});
    uuid = options.uuid || $.mynaError("mynaReward: no uuid");
    stored = $.mynaLoadSuggestion(uuid);
    if (stored && !stored.rewarded) {
      token = stored.token;
      choice = stored.choice;
      $.mynaSaveSuggestion(uuid, choice, token, true);
      amount = options.amount || 1;
      url = "" + options.apiRoot + "/v1/experiment/" + uuid + "/reward?token=" + token + "&amount=" + amount;
      $.ajax({
        url: url,
        dataType: "jsonp",
        crossDomain: true,
        success: function(data, textStatus, jqXHR) {
          if (data.typename === "ok") {
            $.mynaLog("mynaReward received ok", data, textStatus, jqXHR);
            $.mynaSaveSuggestion(uuid, choice, token, true);
            success({
              uuid: uuid,
              choice: choice,
              token: token,
              amount: amount
            });
          } else {
            $.mynaLog("mynaReward received " + data.typename, data, textStatus, jqXHR);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $.mynaLog("mynaReward received error", jqXHR, textStatus, errorThrown);
          $.mynaDeleteSuggestion(uuid);
          error({}, textStatus, jqXHR, errorThrown);
        }
      });
    } else {
      success();
    }
  };
  $.fn.mynaDefaultAction = function() {
    var self;
    self = $(this);
    if (self.is("a")) {
      return window.location = self.attr("href");
    }
  };
  $.mynaWrapHandler = function(uuid, handler) {
    $.mynaLog("wrapHandler", uuid, handler);
    return function(evt) {
      var stored;
      $.mynaLog("wrappedHandler", evt);
      stored = $.mynaLoadSuggestion(uuid);
      if (stored && !stored.rewarded) {
        $.mynaLog(" - rewarding and retriggering");
        evt.stopPropagation();
        evt.preventDefault();
        $.mynaReward({
          uuid: uuid,
          success: function() {
            return $(evt.target).trigger(evt["type"]);
          },
          error: function() {
            return $(evt.target).trigger(evt["type"]);
          }
        });
      } else {
        $.mynaLog(" - retriggering");
        handler(evt);
        $(evt.target).mynaDefaultAction();
      }
    };
  };
  $.fn.mynaClick = function() {
    var args, eventData, handler, uuid;
    uuid = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    $.mynaLog.apply($, ["mynaClick", uuid].concat(__slice.call(args)));
    switch (args.length) {
      case 0:
        return this.click($.mynaWrapHandler(uuid, (function() {})));
      case 1:
        handler = args[0];
        return this.click($.mynaWrapHandler(uuid, handler));
      default:
        eventData = args[0];
        handler = args[1];
        return this.click(eventData, $.mynaWrapHandler(uuid, handler));
    }
  };
  eachVariantAndGoal = function(cssClass, handler) {
    return $("." + cssClass).each(function(index, elem) {
      var goal, self, variant;
      self = $(elem);
      variant = self.data("variant");
      goal = self.data("goal");
      return handler.call(self, variant, goal);
    });
  };
  showVariant = function(cssClass, choice) {
    if (choice == null) {
      choice = null;
    }
    return eachVariantAndGoal(cssClass, function(variant, goal) {
      if (variant) {
        if (choice && (variant === choice)) {
          return this.show();
        } else {
          return this.hide();
        }
      }
    });
  };
  initRewardHandlers = function(uuid, cssClass) {
    return eachVariantAndGoal(cssClass, function(variant, goal) {
      switch (goal) {
        case "click":
          return this.mynaClick(uuid);
      }
    });
  };
  $.mynaInit = function(options) {
    var cssClass, sticky, stored, uuid;
    uuid = options["uuid"];
    cssClass = options["class"];
    sticky = options["sticky"];
    if (!uuid || !cssClass) {
      $.mynaLog("mynaInit: no uuid or CSS class", uuid, cssClass);
      return;
    }
    stored = $.mynaLoadSuggestion(uuid);
    $.mynaLog("mynaInit", uuid, cssClass, sticky, stored);
    if (stored && (sticky || !stored.rewarded)) {
      $.mynaLog(" - recalling suggestion", stored.choice);
      showVariant(cssClass, stored.choice);
      initRewardHandlers(uuid, cssClass);
    } else {
      $.mynaLog(" - fetching suggestion");
      $.mynaSuggest({
        uuid: uuid,
        success: function(data) {
          showVariant(cssClass, data.choice);
          initRewardHandlers(uuid, cssClass);
        },
        error: function() {
          showDefaultVariant(cssClass);
        }
      });
    }
  };
  return $.myna = function(options) {
    options = $.extend({}, $.mynaDefaults, options);
    $.mynaLog("myna", options);
    return $.each(options.experiments, function(index, exptOptions) {
      exptOptions = $.extend({
        sticky: options.sticky
      }, exptOptions);
      return $.mynaInit(exptOptions);
    });
  };
};

initPlugin(window.jQuery, window, document);
