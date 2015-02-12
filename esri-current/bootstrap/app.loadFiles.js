(function(mapClient) {
  'use strict';

  // private variables
  var _scripts = [];
  var _styles = [];
  var _callback;

  // public methods
  mapClient.loadFiles = {
    load: load,
  };

  ////////////////

  function load(scripts, styles, callback) {
    _scripts = _scripts.concat(scripts);
    _styles = _styles.concat(styles);
    _callback = callback;

    while (_scripts.length > 0) {
      var script = _scripts.shift();
      console.log(script);
      loadScript(script);
    }

    while (_styles.length > 0) {
      var style = _styles.shift();
      console.log(style);
      loadStyleSheet(style);
    }
  }

  function loadScript(url) {
    if (url === null) return;
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    script.onload = onFileLoaded;

    head.appendChild(script);
  }

  function loadStyleSheet(url) {
    if (url === null) return;
    var head = document.getElementsByTagName('head')[0];
    var css = document.createElement("link");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    css.setAttribute("href", url);

    css.onload = onFileLoaded;
    head.appendChild(css);
  }

  /**
   * Called when a script is correctly loaded
   **/
  function onFileLoaded() {
    if ((_scripts.length === 0) && (_styles.length === 0)) {
      _callback();
    }
  }

})(window.mapClient = window.mapClient || {});