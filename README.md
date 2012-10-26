jQuery Client for Myna
======================

Copyright 2012 Myna Ltd

Released under the [BSD 3-clause license](http://opensource.org/licenses/BSD-3-Clause).
See [LICENSE.md](https://github.com/myna/myna-jquery/blob/master/LICENSE.md) for the full text.

# What is this?

This is the beta version of a simple way of setting up [Myna](http://mynaweb.com) A/B tests without writing any Javascript.

As soon as we've ironed out the bugs, we will update the Myna dashboard to incorporate it directly into our user experience.

# Getting started

You can set up an experiment with the following easy steps. Expect these steps to get much simpler once build this into the Myna dashboard:

 1. Grab a copy of `jquery.myna.js` and place it somewhere on your web site

 2. Paste the following code just before the end of your `<head>` tag:

        <script src="/path/to/jquery.myna.js"></script>
        <script type="text/javascript">
          $.myna({
            "experiments": [{
              "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
              "class": "myna",
              "sticky": true
            }]
          })
        </script>

 3. Replace `/path/to/jquery.myna.js` with the correct path to `jquery.myna.js`

 4. Replace `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` with the UUID of your experiment

 5. Set up your variants. Variants are created by showing and hiding parts of your
    page. Simply add the CSS class `myna` to each variant and tag it with an HTML 5
    data attribute: `data-variant="name-of-the-relevant-variant"`. Here's an example:

        <img src="hero1.jpg" class="myna" data-variant="variant1">

 6. Set up your goals. Goals are things you want your user to click on (other types
    of action aren't yet supported). Simply add the CSS class `myna` to your goal
    links and buttons, and add the attribute `data-goal="click"`. Here's an example:

         <a href="http://example.com" class="myna" data-goal="click">Click me</a>

That's it - you're done! Whenever a new user visits your page, one of your variants will be selected by Myna. When the user clicks your goal links or buttons, Myna will be rewarded. It's that simple.

# Spanning multiple pages

You can easily set up experiments that span multiple pages. Paste the content from steps 2 to 4 above into each relevant page, and tag your variants and goals accordingly.

# Sticky and non-sticky experiments

By default, experiments are *sticky*. This means each visitor will always see the same variant of your page, and each variant will only be rewarded once for each visitor.

You can increase the rate at which you gather data by creating a *non-sticky* experiment. You can do this by setting the `sticky` property in the copy-and-paste code to `false`. Every time the page is loaded, a new variant will be requested from Myna.

Note that non-sticky experiments only work if they are confined to a single page.

# Documentation

There isn't any documentation yet beyond this README file.

# Demo

There aren't any live demos yet. We're working on them.

# Building the code

This project is written in [Coffeescript](http://coffeescript.org) and uses the [Grunt](https://github.com/cowboy/grunt) build tool. See the respective web sites for full manuals and installation instructions.

If you have Node.js and npm installed, you should be able to the necessary tools with:

    npm install -g grunt
    npm install -g coffee-script

The main command to build the library is then:

    grunt compile

which creates `dist/jquery.myna-x.y.z.js` and `dist/jquery.myna-x.y.z.min.js`.
