/*jslint nomen: true, indent: 2, maxlen: 80 */
/*global window, rJS, RSVP, Math */
(function (window, rJS, RSVP, Math) {
    "use strict";

  /////////////////////////////
  // parameters
  /////////////////////////////
  var STR = "";
  var ACTIVE = "is-active";
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
  var LANG = "https://raw.githubusercontent.com/VoltEuropa/MerryVolt/master/lang/";
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
  /*
  function waitForServiceWorkerActive(registration) {
    var serviceWorker;
    if (registration.installing) {
      serviceWorker = registration.installing;
    } else if (registration.waiting) {
      serviceWorker = registration.waiting;
    } else if (registration.active) {
      serviceWorker = registration.active;
    }
    if (serviceWorker.state !== "activated") {
      return RSVP.Promise(function (resolve, reject) {
        serviceWorker.addEventListener('statechange', function (e) {
          if (e.target.state === "activated") {
            resolve();
          }
        });
        RSVP.delay(500).then(function () {
          reject(new Error("Timeout service worker install"));
        });
      });
    }
  }
  */

  function getConfig(my_language) {
    return {
      "type": "volt_storage",
      "repo": "MerryVolt",
      "path": "lang/" + my_language
      //"__debug": "https://softinst103163.host.vifib.net/xmas/lang/" + my_language + "/debug.json"
    };
  }

  KLASS

    /////////////////////////////
    // state
    /////////////////////////////
    .setState({
      "locale": getLang(window.navigator).substring(0, 2) || "en",
      "online": null,
      "sw_errors": 0
    })

    /////////////////////////////
    // ready
    /////////////////////////////
    .ready(function (gadget) {
      var element = gadget.element;
      gadget.property_dict = {
        "unset": getElem(gadget.element, ".xmas-door_clear"),
        "dialog": getElem(gadget.element, ".volt-dialog"),
        "dialog_content": getElem(gadget.element, ".volt-dialog-content"),

        // yaya, should be localstorage caling repair to sync
        "url_dict": {},
        "content_dict": {},
        "i18n_dict": {}
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

    /*
    .declareMethod("installServiceWorker", function () {
      var gadget = this;
      if (navigator.serviceWorker === undefined) {
        return;
      }
      return new RSVP.Queue()
        .push(function () {
          return navigator.serviceWorker.register("serviceworker.js");
        })
        .push(function (registration) {
          return waitForServiceWorkerActive(registration);
        })
        .push(null, function (error) {
          return new RSVP.Queue()
            .push(function () {
              return gadget.stateChange("sw_errors", gadget.state.sw_errors + 1);
            })
            .push(function () {
              return RSVP.delay(1000);
            })
            .push(function () {
              return gadget.installServiceWorker();
            });
        });
    })
    */

    .declareMethod("stateChange", function (delta) {
      var gadget = this;
      var state = gadget.state;
  
      if (delta.hasOwnProperty("locale")) {
        state.locale = delta.locale;
      }
      if (delta.hasOwnProperty("online")) {
        state.online = delta.online;
        if (state.online) {
          gadget.element.classList.remove("volt-offline");
        } else {
          gadget.element.classList.add("volt-offline");
        }
      }
      //if (delta.hasOwnProperty("sw_errors")) {
      //  state.sw_errors = delta.sw_errors;
      //}
      return;
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
          "url": window.encodeURIComponent(LOCATION.href),
          "text":"",
          "tag_list": "VoteVolt,Europe"
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
      if (!target || target.indexOf("http") === -1 || gadget.state.online === false) {
        return;
      }

      return new RSVP.Queue()
        .push(function () {
          return gadget.volt_get(target);
        })
        .push(function (my_data) {
          var tab_head = STR;
          var tab_content = STR;
          var topic;
          var i;

          for (i = 0; i < my_data.topic_list.length; i += 1) {
            topic = my_data.topic_list[i];
            topic.id = i + 1;
            topic.active = i === 0 ? ACTIVE : STR;
            topic.title = my_data.title;
            topic.slug = "tab-" + Math.round(Math.random()*1000000,0);
            //window.encodeURIComponent(
            //  topic.proposal.substring(0,10).split(" ").join("-").toLowerCase()
            //);
            tab_head += getTemplate(KLASS, "dialog_tab_header").supplant(topic);

            // new year
            if (target.indexOf("31.json") > -1) {
              tab_content += getTemplate(KLASS, "dialog_ny_content").supplant(topic);
            } else {
              tab_content += getTemplate(KLASS, "dialog_tab_content").supplant(topic);
            }
          }

          setDom(dict.dialog_content, getTemplate(KLASS, "dialog_template").supplant({
            "tab_list": tab_head,
            "content_list": tab_content
          }), true);

          window.componentHandler.upgradeElements(dialog);
          return gadget.translateDom(dict.i18n_dict, dialog);
        })
        .push(function () {
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
      var dict = gadget.property_dict;
      var url_dict = dict.url_dict;
      return new RSVP.Queue()
        .push(function () {
          return gadget.volt_get(url_dict.ui);
        })
        .push(function (data) {
          dict.i18n_dict = data;
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
          if (my_file_list.data.total_rows === 0) {
            return gadget.updateStorage("en");
          }
          my_file_list.data.rows.map(function (row) {
            dict.url_dict[row.id.split("/").pop().replace(".json", "")] = row.id;
          });
        })

        // we only need a language to build the dict, so in case of errors like
        // on OS X/Safari 9, which cannot handle Github APIv3 redirect, we just
        // build the damn thing by hand... and fail somewhere else
        .push(undefined, function(whatever) {
          var i;
          for (i = 1; i < 32; i += 1) {
            dict.url_dict[i] = LANG + gadget.state.locale + "/" + i + ".json";
          }
          dict.url_dict["ui"] = LANG + gadget.state.locale + "/ui.json";
        });
    })

    .declareMethod("switchTab", function (dir) {
      var gadget = this;
      var elem = gadget.element;
      var tabs = elem.querySelectorAll(".mdl-tabs__tab");
      var panels = elem.querySelectorAll(".mdl-tabs__panel");
      var i;
      var len;
      var index;
      for (i = 0, len = tabs.length; i < len; i += 1) {
        if (tabs[i].classList.contains(ACTIVE)) {
          if (dir === 1) {
            index = tabs[i + 1] ? i + 1 : 0;  
          } else {
            index = tabs[i - 1] ? i - 1 : len - 1;
          }
          tabs[i].classList.remove(ACTIVE);
          panels[i].classList.remove(ACTIVE);
        }
      }
      tabs[index].classList.add(ACTIVE);
      panels[index].classList.add(ACTIVE);
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
      var body = DOCUMENT.body;
      var seo = body.querySelector(".volt-seo-content");
      seo.parentElement.removeChild(seo);
      body.classList.remove("volt-splash");     
    })

    /////////////////////////////
    // declared service
    /////////////////////////////
    .declareService(function () {
      var gadget = this;
      var listener = window.loopEventListener;

      function handleConnection() {
        return gadget.stateChange({"online": window.navigator.onLine});
      }
      return RSVP.all([
        //gadget.installServiceWorker(),
        listener(window, "online", false, handleConnection),
        listener(window, "offline", false, handleConnection),
      ]);
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
        case "volt-dialog-prev":
          return this.switchTab(-1);
        case "volt-dialog-next":
          return this.switchTab(1);
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

    /*
    .onEvent("beforeinstallprompt", function (event) {
      var gadget = this;
      var deferredPrompt;
      var btn = getElem(gadget.element, ".volt-homescreen-flag");

      function handleClick(my_click_event) {
        btn.style.display = "none";
        deferredPrompt.prompt();
        deferredPrompt.userChose.then(function (choise_result) {
          deferredPrompt = null;
          if (choise_result.outcome === 'accepted') {
            return;  
          }
          return;
        });
      }

      event.preventDefault();
      btn.style.display = "block";
      deferredPrompt = e;
      return window.loopEventListener(btn, "click", false, handleClick);
    }, false, false)
    */

    .onEvent("keydown", function (event) {
      if (event.key === "Escape" || event.key === "Esc" || event.keyCode === 27) {
        return this.handleDialog(true);
      }
    }, false, false);


}(window, rJS, RSVP, Math));