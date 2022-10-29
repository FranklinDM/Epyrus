/** ***** BEGIN LICENSE BLOCK *****
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

XPCOMUtils.defineLazyGetter(this, "gPrefService", function() {
  return Services.prefs;
});

var ToolbarIconColor = {
  init: function () {
    this._initialized = true;

    window.addEventListener("activate", this);
    window.addEventListener("deactivate", this);
    Services.obs.addObserver(this, "lightweight-theme-styling-update", false);
    gPrefService.addObserver("ui.colorChanged", this, false);

    // If the window isn't active now, we assume that it has never been active
    // before and will soon become active such that inferFromText will be
    // called from the initial activate event.
    if (Services.focus.activeWindow == window) {
      this.inferFromText();
    }
  },

  uninit: function () {
    this._initialized = false;

    window.removeEventListener("activate", this);
    window.removeEventListener("deactivate", this);
    Services.obs.removeObserver(this, "lightweight-theme-styling-update");
    gPrefService.removeObserver("ui.colorChanged", this);
  },

  handleEvent: function (event) {
    switch (event.type) {
      case "activate":
      case "deactivate":
        this.inferFromText();
        break;
    }
  },

  observe: function (aSubject, aTopic, aData) {
    switch (aTopic) {
      case "lightweight-theme-styling-update":
        // inferFromText needs to run after LightweightThemeConsumer.jsm's
        // lightweight-theme-styling-update observer.
        setTimeout(() => { this.inferFromText(); }, 0);
        break;
      case "nsPref:changed":
        // system color change
        var colorChangedPref = false;
        try {
          colorChangedPref = gPrefService.getBoolPref("ui.colorChanged");
        } catch(e) {}
        // if pref indicates change, call inferFromText() on a small delay
        if (colorChangedPref == true) {
          setTimeout(() => { this.inferFromText(); }, 300);
        }
        break;
      default:
        console.error("ToolbarIconColor: Uncaught topic " + aTopic);
    }
  },

  inferFromText: function () {
    if (!this._initialized) {
      return;
    }

    function parseRGB(aColorString) {
      let rgb = aColorString.match(/^rgba?\((\d+), (\d+), (\d+)/);
      rgb.shift();
      return rgb.map(x => parseInt(x));
    }

    let toolbarSelector = "toolbar:not([collapsed=true])";

    // The getComputedStyle calls and setting the brighttext are separated in
    // two loops to avoid flushing layout and making it dirty repeatedly.

    let luminances = new Map;
    for (let toolbar of document.querySelectorAll(toolbarSelector)) {
      let [r, g, b] = parseRGB(getComputedStyle(toolbar).color);
      let luminance = (2 * r + 5 * g + b) / 8;
	  luminances.set(toolbar, luminance);
    }

    for (let [toolbar, luminance] of luminances) {
      if (luminance <= 128) {
        toolbar.removeAttribute("brighttext");
      } else {
        toolbar.setAttribute("brighttext", "true");
      }
    }

    // Clear pref if set, since we're done applying the color changes.
    gPrefService.clearUserPref("ui.colorChanged");
  }
}
