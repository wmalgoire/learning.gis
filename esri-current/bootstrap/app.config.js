(function(mapClient) {
  'use strict';
  /* globals dojo, require */

  // public methods
  mapClient.config = {
    init: init,
  };

  ////////////////

  // public methods implementation
  function init() {
    configureDojoRequire();
    loadDojoDependencies();
  }

  function configureDojoRequire() {
    var locationPath = location.pathname.replace(new RegExp(/\/[^\/]+$/), '');

    // require({
    //   async: true,
    //   aliases: [
    //     ['text', 'dojo/text']
    //   ],
    //   packages: [{
    //     name: 'ui',
    //     location: locationPath + 'ui'
    //   }]
    // });
  }

  function loadDojoDependencies() {
    dojo.require("dijit.layout.BorderContainer");
    dojo.require("dijit.layout.ContentPane");
    dojo.require("dijit.layout.TabContainer");
    dojo.require("dijit.ProgressBar");
    dojo.require("esri.map");
    dojo.require("esri.dijit.Legend");
    dojo.require("esri.dijit.Scalebar");
    dojo.require("dijit.form.HorizontalSlider");
  }

})(window.mapClient = window.mapClient || {});