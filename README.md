Myna for HTML
=============

Copyright 2012 Myna Ltd

Released under the [BSD 3-clause license](http://opensource.org/licenses/BSD-3-Clause).
See [LICENSE.md](https://github.com/myna/myna-html/blob/master/LICENSE.md) for the full text.

# What is *Myna for HTML*?

It's simple way of creating [Myna](http://mynaweb.com) A/B tests without writing any custom Javascript code. All you need are HTML and CSS.

Our aim is to integrate this functionality into the Myna dashboard. When you create an experiment, we'll give you a code snippet to copy-and-paste into your web page. Once that's done, you can configure the rest of the experiment using pure HTML and CSS. No Javascript required.

There are some live demos of running on the [Myna web site](http://mynaweb.com/demo/html).

# How do I use it?

## Getting started

Very soon we will update the dashboard on Myna to allow you to copy-and-paste a snippet of code into your web page to get you started. Here's an example:

    <!-- Start of Myna integration -->
    <script src="http://cdn.mynaweb.com/clients/myna-html-1.latest.min.js"></script>

    <script>
      Myna.init({ "experiments": [
        { "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "class": "myna", "default": "variant1" }
      ]})
    </script>
    <!-- End of Myna integration -->

You can try this now by copying-and-pasting this code into a web page of your own. You'll need to customise the following:

 - replace `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` with the UUID of your experiment;
 - replace `variant1` with the name of one of the variants from your experiment.

The snippet associates your experiment with a CSS class, in this case `myna`. All you need to do is tag the different parts of your variants and conversion goals with the same CSS class. Our code automagically adds all of the Myna goodness to your page.

## Designing your variants

*Myna for HTML* lets you do design variants in two ways:

 1. You can alter large parts of a page by showing and hiding different HTML elements in each variant.
    This is done with the `data-show` HTML data attribute.

 2. You can make minor tweaks by using the name of a variant as the text, HTML,
    or an attribute value in an element. This is done with the data-bind` HTML data attribute.

### Showing and hiding HTML elements

Let's say you want to test different variants of a hero image. One way of doing this is to include every variant of the image in your page and hide them all except one. Here's how you do it:

 1. Add the images to your page:

        <img src="hero1.jpg">
        <img src="hero2.jpg">
        <img src="hero3.jpg">

 2. Tag each image with the CSS class for your experiment:

        <img class="myna" src="hero1.jpg">
        <img class="myna" src="hero2.jpg">
        <img class="myna" src="hero3.jpg">

 3. Add a `data-show` attribute to each image containing the name of one of the variants
    from your Myna dashboard:

        <img class="myna" data-show="variant1" src="hero1.jpg">
        <img class="myna" data-show="variant2" src="hero2.jpg">
        <img class="myna" data-show="variant3" src="hero3.jpg">

**Pro tip:** You may want to use CSS to hide the images by default or fix the size of a container to avoid unwanted pop-in while your page is loading.

### Changing the content of an element

Another common option for changing the content on your page is to test a small piece of copy such as a link, button label or article title. Here's how you do this for a link:

 1. Add the link to your page:

        <a href="goal.html">Sign up now!</a>

 2. Tag the link with the CSS class for your experiment:

        <a class="myna" href="goal.html">Sign up now!</a>

 3. Add a `data-bind` attribute to the link:

        <a class="myna" data-bind="text" href="goal.html">Sign up now!</a>

    This uses the names of the variants on your Myna dashboard as the content of the element.

**Pro tip:** There are two possible values of `data-bind` that differ in the way they treat special HTML characters such as `<`, `>`, `&` and `"`:

 - `data-bind="text"` interprets special characters as parts of the visible text by *escaping* them to their HTML entity forms: `<` becomes `&lt;`, `&` becomes `&amp;` and so on;

 - `data-bind="html"` treats special characters as HTML, allowing you to write HTML tags in your variant names: `<b>` means *bold* and so on.

### Changing the style of an element

You may want to vary the CSS styles on your page in addition to or instead of your content. You can do this as follows:

 1. Add the element to your page:

        <div>...</div>

 2. Tag the element with the CSS class for your experiment:

        <div class="myna">...</div>

 3. Add a `data-bind` attribute to the element:

        <div class="myna" data-bind="class">...</div>

    This adds the name of a variant from your Myna dashboard as a new CSS class on the element.

### Changing an attribute of an element

You may want to vary the value of an element attribute such as the `src` of an image or or iframe. You can do this as follows:

 1. Add the element to your page:

        <img src="placeholder.jpg">

 2. Tag the element with the CSS class for your experiment:

        <img class="myna" src="placeholder.jpg">

 3. Add a `data-bind` attribute to the element:

        <img class="myna" data-bind="@src" src="placeholder.jpg">

    This replaces `placeholder.jpg` with the name of a variant from your Myna dashboard.

**Pro tip:** You can use `data-bind="@foo"` with any attribute of any element. You are only limited by your imagination (and the HTML spec).

## Specifying conversion goals

*Conversion goals* are actions you want your visitors to do, For example signing up to your mailing list or filling in your contact form. *Myna for HTML* identifies conversions as specific events such as clicks or page loads.

### Click goals

One common type of conversion goal is a click of a link or button. You can set these up as follows:

 1. Add the element to your page, It can be a link or button or any other type of element:

        <a href="goal.html">Click here</a>

 2. Tag the element with the CSS class for your experiment:

        <a class="myna" href="goal.html">Click here</a>

 3. Add a `data-goal` attribute to the element:

        <a class="myna" data-goal="click" href="goal.html">Click here</a>

    A reward will be send to Myna whenever a user clicks this button after a suggestion is made.

### Page load goals

Another common type of conversion goal is for the user to reach a specific page such as a *sign up complete* message. You can set these up as follows:

 1. Tag the `<body>` or `<html>` tag of your page with the CSS class for your experiment:

        <body class="myna">

 3. Add a `data-goal` attribute to the element:

        <body class="myna" data-goal="load">

    A reward will be send to Myna whenever a user loads this page after a suggestion is made.

**Pro tip:** If you are using this approach, it is likely that your goal page is different from the page you are testing with Myna. You need to copy and paste the code snippet into *both* pages for this approach to work.

## Tweaking the setup

### CSS class names

The Myna dashboard suggests `myna` as the default CSS class for your experiment. You may need to change this if you are already using this class for something else, or if you are running multiple experiments on the same page (see below).

To change the CSS class for your experiment, simply change the

    Myna.init({ "experiments": [
      { "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "class": "myna", "default": "variant1" }
    ]})

 - You can change this CSS class to whatever you want. Remember that all variants and goals for this experiment must be tagged with the same class.

### Multiple experiments on a page

Although the Myna dashboard does not yet provide code snippets for this, it is possible to run multiple experiments at once on the same page. To can set these up as follows:

 1. Add the extra experiments to the your code snippet as follows:

        Myna.init({ "experiments": [
          { "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "class": "experiment1", "default": "a1" },
          { "uuid": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "class": "experiment2", "default": "b1" },
          { "uuid": "cccccccc-cccc-cccc-cccc-cccccccccccc", "class": "experiment3", "default": "c1" }
        ]})

 2. Ensure every experiment is followed by a comma *except the last*.

 3. Make sure the `"uuid"` fields of each experiment are set to the correct values from your dashboard.

 4. Make sure each experiment has a *different* CSS `"class"`, and that the relevant elements in your page are tagged with the *same* class.

 5. Make sure the `"default"` fields are set to a variant name from the dashboard for each experiment.

### Sticky variants

By default, *Myna for HTML* uses a feature called *sticky variants*. Every visitor to your site is assigned a variant that stays with them for the duration of their stay. In addition, we only reward Myna the *first* time the user converts. Sticky variants provide two benefits:

 1. they ensure each visitor receives a consistent user experience;

 2. they ensure your results are not skewed by a single visitor repeatedly performing the same action.

Sticky variants accumulate one data point per unique visitor to your site. You can optionally switch off stickiness to collect one data point per page view (lots faster). However, bear the following in mind:

 1. Deactivating sticky variants will cause Myna to load a new variant on every page view. It is therefore
    only suitable for small tweaks that will not confuse your visitors.

 2. Non-sticky experiments cannot be run across web pages. Deactivating sticky variants is only appropriate
    if your entire experiment is contained on a single page.

You can deactivate sticky variants for an experiment by adding a `sticky: false` parameter to the copy-and-paste code snippet on your page:

    Myna.init({ "experiments": [
      { "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "class": "myna", "sticky": false }
    ]})

### Cookies

*Myna for HTML* uses a cookie to store suggestion data across pages in your site. The cookie stores the following information for each experiment you have running on your site:

 - the UUID of the experiment;
 - the last variant name suggested;
 - a yes/no flag to record whether the suggestion has been rewarded;
 - a random *response token* that is used to verify rewards and prevent accidental double-rewards.

The cookie does not store any personal information about your visitors.

The default cookie name is `"myna"`. The default scope is the path `/` on the current domain, and the default cookie lifetime is seven days. You can configure these options by adding fields to the code snippet from your dashboard. For example:

    Myna.init({
      "cookieOptions": {
        "domain": "yourdomain.com",   // customise the cookie domain
        "path": "/",                  // customise the cookie path
        "expires": 7                  // customise the expiry (number of days, specify null to use a session cookie)
      },
      "experiments": [
        { "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "class": "myna", "sticky": false }
      ]
    })

If you aren't familiar with coding Javascript, we recommend you consult a front-end developer or [get in touch](https://mynaweb.com/about/contact) to check your syntax.

### Customising the data attribute names

If you are already using the default `data-show`, `data-bind` or `data-goal` attribute names on your site, you may want to customise the names used by *Myna for HTML*. You can do this by adding a *dataPrefix* option to the code snippet from your dashboard:

    Myna.init({
      "dataPrefix": "foo",
      "experiments": [
        { "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "class": "myna", "default": "variant1" }
      ]
    })

This example changes the data attribute names to `data-foo-show`, `data-foo-bind` and `data-foo-goal` respectively. This change applies to all HTML elements for all experiments on the page.

# Contributing to the library

We welcome contributions and bug fixes from the community, although we have to make sure our documentation and dashboard integration remain up-to-date and bug free. If you would like to add new features to *Myna for HTML*, please [get in touch](https://mynaweb.com/about/contact) and let us know.

This project is written in [Coffeescript](http://coffeescript.org) and uses the [Grunt](https://github.com/cowboy/grunt) build tool. See the respective web sites for full manuals and installation instructions.

If you have Node.js and npm installed, you should be able to the necessary tools with:

    npm install -g grunt
    npm install -g coffee-script

The main command to build the library is then:

    grunt compile

which creates `dist/myna-html-x.y.z.js` and `dist/myna-html-x.y.z.min.js`.
