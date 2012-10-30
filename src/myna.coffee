###!
Myna jQuery Client Library
Copyright 2012 Myna Ltd
Released under the Apache 2.0 License
###

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
initPlugin = ($, window, document) ->

  # Defaults, logging, and errors ---------------

  $.mynaDefaults =
    apiRoot: "//api.mynaweb.com"
    debug: false
    sticky: true
    dataPrefix: null
    cookieName: "myna"
    cookieOptions:
      path: "/"
      expires: 7   # days

  $.mynaLog = (args...) =>
    if $.mynaDefaults.debug
      console?.log?(args)

  $.mynaError = (args...) =>
    $.mynaLog(args...)
    throw args

  # Version of $.data that accepts a prefix as well as a key name.
  #
  # string string -> any(string null)
  $.fn.mynaData = (prefix, name) ->
    return this.data(if prefix then "#{prefix}-#{name}" else name)

  # Saving and loading suggestions --------------

  # Load the full set of remembered suggestions for this web site from
  # the Myna cookie. Returns [] by default.
  #
  # -> arrayOf(suggestionJson)
  loadSuggestions = () =>
    $.mynaLog("loadSuggestions")

    try
      cookieName = $.mynaDefaults.cookieName

      savedPath = $.cookie.defaults.path
      $.cookie.defaults.path = $.mynaDefaults.cookieOptions.path

      $.mynaLog(" - ", cookieName)

      JSON.parse($.cookie(cookieName)) || {}
    catch exn
      {}
    finally
      $.cookie.defaults.path = savedPath

  # Save an array of remembered suggestions to the Myna cookie.
  #
  # arrayOf(suggestionJson) -> void
  saveSuggestions = (suggestions) =>
    $.mynaLog("saveSuggestions", suggestions)

    try
      cookieName = $.mynaDefaults.cookieName
      cookieValue = JSON.stringify(suggestions)
      cookieOptions = $.mynaDefaults.cookieOptions

      savedPath = $.cookie.defaults.path
      $.cookie.defaults.path = $.mynaDefaults.cookieOptions.path

      $.mynaLog(" - ", cookieName, cookieValue, cookieOptions)

      $.cookie(cookieName, cookieValue)

      $.mynaLog(" - ", document.cookie)
    finally
      $.cookie.defaults.path = savedPath

    return

  # Delete the Myna cookie that stores remembered suggestions
  # (useful for debugging).
  #
  # -> void
  $.clearSuggestions = () =>
    $.mynaLog("clearSuggestions")

    try
      savedPath = $.cookie.defaults.path
      $.cookie.defaults.path = $.mynaDefaults.cookieOptions.path

      cookieName = $.mynaDefaults.cookieName

      $.removeCookie(cookieName)
    finally
      $.cookie.defaults.path = savedPath

  # Save a suggestion to the Myna cookie, allowing it to be restored for later
  # use in sticky tests.
  #
  # uuidString string uuidString [boolean] -> void
  $.saveSuggestion = (uuid, choice, token, rewarded = false) =>
    $.mynaLog("saveSuggestion", uuid, choice, token, rewarded)

    suggestions = loadSuggestions()
    suggestions[uuid] = {
      choice:   choice
      token:    token
      rewarded: rewarded
    }
    saveSuggestions(suggestions)

    return

  # Delete any remembered suggestion for the supplied experiment UUID
  # from the Myna cookie. Used in error handling code.
  #
  # uuidString -> void
  $.deleteSuggestion = (uuid) =>
    $.mynaLog("deleteSuggestion", uuid)

    suggestions = loadSuggestions()
    delete suggestions[uuid];
    saveSuggestions(suggestions)

    return

  # Load any remembered suggestion for the supplied experiment UUID
  # from the Myna cookie.
  #
  # uuidString -> any(suggestionJson, null)
  $.loadSuggestion = (uuid) =>
    $.mynaLog("loadSuggestion", uuid)
    loadSuggestions()[uuid] || null

  # Basic suggest and reward functions ----------

  # Obtain a suggestion from Myna via JSONP.
  #
  # suggestOptions -> void
  $.suggest = (options) =>
    options = $.extend({}, $.mynaDefaults, options)

    success = options.success || (->)
    error   = options.error   || (->)

    uuid = options.uuid || $.mynaError("suggest: no uuid")
    url  = "#{options.apiRoot}/v1/experiment/#{uuid}/suggest"

    $.ajax
      url: url
      dataType: "jsonp"
      crossDomain: true
      success: (data, textStatus, jqXHR) =>
        if data.typename == "suggestion"
          $.saveSuggestion(uuid, data.choice, data.token)
          success(uuid: uuid, choice: data.choice, token: data.token)
        else
          $.mynaLog("suggest received #{data.typename}", data, textStatus, jqXHR)
          error(data, textStatus, jqXHR)
        return
      error: (jqXHR, textStatus, errorThrown) =>
        $.mynaLog("suggest received error", jqXHR, textStatus, errorThrown)
        error({}, textStatus, jqXHR, errorThrown)
        return

    return

  # Reward Myna via JSONP.
  #
  # rewardOptions -> void
  $.reward = (options) =>
    options = $.extend({}, $.mynaDefaults, options)

    success = options.success || (->)
    error   = options.error   || (->)

    uuid   = options.uuid || $.mynaError("reward: no uuid")
    stored = $.loadSuggestion(uuid)

    if stored && !stored.rewarded
      token  = stored.token
      choice = stored.choice
      $.saveSuggestion(uuid, choice, token, true)

      amount = options.amount || 1
      url    = "#{options.apiRoot}/v1/experiment/#{uuid}/reward?token=#{token}&amount=#{amount}"

      $.ajax
        url: url
        dataType: "jsonp"
        crossDomain: true
        success: (data, textStatus, jqXHR) =>
          if data.typename == "ok"
            $.mynaLog("reward received ok", data, textStatus, jqXHR)
            $.saveSuggestion(uuid, choice, token, true)
            success(uuid: uuid, choice: choice, token: token, amount: amount)
          else
            $.mynaLog("reward received #{data.typename}", data, textStatus, jqXHR)
          return
        error: (jqXHR, textStatus, errorThrown) =>
          $.mynaLog("reward received error", jqXHR, textStatus, errorThrown)
          $.deleteSuggestion(uuid)
          error({}, textStatus, jqXHR, errorThrown)
          return
    else
      success()

    return

  # Event handlers ------------------------------

  # Wraps an event handler in a new handler that rewards Myna
  # before delegating control.
  #
  # uuidString (event any ... -> void) -> (event any ... -> void)
  $.wrapHandler = (uuid, handler) ->
    $.mynaLog("wrapHandler", uuid, handler)
    (evt, args...) ->
      $.mynaLog("wrappedHandler", evt)

      elem = this
      self = $(elem)

      stored = $.loadSuggestion(uuid)
      if stored && !stored.rewarded
        $.mynaLog(" - rewarding and retriggering")
        evt.stopPropagation()
        evt.preventDefault()
        $.reward
          uuid: uuid
          success: () ->
            if elem[evt.type]
              elem[evt.type]()
            else
              self.trigger(evt.type)
            return
          error: () ->
            if elem[evt.type]
              elem[evt.type]()
            else
              self.trigger(evt.type)
            return
        return
      else
        $.mynaLog(" - retriggering", evt, evt.type)
        return handler.call(this, evt, args...)

  # Installs a handler for the supplied DOM event that rewards Myna before
  # delegating to any existing event handlers.
  #
  # string uuidString any ... -> void
  $.fn.mynaOn = (eventType, uuid, args...) ->
    $.mynaLog("mynaOn", eventType, uuid, args...)
    switch args.length
      when 0
        this.on(eventType, $.wrapHandler(uuid, (->)))
      when 1
        handler = args[0]
        this.on(eventType, $.wrapHandler(uuid, handler))
      else
        eventData = args[0]
        handler = args[1]
        this.on(eventType, null, eventData, $.wrapHandler(uuid, handler))

  # Automatic setup -----------------------------

  # Helper function that iterates through the elements that have the supplied
  # experiment CSS class, extracts the relevant "data-" attribute values, and
  # passes them to an iterator function.
  #
  # The element in question is packaged in a jQuery object and bound as "this"
  # in the iterator function.
  #
  # string any(string, null) (string string string -> void) -> void
  eachVariantAndGoal = (cssClass, dataPrefix, handler) =>
    $(".#{cssClass}").each (index, elem) =>
      self = $(elem)
      show = self.mynaData(dataPrefix, "show")
      bind = self.mynaData(dataPrefix, "bind")
      goal = self.mynaData(dataPrefix, "goal")
      handler.call(self, show, bind, goal)

  # Set up variants for the supplied experiment. This involves scanning for
  # "data-show" and "data-bind" attributes and setting up the page accordingly.
  #
  # string any(string, null) string -> void
  showVariant = (cssClass, dataPrefix, choice) =>
    eachVariantAndGoal cssClass, dataPrefix, (show, bind, goal) ->
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

  # Used as a fallback in case the experiment info doesn't contain a
  # "default" field. Determines the default variant for the supplied experiment
  # by inspecting the the first "data-show" attribute on the page.
  #
  # Returns null if there are no "data-show" attributes on the page
  # (in which case we don't need to know the default variant anyway).
  #
  # string any(string, null) -> any(string, null)
  findDefaultVariant = (cssClass, dataPrefix) =>
    eachVariantAndGoal cssClass, dataPrefix, (show, bind, goal) ->
      if show then return show
    return null

  # Attach goal handlers for the supplied experiment.
  #
  # uuidString string any(string, null) -> void
  initGoals = (uuid, cssClass, dataPrefix) =>
    eachVariantAndGoal cssClass, dataPrefix, (show, bind, goal) ->
      switch goal
        when "click"
          this.mynaOn("click", uuid)
        when "load"
          if this.is("html,body") then $(window).mynaOn("load", uuid)

  # Set up variants and attach goal handlers for the supplied experiment.
  #
  # experimentOptions -> void
  $.initExperiment = (options) =>
    uuid       = options["uuid"]
    cssClass   = options["class"]
    sticky     = options["sticky"]
    dataPrefix = options["dataPrefix"]

    if !uuid || !cssClass
      $.mynaLog("initExperiment: no uuid or CSS class", options, uuid, cssClass, sticky)
      return

    stored = $.loadSuggestion(uuid)

    $.mynaLog("initExperiment", uuid, cssClass, sticky, stored?.choice, stored?.token, stored?.rewarded)

    if sticky && stored
      $.mynaLog(" - recalling suggestion", stored.choice)
      showVariant(cssClass, dataPrefix, stored.choice)
      initGoals(uuid, cssClass, dataPrefix)
    else
      $.mynaLog(" - fetching suggestion")
      $.suggest
        uuid: uuid
        success: (data) =>
          showVariant(cssClass, dataPrefix, data.choice)
          initGoals(uuid, cssClass, dataPrefix)
          return
        error: () =>
          variant = options["default"] || findDefaultVariant(cssClass, dataPrefix)
          if variant then showVariant(cssClass, dataPrefix, variant)
          return

    return

  # Initialise Myna. Set up variants and attach goal handlers for all
  # supplied experiments.
  #
  # mynaOptions -> void
  $.initNow = (options = { experiments: [] }) =>
    options = $.extend({}, $.mynaDefaults, options)
    $.mynaLog("myna", options, options.experiments)
    $.each options.experiments, (index, exptOptions) =>
      $.mynaLog(" - ", exptOptions)
      exptOptions = $.extend({ dataPrefix: options.dataPrefix, sticky: options.sticky }, exptOptions)
      $.initExperiment(exptOptions)

  # Attach a call to Myna.initNow to the document.ready event.
  # Because we're using jQuery 1.5+, this guarantees Myna will be initialised
  # no matter where the call to Myna.init is placed in the web page.
  #
  # mynaOptions -> void
  $.init = (options = { experiments: [] }) =>
    $(document).ready(() => $.initNow(options))

  return $.noConflict()

window.Myna = initPlugin(window.jQuery, window, document)
