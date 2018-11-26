/*jslint maxlen: 80, indent: 2 */
/*global window, rJS, RSVP */
(function (window, rJS, RSVP) {
  "use strict";

  /////////////////////////////
  // parameters
  /////////////////////////////
  var OPTION_DICT = {};

  rJS(window)

    /////////////////////////////
    // ready
    /////////////////////////////
    .ready(function (gadget) {
      var body_tags = gadget.element.querySelectorAll('[data-i18n]');
      var script;
      gadget.property_dict = {
        "body_tags": body_tags,
        "body_len": body_tags.length,
      };
    })

    /////////////////////////////
    // published methods
    /////////////////////////////
    .allowPublicAcquisition("translateDom", function (my_dict) {
      var gadget = this;
      var dict = gadget.property_dict;
      var i;
      var tag;

      // XXX?
      var dictionary = my_dict[0];

      for (i = 0; i < dict.body_len; i += 1) {
        tag = dict.body_tags[i];
        tag.textContent = dictionary[tag.getAttribute("data-i18n")];
      }
    })

    /////////////////////////////
    // declared service
    /////////////////////////////
    .declareService(function () {
      var gadget = this;
      return gadget.getDeclaredGadget("volt")
        .push(function (my_volt_gadget) {
          return my_volt_gadget.render(OPTION_DICT);
        })
        .push(null, function (my_error) {
          //throw my_error;

          // poor man's error handling
          var fragment = window.document.createDocumentFragment();
          var p = window.document.createElement("p");
          var br = window.document.createElement("br");
          var a = window.document.createElement("a");
          var body = window.document.getElementsByTagName('body')[0];
          p.classList.add("volt-error");
          p.textContent = "Sorry, your browser does not seem to support this application :( ";
          a.classList.add("volt-error-link");
          a.textContent = "www.volteuropa.org";
          a.setAttribute("href", "https://www.volteuropa.org/");
          fragment.appendChild(p);
          fragment.appendChild(br);
          fragment.appendChild(a);
  
          while (body.firstChild) {
            body.removeChild(body.firstChild);
          }
          body.appendChild(fragment);
        });
    });

}(window, rJS, RSVP));