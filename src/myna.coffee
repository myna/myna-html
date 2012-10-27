###!
Myna jQuery Client Library
Copyright 2012 Myna Ltd
Released under the Apache 2.0 License
###

initPlugin = ($) ->

  # Defaults, logging, and errors ---------------

  $.mynaDefaults =
    apiRoot: "http://api.mynaweb.com"
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

  $.fn.mynaData = (prefix, name) ->
    return this.data(if prefix then "#{prefix}-#{name}" else name)

  # Saving and loading suggestions --------------

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

  $.clearSuggestions = () =>
    $.mynaLog("clearSuggestions")

    try
      savedPath = $.cookie.defaults.path
      $.cookie.defaults.path = $.mynaDefaults.cookieOptions.path

      cookieName = $.mynaDefaults.cookieName

      $.removeCookie(cookieName)
    finally
      $.cookie.defaults.path = savedPath

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

  $.deleteSuggestion = (uuid) =>
    $.mynaLog("deleteSuggestion", uuid)

    suggestions = loadSuggestions()
    delete suggestions[uuid];
    saveSuggestions(suggestions)

    return

  $.loadSuggestion = (uuid) =>
    $.mynaLog("loadSuggestion", uuid)
    loadSuggestions()[uuid] || null

  # Basic suggest and reward functions ----------

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

  $.fn.mynaClick = (uuid, args...) ->
    $.mynaLog("mynaClick", uuid, args...)
    switch args.length
      when 0
        this.click($.wrapHandler(uuid, (->)))
      when 1
        handler = args[0]
        this.click($.wrapHandler(uuid, handler))
      else
        eventData = args[0]
        handler = args[1]
        this.click(eventData, $.wrapHandler(uuid, handler))

  # Automatic setup -----------------------------

  eachVariantAndGoal = (cssClass, dataPrefix, handler) =>
    $(".#{cssClass}").each (index, elem) =>
      self = $(elem)
      show = self.mynaData(dataPrefix, "show")
      bind = self.mynaData(dataPrefix, "bind")
      goal = self.mynaData(dataPrefix, "goal")
      handler.call(self, show, bind, goal)

  showVariant = (cssClass, dataPrefix, choice) =>
    eachVariantAndGoal cssClass, dataPrefix, (show, bind, goal) ->
      if show
        switch show
          when choice then this.show()
          else this.hide()

      if bind
        switch bind
          when "text" then this.text(choice)
          when "html" then this.html(choice)
          else
            match = bind.match(/@(.*)/)
            if match
              this.attr(match[1], choice)

  # Used as a fallback in case the experiment info doesn't contain a default field.
  # Determines a default variant from the first "data-show" attribute in the page.
  findDefaultVariant = (cssClass, dataPrefix) =>
    eachVariantAndGoal cssClass, dataPrefix, (show, bind, goal) ->
      if show then return show
    return null

  initGoals = (uuid, cssClass, dataPrefix) =>
    eachVariantAndGoal cssClass, dataPrefix, (show, bind, goal) ->
      switch goal
        when "click"
          this.mynaClick(uuid)

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

  $.initNow = (options) =>
    options = $.extend({}, $.mynaDefaults, options)
    $.mynaLog("myna", options, options.experiments)
    $.each options.experiments, (index, exptOptions) =>
      $.mynaLog(" - ", exptOptions)
      exptOptions = $.extend({ dataPrefix: options.dataPrefix, sticky: options.sticky }, exptOptions)
      $.initExperiment(exptOptions)

  $.init = (options) =>
    $(document).ready(() => $.initNow(options))

  return $.noConflict()

window.Myna = initPlugin(window.jQuery, window, document)
