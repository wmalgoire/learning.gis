/**
* Class: Main VTS application.
*
* This module declares a singleton object, that is intended to be used
* directly.
*/
Application_Dashboard = {
    urlParams: {
        params: [],
        campaignId: false,
        day: false
    },


    dropdownConfigs: {},
    previouslyVisibleLayer: {},

    /*
        dropdown selection changed in the filter panel
    */
    filterChanged: function(element) {
        var filter = [];

        //get the selected options in each dropdown
        $('.layerFilter-additional-element > select').each(function() {
            var name = $(this).attr('data-prop-name');

            var groupingLayer = LAYER_CONFIG[name].group;
            var numberOfLayers = LAYER_CONFIG[name].number;

            var selectedItem = $(this).find(":selected");
            if (numberOfLayers != 0) {
                for (var i = groupingLayer + 1; i <= groupingLayer + numberOfLayers; i++) {
                    filter[i] = 'DateInt = ' + selectedItem.attr('value');
                }
            } else {
                //the case layer is special, beacause we need a different filter there
                filter[groupingLayer] = 'DateOfOnsetInt >= ' + selectedItem.attr('data-min') + ' AND DateOfOnsetInt < ' + selectedItem.attr('data-max');

                //set current year on the controller, to know it for later navigation
                parent.Controller.currentYear = parseInt(selectedItem.attr('value'));
            }
        });

        //send query
        mapClient.layers.dynamicLayer.setLayerDefinitions(filter);

        var $element = $(element);

        if ($element.attr('data-prop-name') == 'case') {
            //if the case dropdown was changed, then get the already selected location and show the dashboard details for those

            if (parent.Controller.lastClickDetails != null) {

                Application_Dashboard.viewDetails(parent.Controller.lastClickDetails.layerLevel, parent.Controller.lastClickDetails.identifier);
            } else {
                Application_Dashboard.viewDetails('Country', '');
            }
        }
    },

    /*
        an in-group radio button has been clicked
        only triggered if checked
    */
    radioClicked: function(element, name) {
        var groupingLayer = LAYER_CONFIG[name].group;

        //change parent group checked property
        //if ($(element).is(':checked')) {
            $('#tableFilter input[id="modif_' + groupingLayer + '"]').prop('checked', true);
        //}

            Application_Dashboard.groupVisibilityChanged('coverage', false);
            Application_Dashboard.groupVisibilityChanged('lqas', false);

        LayerList.updateLayerVisibility(false, true);
        //update the title of the panel
        Application_Dashboard.handleMainRadioChanged(element);
    },

    /*
        Group visibility changed
    */
    groupVisibilityChanged: function (name, update) {
        if (update === undefined) {
            //this is a direct click
            update = true;
        }

        var groupingLayer = LAYER_CONFIG[name].group;
        var numberOfLayers = LAYER_CONFIG[name].number;
        var radio;

        var $groupInput = $('input[id="modif_' + groupingLayer + '"]');

        if ($groupInput.is(':checked')) {
            if (update) {
                //this is a direct click

                //so we need to update the other groups as well
                $('input[id^="modif_"]').each(function () {
                    var $group = $(this);
                    if ($group.attr('data-group') != $groupInput.attr('data-group')) {
                        Application_Dashboard.groupVisibilityChanged($group.attr('data-group'), false);
                    }
                });

                //turn on underlying element
                var i = Application_Dashboard.previouslyVisibleLayer[name];
                if (i == undefined) {
                    //this is the first change to this group
                    i = groupingLayer + 1;
                }

                $('#tableFilter input[id="' + i + '"]')
                    .prop('checked', true);
            }

        } else {
            //turn off and store subelement
            for (var i = groupingLayer + 1; i <= groupingLayer + numberOfLayers; i++) {
                radio = $('#tableFilter input[id="' + i + '"]');

                if (radio.is(':checked')) {
                    //store and turn off

                    Application_Dashboard.previouslyVisibleLayer[name] = i;

                    radio.prop('checked', false);
                }
            }
        }

        if (update) {
            LayerList.updateLayerVisibility(false, true);
            //update the title of the panel
            Application_Dashboard.handleMainRadioChanged($groupInput);
        }
    },

    handleMainRadioChanged: function (element) {

        var e = $(element);
        if (e.attr('id').indexOf('modif_') == 0) {

            dojo.byId("panelMain").innerHTML = TITLE_CONFIG[parseInt(e.parent().parent().attr('data-id'))];
        } else {
            var id = parseInt(e.attr('id'));
            var title = '';
            for (p in TITLE_CONFIG) {
                if (id > p)
                    title = TITLE_CONFIG[p];
            }
            dojo.byId("panelMain").innerHTML = title;

        }


    },

/**
    *   Startup function, used to connect to Events
    **/
    startup: function() {
        mapClient.map.ignoreAddMap = true;

        var self = Application_Dashboard;

        Event.connect(Event.APP_INITIALIZED, function(data) {
            self.initialize();
        });

        Event.connect(Event.MAP_INIT, function(map) {

            //override the default map click:
            dojo.disconnect(Map.mapClickHandle);
            if (typeof (IDENTIFY_QUERYABLE_LAYERS) != "undefined" && IDENTIFY_QUERYABLE_LAYERS && IDENTIFY_QUERYABLE_LAYERS.length > 0) {
                Map.mapClickHandle = dojo.connect(Map.map, "onClick", Application_Dashboard.onMapClick);
            }

            dojo.connect(map, "onExtentChange", self.startTimeoutExtentChange);

            var imageParameters = new esri.layers.ImageParameters();
            var filter = [];

            for (p in LAYER_CONFIG) {
                var groupingLayer = LAYER_CONFIG[p].group;
                var numberOfLayers = LAYER_CONFIG[p].number;
                if (numberOfLayers != 0) {
                    for (var i = groupingLayer + 1; i <= groupingLayer + numberOfLayers; i++) {
                        if (self.dropdownConfigs[p][0].Value) {
                            filter[i] = 'DateInt = ' + self.dropdownConfigs[p][0].Value;
                        }
                    }
                } else {
                    filter[groupingLayer] = 'DateOfOnsetInt >= ' + self.dropdownConfigs[p][0].Min + ' AND DateOfOnsetInt < ' + self.dropdownConfigs[p][0].Max;
                }
            }

            imageParameters.format = "PNG32";
            imageParameters.layerDefinitions = filter;
            Map.imageParameters = imageParameters;
        });

        Event.connect(Event.LAYER_LIST_LOADED, function() {

            for (p in LAYER_CONFIG) {

                var groupingLayer = LAYER_CONFIG[p].group;
                var numberOfLayers = LAYER_CONFIG[p].number;

                var $originalGroupingLayer = $('#tableFilter > .layerFilter-row[data-id="' + groupingLayer + '"]');
                var $groupingLayer = $originalGroupingLayer;

                if (numberOfLayers != 0) {

                    for (var i = groupingLayer + 1; i <= groupingLayer + numberOfLayers; i++) {
                        $('#tableFilter input[id="' + i + '"]')
                            .attr('type', 'radio')
                            .attr('name', 'group_' + p)
                            .attr('onclick', 'Application_Dashboard.radioClicked(this, "' + p + '")');
                    }

                    $originalGroupingLayer.hide();
                    $groupingLayer = $originalGroupingLayer.clone();
                    $groupingLayer.show();

                    var input = $groupingLayer.find('input');
                    input
                        .attr('type', 'radio')
                        .attr('name', 'main_group')
                        .attr('onclick', 'Application_Dashboard.groupVisibilityChanged("' + p + '")')
                        .attr('data-group', p)
                        .attr('id', 'modif_' + input.attr('id'));

                    if (coverage && p == 'coverage') {
                        input.prop('checked', true);
                    }
                    else if (!coverage && p == 'lqas') {
                        input.prop('checked', true);
                    }
                }



                // create dropdown lists with the filter options
                var dropdown = '<div class="layerFilter-additional-element"><select data-prop-name="' + p + '" style="max-width: 90px;" onchange="Application_Dashboard.filterChanged(this)">';

                for (var j = 0; j < self.dropdownConfigs[p].length; j++) {
                    if (self.dropdownConfigs[p][j].Value) {
                        dropdown += '<option value="' + self.dropdownConfigs[p][j].Value + '">' + self.dropdownConfigs[p][j].Description + '</option>';
                    } else {
                        dropdown += '<option data-min="' + self.dropdownConfigs[p][j].Min + '" data-max="' + self.dropdownConfigs[p][j].Max + '" value="' + self.dropdownConfigs[p][j].Description + '">' + self.dropdownConfigs[p][j].Description + '</option>';

                    }
                }

                dropdown += '</select></div>';

                // add drop down
                $groupingLayer.append(dropdown);

                if (numberOfLayers != 0) {
                    $originalGroupingLayer.before($groupingLayer);
                }
            }
        });

        Event.connect(Event.MAP_LOADED, function(map) {
            self.extentChangeHandle = dojo.connect(map, "onExtentChange", self.callOthersExtentChanged);
            map.disableScrollWheelZoom();
        });
    },

    callOthersExtentChanged: function (extent) {
        var self = Application_Dashboard;

        clearTimeout(self.timeoutForCallToOthers);

        self.timeoutForCallToOthers = setTimeout(
            function() {
                self.onExtentChanged(extent);
                parent.Controller.changeExtent($('html'), extent);
            },
            10
        );
    },

    setExtent: function (extent) {
        var self = Application_Dashboard;
        dojo.disconnect(self.extentChangeHandle);
        Map.map.setExtent(extent).then(function() {
            self.extentChangeHandle = dojo.connect(Map.map, "onExtentChange", self.callOthersExtentChanged);
        });


    },

    viewDetails: function (layerLevel, identifier) {

        parent.Controller.lastClickDetails = {
            layerLevel: layerLevel,
            identifier: identifier
        };

        var year = $('.layerFilter-additional-element select[data-prop-name="case"]').find(":selected").attr('value');

        var data = {
            level: layerLevel,
            code: identifier,
            year: year
        }

        parent.Controller.viewDetails(data);
    },

    onMapClick: function (evt) {
        var app = Application;
        var self = Map;

        if (IDENTIFY_TOLERANCE && IDENTIFY_INFOTEMPLATES && IDENTIFY_INFOTEMPLATES.length > 0) {
            //create identify tasks and setup parameters
            var identifyTask = new esri.tasks.IdentifyTask(mapClient.services.mapServiceURL);

            var queryTheseLayers = [];
            for (var i = 0; i < IDENTIFY_QUERYABLE_LAYERS.length; i++) {
                if (mapClient.layers.visible.indexOf(IDENTIFY_QUERYABLE_LAYERS[i].toString()) !== -1) {
                    queryTheseLayers.push(IDENTIFY_QUERYABLE_LAYERS[i]);
                }
            }


            var identifyParams = new esri.tasks.IdentifyParameters();
            identifyParams.tolerance = IDENTIFY_TOLERANCE;
            identifyParams.returnGeometry = true;
            identifyParams.layerIds = queryTheseLayers;
            identifyParams.layerDefinitions = [];

            var dynamicLayer = mapClient.layers.dynamicLayer;

            if (dynamicLayer.layerDefinitions && dynamicLayer.layerDefinitions.length > 0) {
                var layerDefs = [];
                for (var i = 0; i < IDENTIFY_QUERYABLE_LAYERS.length; i++) {
                    var identifyableLayerId = IDENTIFY_QUERYABLE_LAYERS[i];
                    if (dynamicLayer.layerDefinitions[identifyableLayerId] && dynamicLayer.layerDefinitions[identifyableLayerId].length > 0) {
                        layerDefs[identifyableLayerId] = dynamicLayer.layerDefinitions[identifyableLayerId];
                    }
                }
                identifyParams.layerDefinitions = layerDefs;
            }

            identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
            identifyParams.width = self.map.width;
            identifyParams.height = self.map.height;
            identifyParams.geometry = evt.mapPoint;
            identifyParams.mapExtent = self.map.extent;

            var deferred = identifyTask.execute(identifyParams).addCallback(function (response) {
                // response is an array of identify result objects
                // Let's return an array of features.

                var res = [];
                var alreadyProcessedIdsLayerTypes = { "State": [], "LGA": [], "Ward": [] };

                for (var j = 0; j < response.length; j++) {
                    var result = response[j];
                    var feature = result.feature;
                    var layerName = result.layerName;
                    var layerId = result.layerId;

                    var layerType = null;

                    for (p in LAYER_LEVELS) {
                        if ($.inArray(layerId, LAYER_LEVELS[p]) !== -1) {
                            layerType = p;
                            break;
                        }
                    }

                    if (layerType != null && $.inArray(feature.attributes.OBJECTID, alreadyProcessedIdsLayerTypes[layerType]) !== -1) {
                        continue;
                    }
                    else if (layerType != null) {
                        alreadyProcessedIdsLayerTypes[layerType].push(feature.attributes.OBJECTID);
                    }

                    feature.attributes.layerName = layerName;
                    if (IDENTIFY_INFOTEMPLATES[layerId]) {
                        var content = IDENTIFY_INFOTEMPLATES[layerId].content;
                        if (!!(content && content.constructor && content.call && content.apply)) {
                            //content is a function
                            content = content(result);
                        }

                        var infoTemplate = new esri.InfoTemplate(IDENTIFY_INFOTEMPLATES[layerId].title,
                           content);
                        feature.setInfoTemplate(infoTemplate);
                    }
                    res.push(feature);
                }

                return res;
            });

            // InfoWindow expects an array of features from each deferred
            // object that you pass. If the response from the task execution
            // above is not an array of features, then you need to add a callback
            // like the one above to post-process the response and return an
            // array of features.
            self.map.infoWindow.setFeatures([deferred]);
            self.map.infoWindow.show(evt.mapPoint);
        }
        else {
            var alertMsg = "Configuration Missing" +
                "\n" +
                "Expected: " +
                "\n" +
                "<IDENTIFY_TOLERANCE>" +
                "\n" +
                "<IDENTIFY_INFOTEMPLATES>" +
                "\n" +
                "<IDENTIFY_QUERYABLE_LAYERS>";
            alert(alertMsg);
        }

    },

    /**
    * Method: initialize Initializes the module. Must be called once, before
    * interacting with the module.
    */
    initialize: function() {
        var self = Application_Dashboard;

        mapClient.services.mapServiceURL = URL_VTS_AGS + URL_SERVICE_BASE + "/MapServer";

        self.processURLParams();

        $.when(
                $.ajax({
                    dataType: "json",
                    url: LAYER_CONFIG.lqas.categoriesUrl
                }),
                $.ajax({
                    dataType: "json",
                    url: LAYER_CONFIG.coverage.categoriesUrl
                }),
                $.ajax({
                    dataType: "json",
                    url: LAYER_CONFIG.case.categoriesUrl
                }))
            .done(function(r1, r2, r3) {

                self.dropdownConfigs.lqas = r1[0];
                self.dropdownConfigs.coverage = r2[0];
                self.dropdownConfigs.case = r3[0];
                //show country map
                Map.addMap(null);
            });


    },


    /**
    * Process URL Params if it is VTS Application
    **/
    processURLParams: function() {
        var self = Application_Dashboard;

        // Extract URL parameters
        self.urlParams.params = mapClient.urlParams;

        self.urlParams.layerType = self.urlParams.params[PARAM_LAYER_TYPE];
        self.urlParams.layerCode = self.urlParams.params[PARAM_LAYER_CODE];
    },

    startTimeoutExtentChange: function(extent) {
        var self = Application_Dashboard;

        clearTimeout(self.timeoutExtentChanged);

        self.timeoutExtentChanged = setTimeout(
            function() {
                self.onExtentChanged(extent);
            },
            LAYERS_REFRESH_DELAY
        );
    },

    initialExtent: null,
    previousExtent: null,

    onExtentChanged: function (extent) {

    },

    highlightFeature: function (layerType, layerCode) {
        Application_Dashboard.clearHighlight();
        var configLayersExtentTypeCode = LAYERS_EXTENT_TYPE_CODE[layerType];
        var layerId = configLayersExtentTypeCode.id;
        var queryField = configLayersExtentTypeCode.field;
        var outFields = configLayersExtentTypeCode.outFields;

        var queryTask = new esri.tasks.QueryTask(mapClient.services.mapServiceURL + "/" + layerId);
        var query = new esri.tasks.Query();
        query.where = queryField + " = '" + layerCode + "'";
        query.outFields = [outFields];
        query.returnGeometry = true;

        queryTask.execute(query, function (feature) {
            Application_Dashboard.clearHighlight();
            if (feature && feature.features && feature.features.length > 0)
            //Map.highlightFeature(feature.features[0]);
                parent.Controller.highlightFeature2(feature.features[0]);
        });
    },

    highlightFeature2: function (f) {
        Application_Dashboard.clearHighlight();
        var g = new esri.Graphic(f.geometry);
        Map.highlightFeature(g);
    },

    clearHighlight: function() {
        if (Map.highlightLayer) {
            Map.map.removeLayer(Map.highlightLayer);
        }
    },
    clearHighlightPoint: function () {
        if (Map.highlightPointLayer) {
            Map.map.removeLayer(Map.highlightPointLayer);
        }
    },
    highlightCase: function (caseId, year) {

        if (year != parseInt($('select[data-prop-name="case"] :selected').text())) {
            return;
        }

        var queryTask = new esri.tasks.QueryTask(mapClient.services.mapServiceURL + "/" + 0);
        var query = new esri.tasks.Query();
        query.where = "NIGERIA.DBO.FC_ND_Case.CaseId='\{" + caseId + "\}'";
        query.outFields = ['NIGERIA.DBO.FC_ND_Case.OBJECTID'];
        query.returnGeometry = true;

        queryTask.execute(query, function (feature) {
            Application_Dashboard.clearHighlightPoint();
            if (feature && feature.features && feature.features.length > 0)
                Map.highlightPointFeature(feature.features[0]);
        });
    },
    /*
    zoomToState: function (layerCode) {
        if (LAYERS_EXTENT_TYPE_CODE['State']) {

            if (Map.map.infoWindow && Map.map.infoWindow.isShowing) {
                Map.map.infoWindow.hide();
            }
            var configLayersExtentTypeCode = LAYERS_EXTENT_TYPE_CODE['State'];
            var layerId = configLayersExtentTypeCode.id;
            var queryField = configLayersExtentTypeCode.field;
            var outFields = configLayersExtentTypeCode.outFields;

            // Set the query
            var queryTask = new esri.tasks.QueryTask(mapClient.services.mapServiceURL + "/" + layerId);
            var query = new esri.tasks.Query();
            query.where = queryField + " = '" + layerCode + "'";
            query.outFields = [outFields];
            query.returnGeometry = true;

            // Send the query and add the map
            queryTask.execute(query, function (featureSet) {

                if (Application_Dashboard.urlParams.layerCode && layerCode != Application_Dashboard.urlParams.layerCode) {
                    //remove highlight layer if any
                    if (Map.highlightLayer) {
                        Map.map.removeLayer(Map.highlightLayer);
                    }
                }

                Map.zoomTo(featureSet);
                Application_Dashboard.newInitialExtent = true;

                Application_Dashboard.changeMapTypeTo('State', layerCode);
            });
        }
    },
    */
};

Application_Dashboard.startup();
