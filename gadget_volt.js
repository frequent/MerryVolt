/*jslint nomen: true, indent: 2, maxlen: 80 */
/*global window, rJS, RSVP */
(function (window, rJS, RSVP) {
    "use strict";

  /////////////////////////////
  // parameters
  /////////////////////////////
  var STR = "";
  var KLASS = rJS(window);
  var CANVAS = "canvas";
  var ARR = [];
  var BLANK = "_blank";
  var NAME = "name";
  var VOLT = "volt_jio";
  var DIALOG_ACTIVE = "volt-dialog-active";
  var LOCATION = window.location;
  var DOCUMENT = window.document;
  var INTERSECTION_OBSERVER = window.IntersectionObserver;
  var TEMPLATE_PARSER = /\{([^{}]*)\}/g;
  var POPPER = "width=600,height=480,resizable=yes,scrollbars=yes,status=yes";
  var SOCIAL_MEDIA_CONFIG = {
    "facebook": "https://www.facebook.com/sharer.php?u={url}",
    "twitter": "https://twitter.com/intent/tweet?url={url}&text={text}&hashtags={tag_list}"
  };

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

  function getLang(nav) {
    return (nav.languages ? nav.languages[0] : (nav.language || nav.userLanguage));
  }

  function getConfig(my_language) {
    return {
      "type": "volt_storage",
      "repo": "MerryVolt",
      "path": "lang/" + my_language,
      "__debug": "https://softinst73904.host.vifib.net/xmas/lang/" + my_language + "/debug.json"
    };
  }

  KLASS

    /////////////////////////////
    // state
    /////////////////////////////
    .setState({
      "locale": getLang(window.navigator).substring(0, 2)
    })

    /////////////////////////////
    // ready
    /////////////////////////////
    .ready(function (gadget) {
      var element = gadget.element;
      gadget.property_dict = {
        "what": getElem(element, ".volt-what-content"),
        "why": getElem(element, ".volt-why-content"),
        "how": getElem(element, ".volt-how-content"),
        "unset": getElem(gadget.element, ".xmas-door_clear"),
        "dialog": getElem(gadget.element, ".volt-dialog"),

        // yaya, should be localstorage caling repair to sync
        "url_dict": {},
        "content_dict": {}
      };
    })

    /////////////////////////////
    // acquired methods
    /////////////////////////////
    .declareAcquiredMethod("translateDom", "translateDom")

    /////////////////////////////
    // published methods
    /////////////////////////////

    /////////////////////////////
    // declared methods
    /////////////////////////////

    // ---------------------- JIO bridge ---------------------------------------
    .declareMethod("route", function (my_scope, my_call, my_p1, my_p2, my_p3) {
      return this.getDeclaredGadget(my_scope)
        .push(function (my_gadget) {
          return my_gadget[my_call](my_p1, my_p2, my_p3);
        });
    })
    .declareMethod("volt_create", function (my_option_dict) {
      return this.route(VOLT, "createJIO", my_option_dict);
    })
    .declareMethod("volt_get", function (my_id) {
      return this.route(VOLT, "get", my_id);
    })
    .declareMethod("volt_allDocs", function () {
      return this.route(VOLT, "allDocs");
    })

   .declareMethod("stateChange", function (delta) {
      var gadget = this;
      var state = gadget.state;
      if (delta.hasOwnProperty("locale")) {
        state.locale = delta.locale;
      }
   })

    // thx: https://css-tricks.com/simple-social-sharing-links/
    // twitter prevalidate url: https://cards-dev.twitter.com/validator
    // https://developers.facebook.com/docs/sharing/best-practices/
    .declareMethod("shareUrl", function (my_scm) {
      var popup;
      var is_mobile = window.matchMedia("only screen and (max-width: 48em)");
      var popup_resolver;

      // lots of bells and whistles for trying to stay on the page, use this
      // with localstorage is we want to keep state or login on social media
      var resolver = new Promise(function (resolve, reject) {
        popup_resolver = function resolver(href) {
          return resolve({});
        };
      });

      popup = window.open(
        SOCIAL_MEDIA_CONFIG[my_scm].supplant({
          "url": encodeURIComponent(LOCATION.href),
          "text":"heya",
          "tag_list": "VoteVolt"
        }),
        is_mobile.matches ? BLANK : STR,
        is_mobile.matches ? null : POPPER
      );
      popup.opener.popup_resolver = popup_resolver;
      return window.promiseEventListener(popup, "load", true);
    })

    .declareMethod("showDialog", function (my_event) {
      var gadget = this;
      var dict = gadget.property_dict;
      var dialog = dict.dialog;
      var target = dict.url_dict[my_event.target.value];

      if (my_event.target.parentElement.classList.contains("is-locked")) {
        return;
      }
      if (!target || target.indexOf("http") === -1) {
        return;
      }
      return new RSVP.Queue()
        .push(function () {
          return gadget.volt_get(target);
        })
        .push(function (my_data) {

          // so much hoopla to translate the tab header in the template... sigh
          setDom(dict.what, getTemplate(KLASS, "what_template").supplant({
            "topic": my_data.title,
            "what_content": buildParagraphs(my_data.what)
          }), true);
          setDom(dict.why, getTemplate(KLASS, "why_template").supplant({
            "why_content": buildParagraphs(my_data.why)
          }), true);
          setDom(dict.how, getTemplate(KLASS, "how_template").supplant({
            "how_content": buildParagraphs(my_data.how)
          }), true);

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

    .declareMethod("fetchTranslationAndUpdateDom", function (my_language) {
      var gadget = this;
      var url_dict = gadget.property_dict.url_dict;
      return new RSVP.Queue()
        .push(function () {
          return gadget.volt_get(url_dict.ui);
        })
        .push(function (data) {
          return gadget.translateDom(data);
        });
    })

    .declareMethod("updateStorage", function (my_language) {
      var gadget = this;
      if (my_language === gadget.state.locale) {
        return;
      }
      return new RSVP.Queue()
        .push(function () {
          return gadget.stateChange({"locale": my_language});
        })
        .push(function () {
          return gadget.volt_create(getConfig(my_language));
        })
        .push(function () {
          return gadget.buildCalendarLookupDict();
        })
        .push(function () {
          return gadget.fetchTranslationAndUpdateDom();
        });
    })

    .declareMethod("buildCalendarLookupDict", function () {
      var gadget = this;
      var dict = gadget.property_dict;
      return new RSVP.Queue()
        .push(function () {
          return gadget.volt_allDocs();
        })
        .push(function (my_file_list) {
          my_file_list.data.rows.map(function (row) {
            dict.url_dict[row.id.split("/").pop().replace(".json", "")] = row.id;
          });
        });
    })

    // -------------------.--- Render ------------------------------------------
    .declareMethod("render", function (my_option_dict) {
      var gadget = this;
      var dict = gadget.property_dict;

      window.componentHandler.upgradeDom();
      mergeDict(dict, my_option_dict);
      return new RSVP.Queue()
        .push(function () {
          return gadget.volt_create(getConfig(gadget.state.locale));
        })
        .push(function () {
          return gadget.buildCalendarLookupDict();
        })
        .push(function () {
          return gadget.fetchTranslationAndUpdateDom(gadget.state.locale);
        });
    })


    /////////////////////////////
    // declared jobs
    /////////////////////////////

    /////////////////////////////
    // declared service
    /////////////////////////////
    .declareService(function () {
      DOCUMENT.body.classList.remove("volt-splash");      
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
          return this.shareUrl("facebook");
        case "volt-share-twitter":
          return this.shareUrl("twitter");
        case "volt-share-linkedin":
          return this.shareUrl("linkedin");
        case "volt-select-language":
          return this.updateStorage(event.target.volt_language.value);
      }
    })

    .onEvent("keydown", function (event) {
      if (event.key === "Escape" || event.key === "Esc" || event.keyCode === 27) {
        return this.handleDialog(true);
      }
    }, false, false);


}(window, rJS, RSVP));