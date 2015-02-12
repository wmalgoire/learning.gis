/**
* Class: Main VTS application.
* 
* This module declares a singleton object, that is intended to be used
* directly.
*/
Application_EnvironmentalSites = {

    /**
    *   Startup function, used to connect to Events
    **/
    startup: function () {
        Application.ignoreAddMap = true;

        var self = Application_EnvironmentalSites;

        Event.connect(Event.APP_INITIALIZED, function (data) {
            self.initialize();
        });

    },


    /**
    * Method: initialize Initializes the module. Must be called once, before
    * interacting with the module.
    */
    initialize: function () {
        var self = Application_EnvironmentalSites;

        Map.addMap(null);
        //self.processURLParams();

        
    },

    

};

Application_EnvironmentalSites.startup();