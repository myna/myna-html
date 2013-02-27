/*!
 * Myna for HTML v1.3 (no dependencies)
 * Copyright 2012 Myna Ltd
 * License: BSD 3-clause (http://opensource.org/licenses/BSD-3-Clause)
 * Published: 2013-02-27
 * Dependencies:
 *  - jQuery 1.5+ http://jquery.com/download
 *  - JSON.{parse,stringify} https://raw.github.com/douglascrockford/JSON-js/master/json2.js
 *  - jQuery Cookie https://github.com/carhartl/jquery-cookie
 */

var Myna,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

Myna = (function(window, document, $) {
  return Myna = (function() {

    Myna.$ = $;

    Myna.defaults = {
      debug: false,
      apiRoot: "//api.mynaweb.com",
      timeout: 1200,
      cssClass: "myna",
      dataPrefix: null,
      sticky: true,
      cookieName: "myna",
      cookieOptions: {
        path: "/",
        expires: 7
      },
      experiments: [],
      skipChance: 0.0,
      googleAnalytics: {
        enabled: true
      },
      callbacks: {
        beforeSave: (function(stored) {
          return stored;
        }),
        beforeSuggest: (function(stored, fromCookie) {}),
        target: null
      }
    };

    Myna.init = function(options) {
      var myna;
      if (options == null) {
        options = {
          experiments: []
        };
      }
      myna = new Myna(options);
      $(document).ready(function() {
        return myna.initExperiments();
      });
      return myna;
    };

    function Myna(options) {
      var exptDefaults, expts, _ref, _ref1, _ref2, _ref3,
        _this = this;
      if (options == null) {
        options = {};
      }
      this.initExperiments = __bind(this.initExperiments, this);

      this.initExperiment = __bind(this.initExperiment, this);

      this.initGoals = __bind(this.initGoals, this);

      this.showVariant = __bind(this.showVariant, this);

      this.eachVariantAndGoal = __bind(this.eachVariantAndGoal, this);

      this.on = __bind(this.on, this);

      this.wrapHandler = __bind(this.wrapHandler, this);

      this.reward = __bind(this.reward, this);

      this.rewardAjax = __bind(this.rewardAjax, this);

      this.suggest = __bind(this.suggest, this);

      this.suggestSkip = __bind(this.suggestSkip, this);

      this.suggestAjax = __bind(this.suggestAjax, this);

      this.trackGoogleRewardEvent = __bind(this.trackGoogleRewardEvent, this);

      this.trackGoogleSuggestEvent = __bind(this.trackGoogleSuggestEvent, this);

      this.ajax = __bind(this.ajax, this);

      this.loadSuggestion = __bind(this.loadSuggestion, this);

      this.deleteSuggestion = __bind(this.deleteSuggestion, this);

      this.saveSuggestion = __bind(this.saveSuggestion, this);

      this.clearSuggestions = __bind(this.clearSuggestions, this);

      this.saveSuggestions = __bind(this.saveSuggestions, this);

      this.loadSuggestions = __bind(this.loadSuggestions, this);

      this.defaultVariant = __bind(this.defaultVariant, this);

      this.target = __bind(this.target, this);

      this.exptCallback = __bind(this.exptCallback, this);

      this.exptGoogleOption = __bind(this.exptGoogleOption, this);

      this.exptOption = __bind(this.exptOption, this);

      this.exptOptions = __bind(this.exptOptions, this);

      this.error = __bind(this.error, this);

      this.log = __bind(this.log, this);

      this.options = $.extend(true, {}, Myna.defaults, options);
      this.log("constructor", options);
      exptDefaults = {
        cssClass: this.options.cssClass,
        dataPrefix: this.options.dataPrefix,
        sticky: this.options.sticky,
        callbacks: {
          beforeSave: (_ref = this.options.callbacks) != null ? _ref.beforeSave : void 0,
          beforeSuggest: (_ref1 = this.options.callbacks) != null ? _ref1.beforeSuggest : void 0,
          target: ((_ref2 = this.options.callbacks) != null ? _ref2.target : void 0) ? (_ref3 = this.options.callbacks) != null ? _ref3.target : void 0 : this.options.skipChance ? function() {
            return Math.random() < _this.options.skipChance;
          } : function() {
            return true;
          }
        },
        timeout: this.options.timeout
      };
      expts = {};
      $.each(this.options.experiments, function(index, options) {
        var cssClass, googleDefaults, sticky, uuid, _ref4;
        uuid = options.uuid;
        cssClass = options['class'];
        sticky = options.sticky;
        if (options.skipChance) {
          console.log("per-experiment skipChance", options, _this.options);
          if (!((_ref4 = options.callbacks) != null ? _ref4.target : void 0)) {
            options.callbacks = $.extend(true, {}, options.callbacks || {}, {
              target: function() {
                return Math.random() < options.skipChance;
              }
            });
          }
        }
        googleDefaults = {
          googleAnalytics: {
            enabled: _this.options.googleAnalytics.enabled,
            viewEvent: options.uuid ? "" + options.uuid + "-view" : null,
            conversionEvent: options.uuid ? "" + options.uuid + "-conversion" : null
          }
        };
        if (uuid && cssClass) {
          return expts[uuid] = $.extend(true, {}, exptDefaults, googleDefaults, options);
        } else {
          return _this.log("no uuid or CSS class", options, uuid, cssClass, sticky);
        }
      });
      this.options.experiments = expts;
    }

    Myna.prototype.log = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (this.options.debug) {
        return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log.apply(console, args) : void 0 : void 0;
      }
    };

    Myna.prototype.error = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.log.apply(this, args);
      throw args;
    };

    Myna.prototype.data = function(jq, prefix, name) {
      return jq.data(prefix ? "" + prefix + "-" + name : name);
    };

    Myna.prototype.exptOptions = function(uuid) {
      return this.options.experiments[uuid] || this.error("no such experiment", uuid);
    };

    Myna.prototype.exptOption = function(uuid, name, defaultFunc) {
      var ans;
      if (defaultFunc == null) {
        defaultFunc = function() {
          return void 0;
        };
      }
      ans = this.exptOptions(uuid)[name];
      if (ans != null) {
        return ans;
      } else {
        return defaultFunc();
      }
    };

    Myna.prototype.exptGoogleOption = function(uuid, name, defaultFunc) {
      var ans, _ref;
      if (defaultFunc == null) {
        defaultFunc = function() {
          return void 0;
        };
      }
      ans = (_ref = this.exptOptions(uuid).googleAnalytics) != null ? _ref[name] : void 0;
      if (ans != null) {
        return ans;
      } else {
        return defaultFunc();
      }
    };

    Myna.prototype.exptCallback = function(uuid, name, defaultFunc) {
      var ans, _ref;
      if (defaultFunc == null) {
        defaultFunc = function() {
          return void 0;
        };
      }
      ans = (_ref = this.exptOptions(uuid).callbacks) != null ? _ref[name] : void 0;
      if (ans != null) {
        return ans;
      } else {
        return defaultFunc();
      }
    };

    Myna.prototype.target = function(uuid) {
      var func;
      func = this.exptCallback(uuid, "target", (function() {
        return function() {
          return 1.0;
        };
      }));
      return func();
    };

    Myna.prototype.defaultVariant = function(uuid) {
      var ans, cssClass, dataPrefix, options;
      options = this.exptOptions(uuid);
      ans = options["default"];
      if (!ans) {
        cssClass = options["class"];
        dataPrefix = options["dataPrefix"];
        this.eachVariantAndGoal(cssClass, dataPrefix, function(show, bind, goal) {
          if (show && !ans) {
            return ans = show;
          }
        });
      }
      return ans;
    };

    Myna.prototype.loadSuggestions = function() {
      var cookieName, savedPath;
      this.log("loadSuggestions");
      try {
        cookieName = this.options.cookieName;
        savedPath = $.cookie.defaults.path;
        $.cookie.defaults.path = this.options.cookieOptions.path;
        this.log(" - ", cookieName);
        return JSON.parse($.cookie(cookieName)) || {};
      } catch (exn) {
        return {};
      } finally {
        $.cookie.defaults.path = savedPath;
      }
    };

    Myna.prototype.saveSuggestions = function(suggestions) {
      var cookie, cookieName, cookieOptions, cookieValue, savedPath;
      this.log("saveSuggestions", suggestions);
      try {
        cookieName = this.options.cookieName;
        cookieValue = JSON.stringify(suggestions);
        cookieOptions = this.options.cookieOptions;
        savedPath = $.cookie.defaults.path;
        $.cookie.defaults.path = this.options.cookieOptions.path;
        this.log(" - ", cookieName, cookieValue, cookieOptions);
        cookie = $.cookie(cookieName, cookieValue, cookieOptions);
        this.log(" - ", document.cookie);
        return cookie;
      } finally {
        $.cookie.defaults.path = savedPath;
      }
    };

    Myna.prototype.clearSuggestions = function() {
      var cookieName, savedPath;
      this.log("clearSuggestions");
      try {
        savedPath = $.cookie.defaults.path;
        $.cookie.defaults.path = this.options.cookieOptions.path;
        cookieName = this.options.cookieName;
        return $.removeCookie(cookieName);
      } finally {
        $.cookie.defaults.path = savedPath;
      }
    };

    Myna.prototype.saveSuggestion = function(uuid, choice, token, skipped, rewarded) {
      var beforeSave, customised, stored, suggestions, uncustomised;
      if (skipped == null) {
        skipped = false;
      }
      if (rewarded == null) {
        rewarded = false;
      }
      this.log("saveSuggestion", uuid, choice, token, skipped, rewarded);
      beforeSave = this.exptCallback(uuid, "beforeSave", (function() {
        return function(x) {
          return x;
        };
      }));
      uncustomised = {
        uuid: uuid,
        choice: choice,
        token: token,
        skipped: skipped,
        rewarded: rewarded
      };
      customised = beforeSave(uncustomised);
      stored = typeof customised === "object" ? customised : uncustomised;
      this.log(" - uncustomised", uncustomised);
      this.log(" - customised", customised);
      this.log(" - stored", stored);
      suggestions = this.loadSuggestions();
      suggestions[uuid] = stored;
      this.saveSuggestions(suggestions);
      return stored;
    };

    Myna.prototype.deleteSuggestion = function(uuid) {
      var suggestions;
      this.log("deleteSuggestion", uuid);
      suggestions = this.loadSuggestions();
      delete suggestions[uuid];
      this.saveSuggestions(suggestions);
    };

    Myna.prototype.loadSuggestion = function(uuid) {
      this.log("loadSuggestion", uuid);
      return this.loadSuggestions()[uuid] || null;
    };

    Myna.prototype.ajax = function(url, success, error) {
      var errorTimer, myna, resolved, timeout, wrappedError, wrappedSuccess, xhr;
      this.log("ajax", url, success, error);
      timeout = this.options.timeout;
      xhr = void 0;
      resolved = false;
      myna = this;
      wrappedSuccess = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        myna.log.apply(myna, [" - ajax success"].concat(__slice.call(args)));
        if (!resolved) {
          window.clearTimeout(errorTimer);
          resolved = true;
          return success.apply(null, args);
        }
      };
      wrappedError = function(jqXHR, textStatus, errorThrown) {
        myna.log(" - ajax error", jqXHR, textStatus, errorThrown);
        if (!resolved) {
          resolved = true;
          return error(jqXHR, textStatus, errorThrown);
        }
      };
      try {
        errorTimer = window.setTimeout(function() {
          return wrappedError(xhr, "timeout", timeout);
        }, timeout);
        return xhr = $.ajax({
          url: url,
          dataType: "jsonp",
          crossDomain: true,
          success: wrappedSuccess,
          error: wrappedError
        });
      } catch (exn) {
        return wrappedError(xhr, "error", exn);
      } finally {
        xhr;

      }
    };

    Myna.prototype.trackGoogleSuggestEvent = function(uuid, choice) {
      var enabled, eventName;
      enabled = this.exptGoogleOption(uuid, "enabled", (function() {
        return true;
      }));
      eventName = this.exptGoogleOption(uuid, "viewEvent", (function() {
        return "" + uuid + "-view";
      }));
      if (enabled) {
        return typeof _gaq !== "undefined" && _gaq !== null ? _gaq.push(["_trackEvent", "myna", eventName, choice]) : void 0;
      }
    };

    Myna.prototype.trackGoogleRewardEvent = function(uuid, choice) {
      var enabled, eventName;
      enabled = this.exptGoogleOption(uuid, "enabled", (function() {
        return true;
      }));
      eventName = this.exptGoogleOption(uuid, "conversionEvent", (function() {
        return "" + uuid + "-conversion";
      }));
      if (enabled) {
        return typeof _gaq !== "undefined" && _gaq !== null ? _gaq.push(["_trackEvent", "myna", eventName, choice]) : void 0;
      }
    };

    Myna.prototype.suggestAjax = function(uuid, success, error) {
      var url, wrappedError, wrappedSuccess,
        _this = this;
      this.log("suggestAjax", uuid, success, error);
      url = "" + this.options.apiRoot + "/v1/experiment/" + uuid + "/suggest";
      wrappedSuccess = function(data, textStatus, jqXHR) {
        var stored;
        if (data.typename === "suggestion") {
          stored = _this.saveSuggestion(uuid, data.choice, data.token, false, false);
          _this.log(" - suggest received and stored", stored);
          _this.trackGoogleSuggestEvent(uuid, data.choice);
          success(stored);
        } else {
          _this.log(" - suggest received " + data.typename, data, textStatus, jqXHR);
          error(jqXHR, textStatus, data);
        }
      };
      wrappedError = function(jqXHR, textStatus, errorThrown) {
        _this.log(" - suggest received error", jqXHR, textStatus, errorThrown);
        error(jqXHR, textStatus, errorThrown);
      };
      return this.ajax(url, wrappedSuccess, wrappedError);
    };

    Myna.prototype.suggestSkip = function(uuid, success, error) {
      var choice, stored;
      this.log("suggestSkip", uuid, success, error);
      choice = this.defaultVariant(uuid);
      if (choice) {
        stored = this.saveSuggestion(uuid, choice, null, true, false);
        success(stored);
      } else {
        error(null, "no-default-suggestion", uuid);
      }
    };

    Myna.prototype.suggest = function(uuid, success, error) {
      var beforeSuggest, sticky, stored, successWrapper;
      if (success == null) {
        success = (function() {});
      }
      if (error == null) {
        error = (function() {});
      }
      this.log("suggest", uuid, success, error);
      sticky = this.exptOption(uuid, "sticky");
      stored = sticky && this.loadSuggestion(uuid);
      beforeSuggest = this.exptCallback(uuid, "beforeSuggest", (function() {
        return function() {};
      }));
      successWrapper = function(stored) {
        beforeSuggest(stored, true);
        return success(stored);
      };
      if (stored) {
        beforeSuggest(stored, false);
        return success(stored);
      } else if (this.target(uuid)) {
        return this.suggestAjax(uuid, successWrapper, error);
      } else {
        return this.suggestSkip(uuid, successWrapper, error);
      }
    };

    Myna.prototype.rewardAjax = function(stored, amount, success, error) {
      var choice, token, url, uuid, wrappedError, wrappedSuccess,
        _this = this;
      this.log("rewardAjax", stored, amount, success, error);
      uuid = stored.uuid;
      token = stored.token;
      choice = stored.choice;
      url = "" + this.options.apiRoot + "/v1/experiment/" + uuid + "/reward?token=" + token + "&amount=" + amount;
      wrappedSuccess = function(data, textStatus, jqXHR) {
        if (data.typename === "ok") {
          _this.log("reward received ok", data, textStatus, jqXHR);
          stored = _this.saveSuggestion(uuid, choice, token, false, true);
          _this.trackGoogleRewardEvent(uuid, choice);
          success(stored);
        } else {
          _this.log("reward received " + data.typename, data, textStatus, jqXHR);
          _this.deleteSuggestion(uuid);
          error(jqXHR, textStatus, data);
        }
      };
      wrappedError = function(jqXHR, textStatus, errorThrown) {
        _this.log("reward received error", jqXHR, textStatus, errorThrown);
        _this.deleteSuggestion(uuid);
        error(jqXHR, textStatus, errorThrown);
      };
      return this.ajax(url, wrappedSuccess, wrappedError);
    };

    Myna.prototype.reward = function(uuid, amount, success, error) {
      var stored;
      if (amount == null) {
        amount = 1.0;
      }
      if (success == null) {
        success = (function() {});
      }
      if (error == null) {
        error = (function() {});
      }
      stored = this.loadSuggestion(uuid);
      this.log("reward", uuid, amount, success, error, stored);
      if (!stored) {
        this.log("no suggestion");
        error(void 0, "no-suggestion", uuid);
      } else if (stored.skipped) {
        this.log("skipped");
        error(void 0, "skipped", uuid);
      } else if (stored.rewarded) {
        this.log("repeat reward");
        error(void 0, "repeat-reward", uuid);
      } else {
        this.rewardAjax(stored, amount, success, error);
      }
    };

    Myna.prototype.wrapHandler = function(uuid, handler) {
      var myna;
      myna = this;
      myna.log("wrapHandler", uuid, handler);
      return function() {
        var args, complete, elem, evt, self, stored;
        evt = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        myna.log("wrappedHandler", evt);
        elem = this;
        self = $(elem);
        stored = myna.loadSuggestion(uuid);
        if (stored && !stored.rewarded) {
          myna.log(" - rewarding and retriggering");
          evt.stopPropagation();
          evt.preventDefault();
          complete = function() {
            myna.log(" - about to retrigger", evt, evt.type);
            if (elem[evt.type]) {
              myna.log(" - dom method", elem, evt.type);
              window.setTimeout(function() {
                return elem[evt.type]();
              }, 0);
            } else {
              myna.log(" - jQuery trigger", self, evt.type);
              self.trigger(evt.type);
            }
          };
          myna.reward(uuid, 1.0, complete, complete);
        } else {
          myna.log(" - retriggering", evt, evt.type);
          return handler.call.apply(handler, [this, evt].concat(__slice.call(args)));
        }
      };
    };

    Myna.prototype.on = function() {
      var args, eventData, eventType, handler, jq, uuid;
      jq = arguments[0], eventType = arguments[1], uuid = arguments[2], args = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
      this.log.apply(this, ["on", jq, eventType, uuid].concat(__slice.call(args)));
      switch (args.length) {
        case 0:
          return jq.on(eventType, this.wrapHandler(uuid, (function() {})));
        case 1:
          handler = args[0];
          return jq.on(eventType, this.wrapHandler(uuid, handler));
        default:
          eventData = args[0];
          handler = args[1];
          return jq.on(eventType, null, eventData, this.wrapHandler(uuid, handler));
      }
    };

    Myna.prototype.eachVariantAndGoal = function(cssClass, dataPrefix, handler) {
      var _this = this;
      this.log("eachVariantAndGoal", cssClass, dataPrefix, handler);
      return $("." + cssClass).each(function(index, elem) {
        var bind, goal, self, show;
        self = $(elem);
        show = _this.data(self, dataPrefix, "show");
        bind = _this.data(self, dataPrefix, "bind");
        goal = _this.data(self, dataPrefix, "goal");
        return handler.call(self, show, bind, goal);
      });
    };

    Myna.prototype.showVariant = function(cssClass, dataPrefix, choice) {
      this.log("showVariant", cssClass, dataPrefix, choice);
      return this.eachVariantAndGoal(cssClass, dataPrefix, function(show, bind, goal) {
        var match;
        if (show) {
          switch (show) {
            case choice:
              this.show();
              break;
            default:
              this.hide();
          }
        }
        if (bind) {
          switch (bind) {
            case "text":
              return this.text(choice);
            case "html":
              return this.html(choice);
            case "class":
              return this.addClass(choice);
            default:
              match = bind.match(/@(.*)/);
              if (match) {
                return this.attr(match[1], choice);
              }
          }
        }
      });
    };

    Myna.prototype.initGoals = function(uuid, cssClass, dataPrefix) {
      var myna;
      myna = this;
      this.log("initGoals", cssClass, dataPrefix);
      return this.eachVariantAndGoal(cssClass, dataPrefix, function(show, bind, goal) {
        switch (goal) {
          case "click":
            return myna.on(this, "click", uuid);
          case "load":
            if (this.is("html,body")) {
              return myna.reward(uuid, 1.0);
            }
        }
      });
    };

    Myna.prototype.initExperiment = function(options) {
      var cssClass, dataPrefix, error, stored, success, uuid,
        _this = this;
      uuid = options['uuid'];
      cssClass = options['class'];
      dataPrefix = options['dataPrefix'];
      stored = this.loadSuggestion(uuid);
      this.log("initExperiment", uuid, cssClass, dataPrefix, stored);
      success = function(stored) {
        _this.log(" - initExperiment success", stored);
        _this.showVariant(cssClass, dataPrefix, stored.choice);
        if (!stored.skipped && !stored.rewarded && stored.token) {
          _this.initGoals(uuid, cssClass, dataPrefix);
        }
      };
      error = function() {
        var choice;
        _this.log(" - initExperiment error");
        choice = _this.defaultVariant(uuid);
        if (choice) {
          _this.showVariant(cssClass, dataPrefix, choice);
        }
      };
      this.suggest(uuid, success, error);
    };

    Myna.prototype.initExperiments = function() {
      var _this = this;
      $.each(this.options.experiments, function(index, options) {
        return _this.initExperiment(options);
      });
    };

    return Myna;

  })();
})(window, document, jQuery);
