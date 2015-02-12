(function() {
  'use strict';
  /* globals define */

  define([
      "dojo/_base/declare",
      "dijit/_WidgetBase",
      "dijit/_TemplatedMixin",
      "dojo/dom-style",
      "dojo/on",
      "dojo/mouse",
      "dojo/_base/lang",
      "dojo/_base/fx",
      "dojo/text!./template.html",
    ],
    function(declare, _WidgetBase, _TemplatedMixin, domStyle, on, mouse, baseLang, baseFx, template) {
      return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        baseClass: "goToPlace",
        placeHolder: "State/LGA/Ward/Settlement",

        // A reference to our background animation
        mouseAnim: null,

        // Colors for our background animation
        baseBackgroundColor: "#fff",
        mouseBackgroundColor: "#def",

        postCreate: function() {
          // Get a DOM node reference for the root of our widget
          var domNode = this.domNode;

          // Run any parent postCreate processes - can be done at any point
          this.inherited(arguments);

          // Set our DOM node's background color to white -
          // smoothes out the mouseenter/leave event animations
          domStyle.set(domNode, "backgroundColor", this.baseBackgroundColor);
          
          // Set up our mouseenter/leave events
          // Using dijit/Destroyable's "own" method ensures that event handlers are unregistered when the widget is destroyed
          // Using dojo/mouse normalizes the non-standard mouseenter/leave events across browsers
          // Passing a third parameter to lang.hitch allows us to specify not only the context,
          // but also the first parameter passed to _changeBackground
          this.own(
            on(domNode, mouse.enter, baseLang.hitch(this, "_changeBackground", this.mouseBackgroundColor)),
            on(domNode, mouse.leave, baseLang.hitch(this, "_changeBackground", this.baseBackgroundColor))
          );
        },

        _changeBackground: function(newColor) {
          // If we have an animation, stop it
          if (this.mouseAnim) {
            this.mouseAnim.stop();
          }

          // Set up the new animation
          this.mouseAnim = baseFx.animateProperty({
            node: this.domNode,
            properties: {
              backgroundColor: newColor
            },
            onEnd: baseLang.hitch(this, function() {
              // Clean up our mouseAnim property
              this.mouseAnim = null;
            })
          }).play();
        }

      });
    });

})();