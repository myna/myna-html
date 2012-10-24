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
    cookieName: "myna"
    cookieOptions: expires: 7   # days

  $.mynaLog = (args...) =>
    if $.mynaDefaults.debug
      console?.log?(args)

  $.mynaError = (args...) =>
    $.mynaLog(args...)
    throw args

  # Saving and loading suggestions --------------

  $.mynaSuggestions = {}

  loadSuggestions = () =>
    $.mynaLog("loadSuggestions")

    cookieName = $.mynaDefaults.cookieName

    $.mynaLog(" - ", cookieName)

    try
      JSON.parse($.cookie(cookieName)) || {}
    catch exn
      {}

  saveSuggestions = (suggestions) =>
    $.mynaLog("saveSuggestions", suggestions)

    cookieName = $.mynaDefaults.cookieName
    cookieValue = JSON.stringify(suggestions)
    cookieOptions = $.mynaDefaults.cookieOptions

    $.mynaLog(" - ", cookieName, cookieValue, cookieOptions)

    $.cookie(cookieName, cookieValue)

    $.mynaLog(" - ", document.cookie)

    return

  $.mynaSaveSuggestion = (uuid, choice, token, rewarded = false) =>
    $.mynaLog("mynaSaveSuggestion", uuid, choice, token, rewarded)

    suggestions = loadSuggestions()
    suggestions[uuid] = {
      choice:   choice
      token:    token
      rewarded: rewarded
    }
    saveSuggestions(suggestions)

    return

  $.mynaDeleteSuggestion = (uuid) =>
    $.mynaLog("mynaDeleteSuggestion", uuid)

    suggestions = loadSuggestions()
    delete suggestions[uuid];
    saveSuggestions(suggestions)

    return

  $.mynaLoadSuggestion = (uuid) =>
    $.mynaLog("mynaLoadSuggestion", uuid)
    loadSuggestions()[uuid] || null

  # Basic suggest and reward functions ----------

  $.mynaSuggest = (options) =>
    options = $.extend({}, $.mynaDefaults, options)

    success = options.success || (->)
    error   = options.error   || (->)

    uuid = options.uuid || $.mynaError("mynaSuggest: no uuid")
    url  = "#{options.apiRoot}/v1/experiment/#{uuid}/suggest"

    $.ajax
      url: url
      dataType: "jsonp"
      crossDomain: true
      success: (data, textStatus, jqXHR) =>
        if data.typename == "suggestion"
          $.mynaSaveSuggestion(uuid, data.choice, data.token)
          success(uuid: uuid, choice: data.choice, token: data.token)
        else
          $.mynaLog("mynaSuggest received #{data.typename}", data, textStatus, jqXHR)
          error(data, textStatus, jqXHR)
        return
      error: (jqXHR, textStatus, errorThrown) =>
        $.mynaLog("mynaSuggest received error", jqXHR, textStatus, errorThrown)
        error({}, textStatus, jqXHR, errorThrown)
        return

    return

  $.mynaReward = (options) =>
    options = $.extend({}, $.mynaDefaults, options)

    success = options.success || (->)
    error   = options.error   || (->)

    uuid   = options.uuid || $.mynaError("mynaReward: no uuid")
    stored = $.mynaLoadSuggestion(uuid)

    if stored && !stored.rewarded
      token  = stored.token
      choice = stored.choice
      $.mynaSaveSuggestion(uuid, choice, token, true)

      amount = options.amount || 1
      url    = "#{options.apiRoot}/v1/experiment/#{uuid}/reward?token=#{token}&amount=#{amount}"

      $.ajax
        url: url
        dataType: "jsonp"
        crossDomain: true
        success: (data, textStatus, jqXHR) =>
          if data.typename == "ok"
            $.mynaLog("mynaReward received ok", data, textStatus, jqXHR)
            $.mynaSaveSuggestion(uuid, choice, token, true)
            success(uuid: uuid, choice: choice, token: token, amount: amount)
          else
            $.mynaLog("mynaReward received #{data.typename}", data, textStatus, jqXHR)
          return
        error: (jqXHR, textStatus, errorThrown) =>
          $.mynaLog("mynaReward received error", jqXHR, textStatus, errorThrown)
          $.mynaDeleteSuggestion(uuid)
          error({}, textStatus, jqXHR, errorThrown)
          return
    else
      success()

    return

  # Event handlers ------------------------------

  $.mynaWrapHandler = (uuid, handler) ->
    $.mynaLog("wrapHandler", uuid, handler)
    (evt, args...) ->
      $.mynaLog("wrappedHandler", evt)

      self = $(this)

      stored = $.mynaLoadSuggestion(uuid)
      if stored && !stored.rewarded
        $.mynaLog(" - rewarding and retriggering")
        evt.stopPropagation()
        evt.preventDefault()
        $.mynaReward
          uuid: uuid
          success: () ->
            self.trigger(evt["type"])
            return
          error: () ->
            self.trigger(evt["type"])
            return
      else
        $.mynaLog(" - retriggering")
        handler.call(this, evt, args...)

      return

  $.fn.mynaClick = (uuid, args...) ->
    $.mynaLog("mynaClick", uuid, args...)
    switch args.length
      when 0
        this.click($.mynaWrapHandler(uuid, (->)))
      when 1
        handler = args[0]
        this.click($.mynaWrapHandler(uuid, handler))
      else
        eventData = args[0]
        handler = args[1]
        this.click(eventData, $.mynaWrapHandler(uuid, handler))

  # Automatic setup -----------------------------

  eachVariantAndGoal = (cssClass, handler) =>
    $(".#{cssClass}").each (index, elem) =>
      self = $(elem)
      variant = self.data("variant")
      goal    = self.data("goal")
      handler.call(self, variant, goal)

  showVariant = (cssClass, choice = null) =>
    eachVariantAndGoal cssClass, (variant, goal) ->
      if variant
        if choice && (variant == choice)
          this.show()
        else
          this.hide()

  initRewardHandlers = (uuid, cssClass) =>
    eachVariantAndGoal cssClass, (variant, goal) ->
      switch goal
        when "click"
          this.mynaClick(uuid)

  $.mynaInit = (options) =>
    uuid     = options["uuid"]
    cssClass = options["class"]
    sticky   = options["sticky"]

    if !uuid || !cssClass
      $.mynaLog("mynaInit: no uuid or CSS class", uuid, cssClass)
      return

    stored = $.mynaLoadSuggestion(uuid)

    $.mynaLog("mynaInit", uuid, cssClass, sticky, stored)

    if stored && (sticky || !stored.rewarded)
      $.mynaLog(" - recalling suggestion", stored.choice)
      showVariant(cssClass, stored.choice)
      initRewardHandlers(uuid, cssClass)
    else
      $.mynaLog(" - fetching suggestion")
      $.mynaSuggest
        uuid: uuid
        success: (data) =>
          showVariant(cssClass, data.choice)
          initRewardHandlers(uuid, cssClass)
          return
        error: () =>
          showDefaultVariant(cssClass)
          return

    return

  $.myna = (options) =>
    options = $.extend({}, $.mynaDefaults, options)
    $.mynaLog("myna", options)
    $.each options.experiments, (index, exptOptions) =>
      exptOptions = $.extend({ sticky: options.sticky }, exptOptions)
      $.mynaInit(exptOptions)

initPlugin(window.jQuery, window, document)