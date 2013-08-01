Myna = do (window, document, $ = jQuery) ->
  # Extends the supplied jQuery object with Myna functionality and returns it.
  #
  # jQuery window document -> jQuery
  class Myna

    # Provide a way to get hold of Myna's jQuery instance when running unit tests.
    # We need this to mock calls to $.ajax when testing the complete Myna for HTML.
    @$ = $

    @defaults:
      debug:         false
      apiRoot:       "//api.mynaweb.com"
      timeout:       1200 # milliseconds
      cssClass:      "myna"
      dataPrefix:    null
      sticky:        true
      cookieName:    "myna"
      cookieOptions:
        path:        "/"
        expires:     7 # days
      experiments:   []
      # TODO: remove skipChance when updating to v2 - this config option can be removed
      skipChance:    0.0 # ( deprecated - use callbacks.target instead )
      googleAnalytics:
        enabled:     true
      callbacks:
        # Callback, called just before a suggestion is saved to a cookie.
        # - single argument is data to be saved;
        # - can optionally return an updated version of the data.
        #
        # object -> any(object, void)
        beforeSave: ((stored) -> stored)
        # Callback, called whenever a suggestion is loaded from Myna or a cookie,
        # immediately before DOM elements with Myna data attributes are updated.
        # Use it to perform custom variant set-up and tracking.
        # - first argument is the suggestion data retrieved:
        #     { uuid: string, choice string, token: string }
        #     where uuid is the experiment UUID;
        #           choice is the name of the suggested variant
        #           token is the token to send back to Myna on reward
        # - second argument is a boolean:
        #   - true if the data was loaded from a cookie;
        #   - false if it came from Myna.
        #
        # object boolean -> void
        beforeSuggest: ((stored, fromCookie) ->)
        # Callback, called whenever a suggestion is loaded from Myna or a cookie,
        # immediately before DOM elements with Myna data attributes are updated.
        # Use it to perform custom variant set-up and tracking.
        # - first argument is the name of the suggested variant
        # - second argument is the suggestion data retrieved from the cookie/Myna:
        #     { uuid: string, choice string, token: string }
        #     where uuid is the experiment UUID;
        #           choice is the name of the suggested variant
        #           token is the token to send back to Myna on reward
        # - third argument is a boolean:
        #   - true if the data was loaded from a cookie;
        #   - false if it came from Myna.
        #
        # string -> boolean
        suggest: ((variant, stored, fromCookie) ->)
        # Callback, called to determine whether a user should be targetted in a test.
        #
        # Accepts no arguments. Returns true (run the test) or false (skip the test).
        #
        # -> boolean
        # TODO: remove skipChance when updating to v2 - this default value can be reverted to (-> true)
        target: null # (-> true)

    # Factory method. Attach a call to Myna.initNow to the document.ready event.
    # Because we're using jQuery 1.5+, this guarantees Myna will be initialised
    # no matter where the call to Myna.init is placed in the web page.
    #
    # mynaOptions -> void
    @init: (options = { experiments: [] }) ->
      myna = new Myna(options)
      $(document).ready(-> myna.initExperiments())
      myna

    # Initialise Myna. Set up variants and attach goal handlers for all supplied experiments.
    #
    # mynaOptions -> void
    constructor: (options = {}) ->
      this.options = $.extend(true, {}, Myna.defaults, options)

      this.log("constructor", options)

      exptDefaults =
        cssClass:      this.options.cssClass
        dataPrefix:    this.options.dataPrefix
        sticky:        this.options.sticky
        callbacks:
          beforeSave:    this.options.callbacks?.beforeSave
          beforeSuggest: this.options.callbacks?.beforeSuggest
          suggest:       this.options.callbacks?.suggest
          # TODO: remove skipChance when updating to v2 - this three-way conditional can be collapsed
          target:        if this.options.callbacks?.target
                           this.options.callbacks?.target
                         else if this.options.skipChance
                           () =>
                             Math.random() < this.options.skipChance
                         else
                           () => true
        timeout:       this.options.timeout

      expts = {}

      $.each this.options.experiments, (index, options) =>
        uuid     = options.uuid
        cssClass = options['class']
        sticky   = options.sticky

        # TODO: remove skipChance when updating to v2 - this statement can be removed
        if options.skipChance
          unless options.callbacks?.target
            options.callbacks = $.extend(
              true,
              {},
              options.callbacks || {},
              { target: () => Math.random() < options.skipChance }
            )

        googleDefaults =
          googleAnalytics:
            enabled:         this.options.googleAnalytics.enabled
            viewEvent:       if options.uuid then "#{options.uuid}-view" else null
            conversionEvent: if options.uuid then "#{options.uuid}-conversion" else null

        if uuid && cssClass
          expts[uuid] = $.extend(
            true,
            {},
            exptDefaults,
            googleDefaults,
            options
          )
        else
          this.log("no uuid or CSS class", options, uuid, cssClass, sticky)

      this.options.experiments = expts

    log: (args...) =>
      if this.options.debug
        console?.log?(args...)

    error: (args...) =>
      this.log(args...)
      throw args

    # Version of $().data that accepts a prefix as well as a key name.
    #
    # jQuery any(string null) string -> any(string null)
    data: (jq, prefix, name) =>
      jq.data(if prefix then "#{prefix}-#{name}" else name)

    # Retrieve all options for an experiment.
    #
    # uuidString -> exptOptionsObject
    exptOptions: (uuid) =>
      this.options.experiments[uuid] || this.error("no such experiment", uuid)

    # Retrieve an option for an experiment.
    #
    # uuidString string [(-> any)] -> any
    exptOption: (uuid, name, defaultFunc = -> undefined) =>
      ans = this.exptOptions(uuid)[name]
      if ans? then ans else defaultFunc()

    # Retrieve a Google Analytics option for an experiment.
    #
    # uuidString string [(-> any)] -> any
    exptGoogleOption: (uuid, name, defaultFunc = -> undefined) =>
      ans = this.exptOptions(uuid).googleAnalytics?[name]
      if ans? then ans else defaultFunc()

    # Retrieve an option for an experiment.
    #
    # uuidString string [(-> any)] -> any
    exptCallback: (uuid, name, defaultFunc = -> undefined) =>
      ans = this.exptOptions(uuid).callbacks?[name]
      if ans? then ans else defaultFunc()

    # Should we target the current user with the specified test?
    #
    # uuidString -> boolean
    target: (uuid) =>
      func = this.exptCallback(uuid, "target", (-> (-> 1.0)))
      func()

    # Returns the default variant for the specified experiment.
    #
    # Either obtained from the configuration, or determined from the first
    # data-show element in the page with the relevant CSS class.
    #
    # string any(string, null) -> any(string, null)
    defaultVariant: (uuid) =>
      options = this.exptOptions(uuid)
      ans     = options["default"]

      if !ans
        cssClass   = options["class"]
        dataPrefix = options["dataPrefix"]
        this.eachVariantAndGoal cssClass, dataPrefix, (show, bind, goal) ->
          if show && !ans then ans = show

      return ans

    # Saving and loading suggestions --------------

    # Load the full set of remembered suggestions for this web site from
    # the Myna cookie. Returns [] by default.
    #
    # -> arrayOf(suggestionObject)
    loadSuggestions: () =>
      this.log("loadSuggestions")

      try
        cookieName = this.options.cookieName

        savedPath = $.cookie.defaults.path
        $.cookie.defaults.path = this.options.cookieOptions.path

        this.log(" - ", cookieName)

        JSON.parse($.cookie(cookieName)) || {}
      catch exn
        {}
      finally
        $.cookie.defaults.path = savedPath

    # Save an array of remembered suggestions to the Myna cookie.
    # Returns the cookie string that was set, which is useful for testing
    #
    # arrayOf(suggestionObject) -> string
    saveSuggestions: (suggestions) =>
      this.log("saveSuggestions", suggestions)

      try
        cookieName = this.options.cookieName
        cookieValue = JSON.stringify(suggestions)
        cookieOptions = this.options.cookieOptions

        savedPath = $.cookie.defaults.path
        $.cookie.defaults.path = this.options.cookieOptions.path

        this.log(" - ", cookieName, cookieValue, cookieOptions)

        cookie = $.cookie(cookieName, cookieValue, cookieOptions)

        this.log(" - ", document.cookie)

        cookie
      finally
        $.cookie.defaults.path = savedPath


    # Delete the Myna cookie that stores remembered suggestions
    # (useful for debugging).
    #
    # -> void
    clearSuggestions: () =>
      this.log("clearSuggestions")

      try
        savedPath = $.cookie.defaults.path
        $.cookie.defaults.path = this.options.cookieOptions.path

        cookieName = this.options.cookieName

        $.removeCookie(cookieName)
      finally
        $.cookie.defaults.path = savedPath

    # Save a suggestion to the Myna cookie, allowing it to be restored for later
    # use in sticky tests.
    #
    # uuidString string uuidString [boolean] -> suggestionObject
    saveSuggestion: (uuid, choice, token, skipped = false, rewarded = false) =>
      this.log("saveSuggestion", uuid, choice, token, skipped, rewarded)

      beforeSave = this.exptCallback(uuid, "beforeSave", (-> (x) -> x))

      uncustomised =
        uuid:     uuid
        choice:   choice
        token:    token
        skipped:  skipped
        rewarded: rewarded

      customised = beforeSave(uncustomised)

      # If the user has written beforeSave to return a customised cookie, save that.
      # Otherwise save the uncustomised data.
      stored = if typeof customised == "object" then customised else uncustomised

      this.log(" - uncustomised", uncustomised)
      this.log(" - customised", customised)
      this.log(" - stored", stored)

      suggestions = this.loadSuggestions()
      suggestions[uuid] = stored
      this.saveSuggestions(suggestions)

      stored

    # Delete any remembered suggestion for the supplied experiment UUID
    # from the Myna cookie. Used in error handling code.
    #
    # uuidString -> void
    deleteSuggestion: (uuid) =>
      this.log("deleteSuggestion", uuid)

      suggestions = this.loadSuggestions()
      delete suggestions[uuid];
      this.saveSuggestions(suggestions)

      return

    # Load any remembered suggestion for the supplied experiment UUID
    # from the Myna cookie.
    #
    # uuidString -> any(suggestionObject, null)
    loadSuggestion: (uuid) =>
      this.log("loadSuggestion", uuid)
      this.loadSuggestions()[uuid] || null

    # Basic suggest and reward functions ----------

    # Wrapper around $.ajax that performs cross-domain JSONP calls
    # and catches exceptions and timeouts:
    ajax: (url, success, error) =>
      this.log("ajax", url, success, error)

      timeout  = this.options.timeout
      xhr      = undefined
      resolved = false
      myna     = this

      wrappedSuccess = (args...) ->
        myna.log(" - ajax success", args...)
        if !resolved
          window.clearTimeout(errorTimer)
          resolved = true
          success(args...)

      wrappedError = (jqXHR, textStatus, errorThrown) ->
        myna.log(" - ajax error", jqXHR, textStatus, errorThrown)
        if !resolved
          resolved = true
          error(jqXHR, textStatus, errorThrown)

      try
        # The error argument to $.ajax is ignored for JSONP requests,
        # so we have to manage timeouts ourselves:
        errorTimer = window.setTimeout(
          () -> wrappedError(xhr, "timeout", timeout)
          timeout
        )

        xhr = $.ajax
          url:         url
          dataType:    "jsonp"
          crossDomain: true
          success:     wrappedSuccess
          error:       wrappedError
      catch exn
        wrappedError(xhr, "error", exn)
      finally
        xhr

    # Log a suggestion to Google Analytics if:
    #  - GA integration is enabled for the specified experiment;
    #  - GA is present on the web page.
    trackGoogleSuggestEvent: (uuid, choice) =>
      enabled = this.exptGoogleOption(uuid, "enabled", (-> true))
      eventName = this.exptGoogleOption(uuid, "viewEvent", (-> "#{uuid}-view"))
      if enabled then _gaq?.push ["_trackEvent", "myna", eventName, choice, null, false]

    # Log a reward to Google Analytics if:
    #  - GA integration is enabled for the specified experiment;
    #  - GA is present on the web page.
    trackGoogleRewardEvent: (uuid, choice, amount) =>
      enabled = this.exptGoogleOption(uuid, "enabled", (-> true))
      eventName = this.exptGoogleOption(uuid, "conversionEvent", (-> "#{uuid}-conversion"))
      naturalAmount = Math.floor(amount * 100)
      if enabled then _gaq?.push ["_trackEvent", "myna", eventName, choice, naturalAmount, true]

    # Obtain a suggestion from Myna via JSONP.
    #
    # uuidString successHandler errorHandler -> void
    #
    # where successHandler:
    #   suggestionObject -> void
    #
    # where errorHandler:
    #   any(jqXHR, null) string any -> void
    suggestAjax: (uuid, success, error) =>
      this.log("suggestAjax", uuid, success, error)

      url = "#{this.options.apiRoot}/v1/experiment/#{uuid}/suggest"

      wrappedSuccess = (data, textStatus, jqXHR) =>

        if data.typename == "suggestion"
          stored = this.saveSuggestion(uuid, data.choice, data.token, false, false)
          this.log(" - suggest received and stored", stored)
          this.trackGoogleSuggestEvent(uuid, data.choice)
          success(stored)
        else
          this.log(" - suggest received #{data.typename}", data, textStatus, jqXHR)
          error(jqXHR, textStatus, data)
        return

      wrappedError = (jqXHR, textStatus, errorThrown) =>
        this.log(" - suggest received error", jqXHR, textStatus, errorThrown)
        error(jqXHR, textStatus, errorThrown)
        return

      this.ajax(url, wrappedSuccess, wrappedError)

    # Skip a suggestion by suggesting the default variant for the experiment.
    #
    # uuidString successHandler errorHandler -> void
    #
    # where successHandler:
    #   suggestionObject -> void
    #
    # where errorHandler:
    #   any(jqXHR, null) string any -> void
    suggestSkip: (uuid, success, error) =>
      this.log("suggestSkip", uuid, success, error)

      choice = this.defaultVariant(uuid)

      if choice
        stored = this.saveSuggestion(uuid, choice, null, true, false)
        success(stored)
      else
        error(null, "no-default-suggestion", uuid)

      return

    # Obtain a suggestion from Myna via stored cookie, default variant, or JSONP.
    #
    # uuidString succesHandler errorHandler -> void
    #
    # where successHandler:
    #   suggestionObject -> void
    #
    # where errorHandler:
    #   any(jqXHR, null) string any -> void
    suggest: (uuid, success = (->), error = (->)) =>
      this.log("suggest", uuid, success, error)

      sticky = this.exptOption(uuid, "sticky")
      stored = sticky && this.loadSuggestion(uuid)

      # callback for customising the behaviour of suggestions
      beforeSuggest = this.exptCallback(uuid, "beforeSuggest", (-> (->)))
      afterSuggest  = this.exptCallback(uuid, "suggest", (-> (->)))
      successWrapper = (stored) ->
        beforeSuggest(stored, true)
        success(stored)
        afterSuggest(stored.choice, stored, true)

      if stored
        beforeSuggest(stored, false)
        success(stored)
        afterSuggest(stored.choice, stored, false)
      else if this.target(uuid)
        this.suggestAjax(uuid, successWrapper, error)
      else
        this.suggestSkip(uuid, successWrapper, error)

    # Reward Myna via JSONP.
    #
    # suggestionObject [0.0, 1.0] successHandler errorHandler -> void
    #
    # where successHandler:
    #   suggestionObject -> void
    #
    # where errorHandler:
    #   any(jqXHR, null) string any -> void
    rewardAjax: (stored, amount, success, error) =>
      this.log("rewardAjax", stored, amount, success, error)

      uuid   = stored.uuid
      token  = stored.token
      choice = stored.choice
      url    = "#{this.options.apiRoot}/v1/experiment/#{uuid}/reward?token=#{token}&amount=#{amount}"

      wrappedSuccess = (data, textStatus, jqXHR) =>
        if data.typename == "ok"
          this.log("reward received ok", data, textStatus, jqXHR)
          stored = this.saveSuggestion(uuid, choice, token, false, true)
          success(stored)
        else
          this.log("reward received #{data.typename}", data, textStatus, jqXHR)
          this.deleteSuggestion(uuid)
          error(jqXHR, textStatus, data)
        return

      wrappedError = (jqXHR, textStatus, errorThrown) =>
        this.log("reward received error", jqXHR, textStatus, errorThrown)
        this.deleteSuggestion(uuid)
        error(jqXHR, textStatus, errorThrown)
        return

      this.trackGoogleRewardEvent(uuid, choice, amount)
      this.ajax(url, wrappedSuccess, wrappedError)

    # Reward Myna via JSONP.
    #
    # uuidString [0.0, 1.0] successHandler errorHandler -> void
    #
    # where successHandler:
    #   suggestionObject -> void
    #
    # where errorHandler:
    #   any(jqXHR, null) string any -> void
    reward: (uuid, amount = 1.0, success = (->), error = (->)) =>
      stored  = this.loadSuggestion(uuid)

      this.log("reward", uuid, amount, success, error, stored)

      if !stored
        this.log("no suggestion")
        error(undefined, "no-suggestion", uuid)
      else if stored.skipped
        this.log("skipped")
        error(undefined, "skipped", uuid)
      else if stored.rewarded
        this.log("repeat reward")
        error(undefined, "repeat-reward", uuid)
      else
        this.rewardAjax(stored, amount, success, error)

      return

    # Event handlers ------------------------------

    # Wraps an event handler in a new handler that rewards Myna
    # before delegating control.
    #
    # uuidString (event any ... -> void) -> (event any ... -> void)
    wrapHandler: (uuid, handler) =>
      myna = this
      myna.log("wrapHandler", uuid, handler)
      (evt, args...) ->
        myna.log("wrappedHandler", evt)

        elem = this
        self = $(elem)

        stored = myna.loadSuggestion(uuid)
        if stored && !stored.rewarded
          myna.log(" - rewarding and retriggering")
          evt.stopPropagation()
          evt.preventDefault()

          complete = () ->
            myna.log(" - about to retrigger", evt, evt.type)
            if elem[evt.type]
              # If there's a method for this event, call it directly to retrigger the default action:
              myna.log(" - dom method", elem, evt.type)
              window.setTimeout(
                () -> elem[evt.type]()
                0
              )
            else
              # If there isn't a method for this event, trigger the event using jQuery:
              myna.log(" - jQuery trigger", self, evt.type)
              self.trigger(evt.type)
            return

          myna.reward(uuid, 1.0, complete, complete)
          return
        else
          myna.log(" - retriggering", evt, evt.type)
          return handler.call(this, evt, args...)

    # Installs a handler for the supplied DOM event that rewards Myna before
    # delegating to any existing event handlers.
    #
    # jQuery string uuidString any ... -> void
    on: (jq, eventType, uuid, args...) =>
      this.log("on", jq, eventType, uuid, args...)
      switch args.length
        when 0
          jq.on(eventType, this.wrapHandler(uuid, (->)))
        when 1
          handler = args[0]
          jq.on(eventType, this.wrapHandler(uuid, handler))
        else
          eventData = args[0]
          handler = args[1]
          jq.on(eventType, null, eventData, this.wrapHandler(uuid, handler))

    # Automatic setup -----------------------------

    # Helper function that iterates through the elements that have the supplied
    # experiment CSS class, extracts the relevant "data-" attribute values, and
    # passes them to an iterator function.
    #
    # The element in question is packaged in a jQuery object and bound as "this"
    # in the iterator function.
    #
    # string any(string, null) (string string string -> void) -> void
    eachVariantAndGoal: (cssClass, dataPrefix, handler) =>
      this.log("eachVariantAndGoal", cssClass, dataPrefix, handler)
      $(".#{cssClass}").each (index, elem) =>
        self = $(elem)
        show = this.data(self, dataPrefix, "show")
        bind = this.data(self, dataPrefix, "bind")
        goal = this.data(self, dataPrefix, "goal")
        handler.call(self, show, bind, goal)

    # Set up variants for the supplied experiment. This involves scanning for
    # "data-show" and "data-bind" attributes and setting up the page accordingly.
    #
    # string any(string, null) string -> void
    showVariant: (cssClass, dataPrefix, choice) =>
      this.log("showVariant", cssClass, dataPrefix, choice)
      this.eachVariantAndGoal cssClass, dataPrefix, (show, bind, goal) ->
        if show
          switch show
            when choice then this.show()
            else this.hide()

        if bind
          switch bind
            when "text"  then this.text(choice)
            when "html"  then this.html(choice)
            when "class" then this.addClass(choice)
            else
              match = bind.match(/@(.*)/)
              if match
                this.attr(match[1], choice)

    # Attach goal handlers for the supplied experiment.
    #
    # uuidString string any(string, null) -> void
    initGoals: (uuid, cssClass, dataPrefix) =>
      myna = this
      this.log("initGoals", cssClass, dataPrefix)
      this.eachVariantAndGoal cssClass, dataPrefix, (show, bind, goal) ->
        myna.log("initGoals visiting", this, show, bind, goal)
        switch goal
          when "click"
            myna.on(this, "click", uuid)
          when "load"
            if this.is("html,body")
              myna.reward(uuid, 1.0)

    # Set up variants and attach goal handlers for the supplied experiment.
    #
    # experimentOptions -> void
    initExperiment: (options) =>
      uuid       = options['uuid']
      cssClass   = options['class']
      dataPrefix = options['dataPrefix']
      stored     = this.loadSuggestion(uuid)

      this.log("initExperiment", uuid, cssClass, dataPrefix, stored)

      success = (stored) =>
        this.log(" - initExperiment success", stored)
        this.showVariant(cssClass, dataPrefix, stored.choice)
        if !stored.skipped && !stored.rewarded && stored.token
          this.initGoals(uuid, cssClass, dataPrefix)
        return

      error = () =>
        this.log(" - initExperiment error")
        choice = this.defaultVariant(uuid)
        if choice then this.showVariant(cssClass, dataPrefix, choice)
        return

      this.suggest(uuid, success, error)
      return

    # Set up variants and attach goal handlers for all experiments.
    initExperiments: () =>
      $.each this.options.experiments, (index, options) =>
        this.initExperiment(options)
      return
