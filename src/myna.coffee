Myna = do (window, document) ->

  # Cache a reference to jQuery:
  $ = window.jQuery

  # Extends the supplied jQuery object with Myna functionality and returns it.
  # This new super-jQuery object is what gets bound as "window.Myna".
  #
  # Calls "jQuery.noConflict()" to ensure Myna doesn't conflict with existing
  # copies of jQuery on the user's site.
  #
  # Window and document are supplied as extra arguments to make them eligible
  # for code minification.
  #
  # jQuery window document -> jQuery
  class Myna

    # Provide a way to get hold of Myna's jQuery instance when running unit tests.
    # We need this to mock calls to $.ajax when testing the complete Myna for HTML.
    @$ = $

    @defaults:
      debug:         false
      apiRoot:       "//api.mynaweb.com"
      timeout:       1200    # milliseconds
      cssClass:      "myna"
      dataPrefix:    null
      sticky:        true
      skipChance:    0.0    # [0.0, 1.0]
      cookieName:    "myna"
      cookieOptions:
        path:        "/"
        expires:     7      # days
      experiments:   []

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
        cssClass:   this.options.cssClass
        dataPrefix: this.options.dataPrefix
        sticky:     this.options.sticky
        skipChance: this.options.skipChance
        timeout:    this.options.timeout

      $.each this.options.experiments, (index, options) =>
        uuid     = options.uuid
        cssClass = options['class']

        if uuid && cssClass
          options = $.extend({}, exptDefaults, options)
          this.options.experiments[uuid] = options
        else
          this.log("no uuid or CSS class", options, uuid, cssClass, sticky)

    log: (args...) =>
      if this.options.debug
        console?.log?(args...)

    error: (args...) =>
      this.log(args...)
      throw args

    # Version of $().data that accepts a prefix as well as a key name.
    #
    # jQuery string string -> any(string null)
    data: (jq, prefix, name) ->
      return jq.data(if prefix then "#{prefix}-#{name}" else name)

    # Retrieve all options for an experiment.
    #
    # uuidString -> exptOptionsObject
    exptOptions: (uuid) =>
      this.options.experiments[uuid] || this.error("no such experiment", uuid)

    # Retrieve an option for an experiment.
    #
    # uuidString string [(-> any)] -> any
    exptOption: (uuid, name, defaultFunc = -> undefined) =>
      this.exptOptions(uuid)[name] || defaultFunc()

    # Should we skip a suggestion?
    skipSuggestion: (uuid) =>
      Math.random() < this.exptOption(uuid, "skipChance")

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

        cookie = $.cookie(cookieName, cookieValue)

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

      stored =
        uuid:     uuid
        choice:   choice
        token:    token
        skipped:  skipped
        rewarded: rewarded

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

      if stored
        success(stored)
      else if this.skipSuggestion(uuid)
        this.suggestSkip(uuid, success, error)
      else
        this.suggestAjax(uuid, success, error)

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
        return

      wrappedError = (jqXHR, textStatus, errorThrown) =>
        this.log("reward received error", jqXHR, textStatus, errorThrown)
        this.deleteSuggestion(uuid)
        error(jqXHR, textStatus, errorThrown)
        return

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