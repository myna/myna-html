Myna for HTML
=============

Copyright 2012 Myna Ltd

Released under the [BSD 3-clause license](http://opensource.org/licenses/BSD-3-Clause).
See [LICENSE.md](https://github.com/myna/myna-jquery/blob/master/LICENSE.md) for the full text.

# What is *Myna for HTML*?

It's simple way of creating [Myna](http://mynaweb.com) A/B tests without writing any custom Javascript code. All you need are HTML and CSS.

Our aim is to integrate this functionality into the Myna dashboard. When you create an experiment, we'll give you a code snippet to copy-and-paste into your web page. Once that's done, you can configure the rest of the experiment using pure HTML and CSS. No Javascript required.

<!-- There are some live demos of running on the [Myna web site](http://mynaweb.com/demo/html5). -->

# How do I use it?

## Getting started

Very soon we will update the dashboard on Myna to allow you to copy-and-paste a snippet of code into your web page to get you started. Here's an example:

    <!-- Start of Myna integration -->
    <script src="http://cdn.mynaweb.com/clients/myna-html-1.latest.min.js"></script>

    <script>
      Myna.init({ "experiments": [
        { "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "class": "myna" }
      ]})
    </script>
    <!-- End of Myna integration -->

You can try this now by copying-and-pasting this code into a web page of your own. The text `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` needs to be replaced by the UUID of your experiment. We'll eventually do this for you as part of the Myna dashboard.

This code snippet associates your experiment with a CSS class, in this case `myna`. All you need to do is tag the different parts of your variants and conversion goals with the same CSS class. *Myna for HTML* does the rest for you.

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

Sometimes you may want to vary the CSS styles on your page in addition to or instead of your content. You can do this as follows:

 1. Add the element to your page:

        <div>...</div>

 2. Tag the element with the CSS class for your experiment:

        <div class="myna">...</div>

 3. Add a `data-bind` attribute to the element:

        <div class="myna" data-bind="@class">...</div>

    This uses the names of the variants on your Myna dashboard as the CSS class of the element.

**Note:** This approach *replaces* any existing classes on the element with the variant from Myna, *including* the `myna` class from step 2 above. This won't affect the operation of Myna, but may cause unintended side-effects if you're not expecting it.

**Pro tip:** You can change any attribute on an HTML tag instead of the CSS `class`: simply replace `@class` with an `@` sign and the name of the attribute. For example:

    <img class="myna" data-bind="@src" src="default.png">

## Specifying conversion goals

*Conversion goals* are actions you want your visitors to do, For example signing up to your mailing list or filling in your contact form. *Myna for HTML* identifies conversions as specific events such as clicks or page loads.

### Click goals

The most common type of conversion goal is a click of a link or button. You can set these up as follows:

 1. Add the element to your page, It can be a link or button or any other type of element:

        <a href="goal.html">Click here</a>

 2. Tag the element with the CSS class for your experiment:

        <a class="myna" href="goal.html">Click here</a>

 3. Add a `data-goal` attribute to the element:

        <a class="myna" data-goal="click" href="goal.html">Click here</a>

    A reward will be send to Myna whenever a user clicks this button after a suggestion is made.

### Page load goals

TODO: This feature isn't implemented yet - if you're badly in need of it, [get in touch](https://mynaweb.com/about/contact) and let us know. Watch this space for updates!

## Tweaking the setup

### CSS class names

TODO - Complete this. Notes:

 - *Myna for HTML* expects each experiment to be bound to a different CSS class.

 - This is what the "class": "foo" option does in the copy-and-paste snippet:

        Myna.init({ "experiments": [
          { "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "class": "myna" }
        ]})

 - You can change this CSS class to whatever you want. Remember that all variants and goals for this experiment must be tagged with the same class.

### Multiple experiments on a page

TODO - Complete this. Notes:

 - You can have multiple experiments running on the same page.

 - Add the extra experiments to the copy-and-paste snippet from the Dashboard:

        Myna.init({ "experiments": [
          { "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "class": "experiment1" },
          { "uuid": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "class": "experiment2" },
          { "uuid": "cccccccc-cccc-cccc-cccc-cccccccccccc", "class": "experiment3" }
        ]})

 - Make sure you give each experiment a different CSS class name, and make sure each experiment except the last is followed by a comma.

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

TODO - Complete this. Notes:

 - We use cookies as a temporary data store.

 - The cookies store the following for each experiment on your site:
    - the experiment UUID
    - the last suggestion made
    - a flag to record whether the suggestion has been rewarded yet
    - an internal response token used to reward the variant on Myna

 - By default, cookies are scoped to the current domain and the path `/`.
   This is configurable, e.g. for experiments that run across subdomains.

 - Cookies are used to implement sticky variants. The default lifetime is 7 days.

# Contributing to the library

We welcome contributions and bug fixes from the community, although we have to make sure our documentation and dashboard integration remain up-to-date and bug free. If you would like to add new features to *Myna for HTML*, please [get in touch](https://mynaweb.com/about/contact) and let us know.

This project is written in [Coffeescript](http://coffeescript.org) and uses the [Grunt](https://github.com/cowboy/grunt) build tool. See the respective web sites for full manuals and installation instructions.

If you have Node.js and npm installed, you should be able to the necessary tools with:

    npm install -g grunt
    npm install -g coffee-script

The main command to build the library is then:

    grunt compile

which creates `dist/myna-html-x.y.z.js` and `dist/myna-html-x.y.z.min.js`.
