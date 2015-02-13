(function(config, utils) {
  'use strict';

  var extendedConfig = {

    APP: {
      TITLE: "VTS Map"
    },

    APIS: {
      MAPSERVICE: window.URL_VTS_AGS + 'Shared/OperationalLayers/MapServer'
    },

    MAP: {
      EXTENT: {
        "xmin": 0,
        "ymin": 4,
        "xmax": 15,
        "ymax": 14
      }
    },

    MODULES: {
      XY: true
    },

    IDENTIFY_CLICK: {
      QUERYABLE_LAYERS: []
    },

    LAYERS: {
      VISIBLE: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14],
      REFRESH_DELAY: 1000,
      EXTENT_TYPE_CODE: {
        "State": {
          "id": 12,
          "field": "StateCode",
          "searchField": "StateCode",
          "outFields": "OBJECTID"
        },
        "LGA": {
          "id": 13,
          "field": "LGACode",
          "searchField": "LGACode",
          "outFields": "OBJECTID"
        },
        "Ward": {
          "id": 14,
          "field": "WardCode",
          "searchField": "WardCode",
          "outFields": "OBJECTID"
        },
        "BUA": {
          "id": 7,
          "field": "SettlementObjectId",
          "searchField": "GlobalID",
          "outFields": "OBJECTID"
        },
        "SSA": {
          "id": 3,
          "field": "SettlementObjectId",
          "searchField": "GlobalID",
          "outFields": "OBJECTID"
        },
        "HA": {
          "id": 5,
          "field": "SettlementObjectId",
          "searchField": "GlobalID",
          "outFields": "OBJECTID"
        },
        "PrimarySettlementName": {
          "id": 0,
          "field": "SettlementGlobalID",
          "searchField": "GlobalID",
          "outFields": "OBJECTID"
        },
        "AlternateSettlementName": {
          "id": 1,
          "field": "SettlementGlobalID",
          "searchField": "GlobalID",
          "outFields": "OBJECTID"
        }
      }
    }
  };

  utils.javascript.mergeIntoObject(extendedConfig, config);

})(window.mapClient.config, window.mapClient.utils);
