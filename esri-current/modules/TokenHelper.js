/**
 * Date: 03.12.2014
 * Author: YM
 * Class: PanelInfo
 *
 * This class is used to display footer information
 */
define(
  ["dojo/_base/declare", "modules/_BaseWidget",
    "esri/urlUtils"
  ],

  function(declare, BaseWidget, urlUtils) {

    return declare(BaseWidget, {
      token: null,


      /**
       * Initialize the tool
       **/
      initialize: function() {
        var _this = this;

        this.addProxyRule();

      },

      addProxyRule: function() {
        var prefix = URL_VTS_AGS.replace("http://", "");
        prefix = prefix.replace("https://", "");
        prefix = prefix.split("/")[0];
        urlUtils.addProxyRule({
          urlPrefix: prefix,
          proxyUrl: "/Handlers/MapProxy/proxy.ashx?token=" + this.getValidToken()
        });
      },

      getValidToken: function() {
        var _this = this;

        if (!this.token) {
          var tokenTxt = $.ajax({
            url: tokenService,
            async: false
          }).responseText;
          this.token = JSON.parse(tokenTxt);

          var resetTimeout = Math.min(tokenTimeout, 600000);

          setTimeout(function() {
            _this.token = null;
            esri.config.defaults.io.proxyRules = [];
            _this.addProxyRule();
          }, resetTimeout);
        }
        return this.token;
      }

    });
  }
);
