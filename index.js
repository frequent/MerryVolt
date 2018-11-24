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
    // declared service
    /////////////////////////////
    .declareService(function () {
      var gadget = this;
      return gadget.getDeclaredGadget("volt")
        .push(function (my_volt_gadget) {
          return my_volt_gadget.render(OPTION_DICT);
        })
        .push(null, function (my_error) {
          throw my_error;
        });
    });

}(window, rJS, RSVP));