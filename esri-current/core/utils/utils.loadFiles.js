(function(utils) {
  'use strict';

  // private variables
  var _filesToLoad;
  var _callback;

  // public methods
  utils.loadFiles = {
    load: load
  };

  ////////////////

  function load(scripts, styles, callback) {
    _filesToLoad = scripts.length + styles.length;
    _callback = callback;

    if (!_filesToLoad) {
      _callback();
      return;
    }

    while (scripts.length > 0) {
      var script = scripts.shift();
      console.log(script);
      loadScript(script);
    }

    while (styles.length > 0) {
      var style = styles.shift();
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
    _filesToLoad--;
    if (!_filesToLoad) {
      _callback();
    }
  }

  // require(["dojo/Deferred", "dojo/dom", "dojo/on", "dojo/domReady!"],
  //   function(Deferred, dom, on) {
  //     function asyncProcess(msg) {
  //       var deferred = new Deferred();

  //       dom.byId("output").innerHTML += "<br/>I'm running...";

  //       setTimeout(function() {
  //         deferred.resolve(msg);
  //       }, 1000);

  //       return deferred.promise;
  //     }

  //     on(dom.byId("startButton"), "click", function() {
  //       var process = asyncProcess("first");
  //       process.then(function(results) {
  //         dom.byId("output").innerHTML += "<br/>I'm finished, and the result was: " + results;
  //         return asyncProcess("second");
  //       }).then(function(results) {
  //         dom.byId("output").innerHTML += "<br/>I'm really finished now, and the result was: " + results;
  //       });
  //     });

  //   });

  // require(["dojo/promise/all", "dojo/Deferred", "dojo/dom", "dojo/on", "dojo/json", "dojo/domReady!"],
  //   function(all, Deferred, dom, on, JSON) {

  //     function googleRequest() {
  //       var deferred = new Deferred();
  //       setTimeout(function() {
  //         deferred.resolve("foo");
  //       }, 500);
  //       return deferred.promise;
  //     }

  //     function bingRequest() {
  //       var deferred = new Deferred();
  //       setTimeout(function() {
  //         deferred.resolve("bar");
  //       }, 750);
  //       return deferred.promise;
  //     }

  //     function baiduRequest() {
  //       var deferred = new Deferred();
  //       setTimeout(function() {
  //         deferred.resolve("baz");
  //       }, 1000);
  //       return deferred.promise;
  //     }

  //     on(dom.byId("startButton"), "click", function() {
  //       dom.byId("output").innerHTML = "Running...";
  //       all({
  //         google: googleRequest(),
  //         bing: bingRequest(),
  //         baidu: baiduRequest()
  //       }).then(function(results) {
  //         dom.byId("output").innerHTML = JSON.stringify(results);
  //       });
  //     });

  //   });

  // require(["dojo/when", "dojo/Deferred", "dojo/dom", "dojo/on", "dojo/domReady!"],
  //   function(when, Deferred, dom, on) {
  //     function asyncProcess() {
  //       var deferred = new Deferred();

  //       setTimeout(function() {
  //         deferred.resolve("async");
  //       }, 1000);

  //       return deferred.promise;
  //     }

  //     function syncProcess() {
  //       return "sync";
  //     }

  //     function outputValue(value) {
  //       dom.byId("output").innerHTML += "<br/>completed with value: " + value;
  //     }

  //     on(dom.byId("startButton"), "click", function() {
  //       when(asyncProcess(), outputValue);
  //       when(syncProcess(), outputValue);
  //     });

  //   });

})(window.mapClient.utils);
