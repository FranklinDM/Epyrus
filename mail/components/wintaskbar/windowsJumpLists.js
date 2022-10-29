/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource:///modules/iteratorUtils.jsm");

/**
 * Constants
 */

var Cc = Components.classes;
var Ci = Components.interfaces;

// Prefs
var PREF_TASKBAR_BRANCH    = "mail.taskbar.lists.";
var PREF_TASKBAR_ENABLED   = "enabled";
var PREF_TASKBAR_TASKS     = "tasks.enabled";

/**
 * Exports
 */

this.EXPORTED_SYMBOLS = [
  "WinTaskbarJumpList",
];

/**
 * Smart getters
 */

XPCOMUtils.defineLazyGetter(this, "_stringBundle", function() {
  return Services.strings
                 .createBundle("chrome://messenger/locale/taskbar.properties");
});

XPCOMUtils.defineLazyServiceGetter(this, "_taskbarService",
                                   "@mozilla.org/windows-taskbar;1",
                                   "nsIWinTaskbar");

XPCOMUtils.defineLazyServiceGetter(this, "_winShellService",
                                   "@mozilla.org/mail/shell-service;1",
                                   "nsIWindowsShellService");

XPCOMUtils.defineLazyGetter(this, "_prefs", function() {
  return Services.prefs.getBranch(PREF_TASKBAR_BRANCH);
});

/**
 * Global functions
 */

function _getString(aName) {
  return _stringBundle.GetStringFromName(aName);
}

/**
 * Task list
 */
var gTasks = [
  // Write new message
  {
    get title()       { return _getString("taskbar.tasks.composeMessage.label"); },
    get description() { return _getString("taskbar.tasks.composeMessage.description"); },
    args:             "-compose",
    iconIndex:        2, // Write message icon
  },

  // Open address book
  {
    get title()       { return _getString("taskbar.tasks.openAddressBook.label"); },
    get description() { return _getString("taskbar.tasks.openAddressBook.description"); },
    args:             "-addressbook",
    iconIndex:        3, // Open address book icon
  },
];


var WinTaskbarJumpList = {

  /**
   * Startup, shutdown, and update
   */

  startup: function() {
    // exit if this isn't win7 or higher.
    if (!this._initTaskbar())
      return;

    // Win shell shortcut maintenance. If we've gone through an update,
    // this will update any pinned taskbar shortcuts. Not specific to
    // jump lists, but this was a convienent place to call it.
    try {
      // dev builds may not have helper.exe, ignore failures.
      this._shortcutMaintenance();
    }
    catch (ex) {
    }

    // Store our task list config data
    this._tasks = gTasks;

    // retrieve taskbar related prefs.
    this._refreshPrefs();

    // observer for our prefs branch
    this._initObs();

    this.update();
  },

  update: function() {
    // are we disabled via prefs? don't do anything!
    if (!this._enabled)
      return;

    // do what we came here to do, update the taskbar jumplist
    this._buildList();
  },

  _shutdown: function() {
    this._shuttingDown = true;

    this._free();
  },

  _shortcutMaintenance: function() {
    _winShellService.shortcutMaintenance();
  },

  /**
   * List building
   */

  _buildList: function() {
    // anything to build?
    if (!this._showTasks) {
      // don't leave the last list hanging on the taskbar.
      this._deleteActiveJumpList();
      return;
    }

    if (!this._startBuild())
      return;

    if (this._showTasks)
      this._buildTasks();

    this._commitBuild();
  },

  /**
   * Taskbar api wrappers
   */

  _startBuild: function() {
    // This is useful if there are any async tasks pending. Since we don't right
    // now, it's just harmless.
    this._builder.abortListBuild();
    // Since our list is static right now, we won't actually get back any
    // removed items.
    var removedItems = Cc["@mozilla.org/array;1"]
                         .createInstance(Ci.nsIMutableArray);
    return this._builder.initListBuild(removedItems);
  },

  _commitBuild: function() {
    if (!this._builder.commitListBuild()) {
      this._builder.abortListBuild();
    }
  },

  _buildTasks: function() {
    if (this._tasks.length > 0) {
      var items = toXPCOMArray(this._tasks.map(task =>
                                 this._createHandlerAppItem(task)),
                               Ci.nsIMutableArray);
      this._builder.addListToBuild(this._builder.JUMPLIST_CATEGORY_TASKS, items);
    }
  },

  _deleteActiveJumpList: function() {
    this._builder.deleteActiveList();
  },

  /**
   * Jump list item creation helpers
   */

  _createHandlerAppItem: function(aTask) {
    var file = Services.dirsvc.get("XREExeF", Ci.nsILocalFile);

    var handlerApp = Cc["@mozilla.org/uriloader/local-handler-app;1"]
                       .createInstance(Ci.nsILocalHandlerApp);
    handlerApp.executable = file;
    // handlers default to the leaf name if a name is not specified
    var title = aTask.title;
    if (title && title.length != 0)
      handlerApp.name = title;
    handlerApp.detailedDescription = aTask.description;
    handlerApp.appendParameter(aTask.args);

    var item = Cc["@mozilla.org/windows-jumplistshortcut;1"]
                 .createInstance(Ci.nsIJumpListShortcut);
    item.app = handlerApp;
    item.iconIndex = aTask.iconIndex;
    return item;
  },

  _createSeparatorItem: function() {
    return Cc["@mozilla.org/windows-jumplistseparator;1"]
             .createInstance(Ci.nsIJumpListSeparator);
  },

  /**
   * Prefs utilities
   */

  _refreshPrefs: function() {
    this._enabled = _prefs.getBoolPref(PREF_TASKBAR_ENABLED);
    this._showTasks = _prefs.getBoolPref(PREF_TASKBAR_TASKS);
  },

  /**
   * Init and shutdown utilities
   */

  _initTaskbar: function() {
    this._builder = _taskbarService.createJumpListBuilder();
    if (!this._builder || !this._builder.available)
      return false;

    return true;
  },

  _initObs: function() {
    Services.obs.addObserver(this, "profile-before-change", false);
    _prefs.addObserver("", this, false);
  },

  _freeObs: function() {
    Services.obs.removeObserver(this, "profile-before-change");
    _prefs.removeObserver("", this);
  },

  observe: function(aSubject, aTopic, aData) {
    switch (aTopic) {
      case "nsPref:changed":
        if (this._enabled == true && !_prefs.getBoolPref(PREF_TASKBAR_ENABLED))
          this._deleteActiveJumpList();
        this._refreshPrefs();
        this.update();
      break;

      case "profile-before-change":
        this._shutdown();
      break;
    }
  },

  _free: function() {
    this._freeObs();
    delete this._builder;
  },
};
