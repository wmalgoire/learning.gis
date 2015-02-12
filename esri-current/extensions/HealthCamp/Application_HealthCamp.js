/**
* Class: Main VTS application.
*
* This module declares a singleton object, that is intended to be used
* directly.
*/
Application_HealthCamp = {

    urlParams: {
        params: [],
        campaignId: false,
        day: false
    },



    /**
    *   Startup function, used to connect to Events
    **/
    startup: function () {
        Application.ignoreAddMap = true;

        var self = Application_HealthCamp;

        Event.connect(Event.APP_INITIALIZED, function (data) {
            self.initialize();
        });

        Event.connect(Event.MAP_INIT, function (map) {
            var imageParameters = new esri.layers.ImageParameters();
            var filter = [];

            if (Application_HealthCamp.urlParams.day) {
                for (var j = 0; j < CAMPAIGN_DAY_LAYERS.length; j++) {
                    filter[CAMPAIGN_DAY_LAYERS[j]] = 'CampaignDay = ' + Application_HealthCamp.urlParams.day;
                }
            }
            imageParameters.format = "PNG32";
            imageParameters.layerDefinitions = filter;
            Map.imageParameters = imageParameters;

        });

        Event.connect(Event.LAYER_LIST_LOADED, function () {
            //when everything is loaded modify the layer list to contain radio buttons instead of the checkboxes for day 1 to N
            Application_HealthCamp.modifyLayerList();
        });
    },

    modifyLayerList: function () {
        if (!Application_HealthCamp.urlParams.day) {
            return;
        }

        var queryTask = new esri.tasks.QueryTask(Application.mapServiceURL + "/" + LAYER_FOR_DAYS);
        var query = new esri.tasks.Query();
        query.where = "1=1";
        query.outFields = ['CampaignDay'];
        query.returnGeometry = false;

        // Send the query and add the map
        queryTask.execute(query, function (featureSet) {
            if (!featureSet) {
                return;
            }
            // Query return something
            if (featureSet.features.length > 0) {


                var queriedDay = parseInt(Application_HealthCamp.urlParams.day);
                var items = [];
                for (var i = 0; i < featureSet.features.length; i++) {
                    var day = featureSet.features[i].attributes.campaignDay;

                    if (day === queriedDay) {
                        items.push('<option value="' + day + '" selected>' + day + '</option>');
                    } else {
                        items.push('<option value="' + day + '">' + day + '</option>');
                    }
                }

                var html = "<div id='day-selector-container'><span style='margin: 5px;'>Select campaign day</span><select id='day-selector'>";
                html += items.join(" ");
                html += "</select></div>";


                $('#layer_list').prepend(html);


                $('#day-selector').change(function() {
                    var newDay = $("#day-selector option:selected").val();

                    var filter = [];
                    for (var j = 0; j < CAMPAIGN_DAY_LAYERS.length; j++) {
                        filter[CAMPAIGN_DAY_LAYERS[j]] = 'CampaignDay = ' + newDay;
                    }

                    Application.dynamicLayer.setLayerDefinitions(filter);
                });
            }

        });

    },

    /**
    * Method: initialize Initializes the module. Must be called once, before
    * interacting with the module.
    */
    initialize: function () {
        var self = Application_HealthCamp;

        self.processURLParams();

        // If all parameters are here, handling extent
        if (self.urlParams.campaignId && self.urlParams.day) {

            //if we have the parameters, set the service url
            Application.mapServiceURL = URL_VTS_AGS + URL_SERVICE_BASE + self.urlParams.campaignId + "/MapServer";

            Map.addMap(null);
        }
        else if (self.urlParams.campaignId) {
            Application.mapServiceURL = URL_VTS_AGS + URL_SERVICE_BASE + self.urlParams.campaignId + "_CrossDays/MapServer";
            Map.addMap(null);
        }
        else {
            // Display default map
            Map.addMap(null);

            var alertMsg = "At least one parameter expected!" +
                "\n" +
                "Expected: " +
                "\n" +
                "<campaignId>";
            alert(alertMsg);
        }
    },


    /**
    * Process URL Params if it is VTS Application
    **/
    processURLParams: function () {
        var self = Application_HealthCamp;

        // Extract URL parameters
        self.urlParams.params = mapClient.urlParams;

        self.urlParams.campaignId = self.urlParams.params[PARAM_CAMPAIGN_ID];
        self.urlParams.day = self.urlParams.params[PARAM_DAY];
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

Application_HealthCamp.startup();
