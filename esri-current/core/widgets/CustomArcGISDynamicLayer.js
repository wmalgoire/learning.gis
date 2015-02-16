(function(mapClient) {
  'use strict';
  /* globals define */

  define([
      "dojo/_base/declare",
      "dojo/dom-construct",
      "dojo/on",
      "esri/layers/ArcGISDynamicMapServiceLayer",
      "dojo/io-query"
    ],

    function(declare, domConstruct, on, ArcGISDynamicMapServiceLayer, ioQuery) {

      return declare(ArcGISDynamicMapServiceLayer, {
        tokenHelper: null,

        getImageUrl: function(extent, width, height, callback) {
          var params = {
            dpi: this._params.dpi,
            transparent: this._params.transparent,
            layers: this._params.layers,
            format: this.imageFormat,
            bbox: extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax,
            bboxSR: 102100,
            imageSR: 102100,
            size: width + "," + height,
            f: "image",

          };

          if (this._params != null && this._params.layerDefs != null) {
            params.layerDefs = "{\"" + this._params.layerDefs.replace(/:/gi, "\":\"").replace(/;/gi, "\",\"") + "\"}";
          }
          var proxy = "";
          if (URL_PROXY != null && URL_PROXY.length > 0 && (!IS_ONLINE || USE_SECURE_SERVICES)) {
            proxy = URL_PROXY + "?";
          }

          if (USE_SECURE_SERVICES && this.tokenHelper != null) {
            callback(proxy + this._url.path + "/export?" + ioQuery.objectToQuery(params) + "&token=" + this.tokenHelper.getValidToken());
          } else {
            callback(proxy + this._url.path + "/export?" + ioQuery.objectToQuery(params));
          }
        }
      });
    }
  );

})(window.mapClient = window.mapClient || {});
