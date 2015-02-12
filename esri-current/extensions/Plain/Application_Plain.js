Application_Plain = {
    
    urlParams: {
        params: [],
        layerType: false,
        layerCode: false
    },

    startup: function () {
        Application.ignoreAddMap = true;

        var self = Application_Plain;

        Event.connect(Event.APP_INITIALIZED, function (data) {
            self.initialize();
        });

        Event.connect(Event.MAP_INIT, function (map) {
            var imageParameters = new esri.layers.ImageParameters();
            imageParameters.format = "PNG32";
            Map.imageParameters = imageParameters;
        });
    },

    initialize: function () {
        Map.addMap(null);
    },

};

Application_Plain.startup();