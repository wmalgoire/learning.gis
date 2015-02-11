/**
* Date: 04.12.2014
* Author: YM
* Class: GoTo
*
* This class is used to let the user search for a place and zoom to this place
*/
define(
  ["dojo/_base/declare", "modules/_BaseWidget"],

  function (declare, BaseWidget) {

      return declare(BaseWidget, {

          selectedFeature: {
              type: null,
              code: null,
              displayName: null
          },

          /**
          * Initialize the tool
          **/
          initialize: function () {
              var _this = this;
              this.loadGotoInput();
              $('#gotoInputDiv').show();
              $('#goToInput').show();
              $('#goToInput').focus();
          },


          /**
          * Loads the goTo autocomplete input
          **/
          loadGotoInput: function () {
              var _this = this;

              $('#goToInput').typeahead({
                  minLength: 3,
                  items: 300, //this should be <= than the one one server side
                  source: function (query, process) {
                      var $this = this;
                      return $.get('/Nav/SearchAreas', {
                          query: query
                      }, function (data) {
                          var options = [];
                          $this["map"] = {};
                          $.each(data, function (i, val) {
                              //put the code at the back, so the ordering will be still good, and we get unique names
                              var uniqueName = helper.getUniqueName(val);
                              options.push(uniqueName);
                              $this.map[uniqueName] = val;
                          });

                          return process(options);
                      });
                  },
                  updater: function (item) {
                      //save selected feature
                      var elem = this.map[item];
                      _this.selectedFeature.type = helper.getType(elem);
                      _this.selectedFeature.code = helper.getId(elem);
                      _this.selectedFeature.displayName = helper.getDisplayName(elem);
                      $("#currentSelection").html(_this.selectedFeature.displayName);
                      Application.zoomToExtentUsingSearchField(_this.selectedFeature.type, _this.selectedFeature.code, false, function (featureSet) {
                          Event.trigger(Event.MAP_ZOOMGEOMETRY, featureSet.features[0].geometry);
                          _this.map.setExtent(featureSet.features[0].geometry.getExtent());
                      });
                      Event.trigger(Event.GOTO_SELECTION, _this.selectedFeature);
                      $("#currentSelection").show();
                  },
                  highlighter: function (item) {
                      //highlight only in the first part
                      var parts = item.split(helper.splitter);
                      var h = this.__proto__.highlighter.call(this, parts[0]);
                      parts[0] = h;
                      var highlighted = parts.join(helper.splitter);
                      return helper.makeFriendlyNameFromUnique(highlighted);
                  },
              });

              var helper = (function () {

                  helper = {};
                  helper.splitter = ' (in ';

                  helper.getId = function (elem) {
                      return typeof elem.settlementCode !== 'undefined'
                          ? elem.settlementCode
                          : elem[helper.getType(elem).toLowerCase() + "Code"];
                  };
                  helper.getType = function (elem) {

                      if (typeof elem.settlementCode !== 'undefined') {
                          if (elem.isPrimaryName == 1) {
                              return elem.settlementType;
                          }
                          return "AlternateSettlementName";
                      }
                      if (typeof elem.wardCode !== 'undefined')
                          return "Ward";
                      if (typeof elem.lgaCode !== 'undefined')
                          return "LGA";
                      if (typeof elem.stateCode !== 'undefined')
                          return "State";

                      return "Country";
                  };
                  helper.getDisplayName = function (elem) {
                      switch (helper.getType(elem)) {
                          case 'AlternateSettlementName':
                          case 'BUA':
                          case 'HA':
                          case 'SSA':
                              return elem.settlementName + helper.splitter + elem.wardName + ', ' + elem.lgaName + ', ' + elem.stateName + ')';
                          case 'Ward':
                              return elem.wardName + helper.splitter + elem.lgaName + ', ' + elem.stateName + ')';
                          case 'LGA':
                              return elem.lgaName + helper.splitter + elem.stateName + ')';
                          case 'State':
                              return elem.stateName;
                          case 'Country':
                              return elem.countryName;
                          default:
                              return '';
                      }

                  };
                  helper.getUniqueName = function (elem) {
                      return helper.getDisplayName(elem) + "###" + helper.getId(elem);
                  };
                  helper.makeFriendlyNameFromUnique = function (uniqueName) {
                      var parts = uniqueName.split("###");
                      return parts[0];
                  };
                  return helper;
              })();
          }
      });
  }
);