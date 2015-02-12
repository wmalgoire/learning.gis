/**
* Class: Main VTS application.
*
* This module declares a singleton object, that is intended to be used
* directly.
*/
Application_CMSL = {

    urlParams: {
        params: [],
        layerType: false,
        layerCode: false
    },



    /**
    *   Startup function, used to connect to Events
    **/
    startup: function () {
        Application.ignoreAddMap = true;

        var self = Application_CMSL;

        Event.connect(Event.APP_INITIALIZED, function (data) {
            self.initialize();
        });

        Event.connect(Event.MAP_INIT, function (map) {
            var imageParameters = new esri.layers.ImageParameters();
            imageParameters.format = "PNG32";
            Map.imageParameters = imageParameters;
        });
    },



    /**
    * Method: initialize Initializes the module. Must be called once, before
    * interacting with the module.
    */
    initialize: function () {
        var self = Application_CMSL;

        self.processURLParams();

        // If all parameters are here, handling extent
        if (self.urlParams.layerType && self.urlParams.layerCode) {
            Application.addMapWithExtent(self.urlParams.layerType, self.urlParams.layerCode);
        }

        // Missing parameters
        else {
            // Display default map
            Map.addMap(null);

            var alertMsg = "2 parameters expected!" +
                "\n" +
                "Expected: " +
                "\n" +
                "<layerType> (State, LGA, Ward, BUA, HA, SSA)" +
                "\n" +
                "<layerCode>";
            alert(alertMsg);
        }
    },

    /**
    * Process URL Params if it is VTS Application
    **/
    processURLParams: function () {
        var self = Application_CMSL;

        // Extract URL parameters
        self.urlParams.params = mapClient.urlParams;
        self.urlParams.layerType = self.urlParams.params[PARAM_LAYER_TYPE];
        self.urlParams.layerCode = self.urlParams.params[PARAM_LAYER_CODE];
    }
};

Application_CMSL.startup();
