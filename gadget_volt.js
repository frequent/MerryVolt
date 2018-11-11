/*jslint nomen: true, indent: 2, maxlen: 80 */
/*global window, rJS, RSVP, JSON, Blob, URL, Math, SimpleQuery, Query,
  ComplexQuery */
(function (window, rJS, RSVP, JSON, Blob, URL, Math, SimpleQuery, Query,
  ComplexQuery) {
    "use strict";

  /////////////////////////////
  // parameters
  /////////////////////////////
  var STR = "";

  var KLASS = rJS(window);
  var DIALOG_POLYFILL = window.dialogPolyfill;
  var LOCATION = window.location;
  var DOCUMENT = window.document;
  var INTERSECTION_OBSERVER = window.IntersectionObserver;
  var TEMPLATE_PARSER = /\{([^{}]*)\}/g;

  /////////////////////////////
  // methods
  /////////////////////////////
  function getElem(my_element, my_selector) {
    return my_element.querySelector(my_selector);
  }

  function mergeDict(my_return_dict, my_new_dict) {
    return Object.keys(my_new_dict).reduce(function (pass_dict, key) {
      pass_dict[key] = my_new_dict[key];
      return pass_dict;
    }, my_return_dict);
  }

  // poor man's templates. thx, http://javascript.crockford.com/remedial.html
  if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
      return this.replace(TEMPLATE_PARSER, function (a, b) {
        var r = o[b];
        return typeof r === "string" || typeof r === "number" ? r : a;
      });
    };
  }

  KLASS

    /////////////////////////////
    // state
    /////////////////////////////
    .setState({

    })

    /////////////////////////////
    // ready
    /////////////////////////////
    .ready(function (gadget) {
      gadget.property_dict = {};
    })

    /////////////////////////////
    // acquired methods
    /////////////////////////////

    /////////////////////////////
    // published methods
    /////////////////////////////

    /////////////////////////////
    // declared methods
    /////////////////////////////

    // -------------------.--- Render ------------------------------------------
    .declareMethod("render", function (my_option_dict) {
      var gadget = this;
      var dict = gadget.property_dict;
      window.componentHandler.upgradeDom();
      mergeDict(dict, my_option_dict);

    });


    /////////////////////////////
    // declared jobs
    /////////////////////////////

    /////////////////////////////
    // declared service
    /////////////////////////////

    /////////////////////////////
    // on Event
    /////////////////////////////

}(window, rJS, RSVP, JSON, Blob, URL, Math, SimpleQuery, Query,
  ComplexQuery));
