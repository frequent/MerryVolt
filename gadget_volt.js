/*jslint nomen: true, indent: 2, maxlen: 80 */
/*global window, rJS, RSVP */
(function (window, rJS, RSVP) {
    "use strict";

  // dummy data
  var FAKE_RESPONSE = {
    "topic": "Demandeurs d’asile et réfugiés",
    "what": [{
      "lead": "Gérer les flux de réfugiés en provenance de l'extérieur de l'UE",
      "text": ", par la mise en place d'un système européen de gestion des réfugiés. Le système de Dublin doit être réformé et complété par un système de règlement qui prévoit des pénalités et des sanctions à l'encontre des États refusant de s'acquitter de leurs responsabilités."
    }, {
      "lead": "Rendre le système d'asile équitable, efficace et rapide",
      "text": ", en publiant des lignes directrices de l'UE qui garantissent des procédures d'asile plus courtes et prévoient des mesures sociales, juridiques, et un soutien psychologique."
    }, {
      "lead": "Assurer une intégration réussie et bénéfique à l'économie.",
      "text": "Les demandeurs d'asile doivent pouvoir entrer sur le marché du travail dès le premier jour, et leurs compétences doivent être plus facilement reconnues. De plus, une formation linguistique doit être offerte à tous les demandeurs d'asile."
    }, {
      "lead": "Faire respecter les droits des demandeurs d'asile et des réfugiés,par la surveillance et la sanction des Etats membres qui violent ces droits",
      "text": ", par exemple en détenant des demandeurs d'asile lorsque cela n'est pas nécessaire et dans des conditions inhumaines."
    }, {
      "lead": "Protéger ceux qui en ont besoin, en classant les migrants victimes de la famine et les migrants climatiques dans la catégorie des réfugiés",
      "text": " en vertu du droit européen et en renforçant l'utilisation de corridors humanitaires."
    }],
    "why": [],
    "how": []
  }; 

  /////////////////////////////
  // parameters
  /////////////////////////////
  var STR = "";
  var KLASS = rJS(window);
  var CANVAS = "canvas";
  var ARR = [];
  var NAME = "name";
  var DIALOG_ACTIVE = "volt-dialog-active";
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

  function getTemplate(my_klass, my_id) {
    return my_klass.__template_element.getElementById(my_id).innerHTML;
  }

  function purgeDom(my_node) {
    while (my_node.firstChild) {
      my_node.removeChild(my_node.firstChild);
    }
  }

  function setDom(my_node, my_string, my_purge) {
    var faux_element = DOCUMENT.createElement(CANVAS);
    if (my_purge) {
      purgeDom(my_node);
    }
    faux_element.innerHTML = my_string;
    ARR.slice.call(faux_element.children).forEach(function (element) {
      my_node.appendChild(element);
    });
  }

  function buildParagraphs(my_data_array) {
    return my_data_array.map(function (my_entry) {
      return getTemplate(KLASS, "paragraph_template").supplant({
        "paragraph_lead": my_entry.lead,
        "paragraph_text": my_entry.text
      });
    }).join("");
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
      gadget.property_dict = {
        "content": getElem(gadget.element, ".volt-dialog-content"),
        "unset": getElem(gadget.element, ".xmas-door_clear"),
        "dialog": getElem(gadget.element, ".volt-dialog")
      };
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
    /*
    https://stackoverflow.com/questions/26547292/how-create-a-facebook-share-button-without-sdk-or-custom-app-id
    .declareMethod("shareUrl", function (my_url, my_name, my_config) {
      var gadget = this;
      var popup;
      var popup_resolver;
      var resolver = new Promise(function (resolve, reject) {
        popup_resolver = function resolver(href) {
          return gadget.session_getAttachment(SLASH, STATE, {"format": "text"})
            .push(function (state) {
              var test = getUrlParameter("state", href);

              // already logged in
              if (test && state === test) {
                return gadget.session_removeAttachment(SLASH, STATE)
                  .push(function () {
                    return resolve({
                      "access_token": getUrlParameter("access_token", href),
                      "uid": getUrlParameter("uid", href),
                      "type": getUrlParameter("token_type", href)
                    });
                  });
              } else {
                return reject("forbidden");
              }
            });
        };
        popup = window.open(my_url, my_name, my_config);
        popup.opener.popup_resolver = popup_resolver;
        return window.promiseEventListener(popup, "load", true);
      });

      // Note: no longer RSVP.any with a timeout. if popup throws, we're stuck.
      return new RSVP.Queue()
        .push(function () {
          return resolver;
        })
        .push(function (my_ouath_dict) {
          popup.close();
          if (my_ouath_dict) {
            return my_ouath_dict;
          }
          throw {"code": 408};
        });
    })
    */
    .declareMethod("showDialog", function (my_event) {
      var gadget = this;
      var dialog = gadget.property_dict.dialog;
      if (my_event.target.parentElement.classList.contains("is-locked")) {
        return;
      }
      return new RSVP.Queue()
        .push(function () {
          return FAKE_RESPONSE;
        })
        .push(function (my_data) {
          setDom(
            gadget.property_dict.content,
            getTemplate(KLASS, "content_template").supplant({
              "what_subheader": my_data.topic,
              "what_content": buildParagraphs(my_data.what)
            }),
            true
          );
          window.componentHandler.upgradeElements(dialog);
          return gadget.handleDialog();
        });
    })

    .declareMethod("handleDialog", function (keyBoardOverride) {
      var gadget = this;
      var dict = gadget.property_dict;
      var dialog = getElem(gadget.element, (".volt-dialog"));
      var active_element = DOCUMENT.activeElement;

      function closeDialog() {
        dialog.classList.remove(DIALOG_ACTIVE);
        dict.unset.checked = true;
        return;
      }

      if (dialog.classList.contains(DIALOG_ACTIVE)) {
        return closeDialog();
      }
      if (!dialog.classList.contains(DIALOG_ACTIVE)) {
        dialog.classList.add(DIALOG_ACTIVE);
      }
      return;
    })

    // -------------------.--- Render ------------------------------------------
    .declareMethod("render", function (my_option_dict) {
      var gadget = this;
      var dict = gadget.property_dict;
      window.componentHandler.upgradeDom();
      mergeDict(dict, my_option_dict);
    })


    /////////////////////////////
    // declared jobs
    /////////////////////////////

    /////////////////////////////
    // declared service
    /////////////////////////////
    .declareService(function () {
      window.document.body.classList.remove("volt-splash");      
    })

    /////////////////////////////
    // on Event
    /////////////////////////////

    .onEvent("change", function (event) {
      return this.showDialog(event);
    })

    .onEvent("submit", function (event) {
      switch (event.target.getAttribute(NAME)) {
        case "volt-dialog-close":
          return this.handleDialog();
        case "volt-share-facebook":
          return this.shareUrl("fb");
        case "volt-share-twitter":
          return this.shareUrl("twitter");
      }
    })

    .onEvent("keydown", function (event) {
      if (event.key === "Escape" || event.key === "Esc" || event.keyCode === 27) {
        return this.handleDialog(true);
      }
    }, false, false);


}(window, rJS, RSVP));