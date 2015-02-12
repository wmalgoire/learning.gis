/**
* Class: Main VTS application.
*
* This module declares a singleton object, that is intended to be used
* directly.
*/
Application_Supervisor = {

    urlParams: {
        params: [],
        layerType: false,
        layerCode: false,
        campaignId: false,
        day: false,
        teamCode: false
    },

    /**
    *   Startup function, used to connect to Events
    **/
    startup: function () {
        Application.ignoreAddMap = true;

        var self = Application_Supervisor;

        Event.connect(Event.APP_INITIALIZED, function (data) {
            self.initialize();
        });

        Event.connect(Event.MAP_INIT, function (map) {
            var imageParameters = new esri.layers.ImageParameters();
            var filter = [];

            if (Application_Supervisor.urlParams.day) {
                for (var j = 0; j < CAMPAIGN_DAY_LAYERS.length; j++) {
                    filter[CAMPAIGN_DAY_LAYERS[j]] = 'CampaignDay = ' + Application_Supervisor.urlParams.day;
                }
            }
            if (Application_Supervisor.urlParams.teamCode) {
                for (var j = 0; j < TEAM_CODE_LAYERS.length; j++) {
                    if (filter[TEAM_CODE_LAYERS[j]])
                        filter[TEAM_CODE_LAYERS[j]] = filter[TEAM_CODE_LAYERS[j]] + ' AND TeamCode = \'' + Application_Supervisor.urlParams.teamCode + '\'';
                    else
                        filter[TEAM_CODE_LAYERS[j]] = 'TeamCode = ' + Application_Supervisor.urlParams.teamCode;
                }
            }
            imageParameters.format = "PNG32";
            imageParameters.layerDefinitions = filter;
            Map.imageParameters = imageParameters;

        });

        Event.connect(Event.LAYER_LIST_LOADED, function () {
            //when everything is loaded modify the layer list to contain radio buttons instead of the checkboxes for day 1 to N
            Application_Supervisor.modifyLayerList();
        });
    },

    modifyLayerList: function () {
			if (!Application_Supervisor.urlParams.day) {
				return;
			}
    },

    /**
    * Method: initialize Initializes the module. Must be called once, before
    * interacting with the module.
    */
    initialize: function () {
        var self = Application_Supervisor;

        self.processURLParams();

        // If all parameters are here, handling extent
        if (self.urlParams.layerType && self.urlParams.layerCode && self.urlParams.campaignId && self.urlParams.day) {

            Application.mapServiceURL = URL_VTS_AGS + URL_SERVICE_BASE + self.urlParams.campaignId + "/MapServer";
			Application.addMapWithExtent(self.urlParams.layerType, self.urlParams.layerCode);
            //if we have the parameters, set the service url
            //Map.addMap(null);
        }
        else {
            // Display default map
            Map.addMap(null);

            var alertMsg = "At least a parameter is missing!" +
                "\n" +
                "Expected: " +
                "\n" +
                "<layerType> (State, LGA, Ward, BUA, HA, SSA)" +
                "\n" +
                "<layerCode>" +
                "\n" +
                "<day> (1 to 10)" +
                "\n" +
                "<teamCode>" +
                "\n" +
                "<campaignId>";
            alert(alertMsg);
        }
    },


    /**
    * Process URL Params if it is VTS Application
    **/
    processURLParams: function () {
        var self = Application_Supervisor;

        // Extract URL parameters
        self.urlParams.params = mapClient.urlParams;

        self.urlParams.layerType = self.urlParams.params[PARAM_LAYER_TYPE];
        self.urlParams.layerCode = self.urlParams.params[PARAM_LAYER_CODE];
		self.urlParams.campaignId = self.urlParams.params[PARAM_CAMPAIGN_ID];
        self.urlParams.day = self.urlParams.params[PARAM_DAY];
        self.urlParams.teamCode = self.urlParams.params[PARAM_TEAM_CODE];
    },

    formatTime: function (hours) {
        var h = ('00' + parseInt(Math.floor(hours))).slice(-2);
        var minWithErrors = parseInt(Math.floor((hours - Math.floor(hours)) * 60));
        if (minWithErrors % 2 == 1) {
            minWithErrors++;
        }
        var m = ('00' + minWithErrors).slice(-2);
        return h + 'h '+m+'min';
    }
};

Application_Supervisor.startup();
