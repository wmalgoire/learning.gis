/**
* Class: Filters (Campaign Day and TeamCodes).
* 
* This module declares a singleton object, that is intended to be used
* directly.
*/
LayerFilters = {

    slider: null,

    tracksAnimationGraphicsLayer: null,

    currentPlayingFeatures: null,  //Array of Graphics used for the animation

    shouldPause: false, //defines whether the animation should be paused or not

    isSliderClicked: false, //detects whether the user manually changed a value on the slider

    pausedIndex: null, //stores the current index when paused


    /**
    * Init module
    */
    init: function () {
        var self = LayerFilters;

        //Inits the slider
        self.slider = new dijit.form.HorizontalSlider({
            name: "slider",
            class: 'slider',
            intermediateChanges: true,
            onChange: function (value) {
                if (self.shouldPause == true) {
                    self.addTracksUpToIndex(value);
                }
            },
            showButtons: false
        },
        "slider");

        self.slider.startup();
        self.initSlider();
        self.refreshStartButton();
        self.initSearch();
    },

    initSearch: function () {
        $("#imgTeamCodeSearch").css("cursor", "pointer");
        $("#imgTeamCodeSearch").click(filterTeamCodes);

        $("#inpTeamCode").keyup(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);

            if (keycode == '13') {
                filterTeamCodes();
            }
            else {
                filterTeamCodes();
            }
        });

        function filterTeamCodes() {
            var self = LayerFilters;
            var teamCode = $("#inpTeamCode").val().toUpperCase();
            var chkTeamCode;
            var chk;
            var teamName;

            $("#filter_list_teamcodes > .tableFilter > tbody > tr").each(function () {
                teamName = $(this).find("td:last");
                chk = $(this).find("input:first");
                chkTeamCode = teamName.html().toUpperCase();

                if ((chkTeamCode.indexOf(teamCode) !== -1) || (chk.prop('checked') == true)) {
                    $(this).show();
                }
                else {
                    $(this).hide();
                }

            });

            // $("#chkAllTeamCodes").prop('checked', teamCode.trim().length == 0);
            // $(".list_teamcode").each(function () {
            //     chkTeamCode = $(this).attr('id').toUpperCase();
            //     $(this).prop('checked', chkTeamCode.indexOf(teamCode, chkTeamCode.length - teamCode.length) !== -1)
            // });

            //Application_VTS.onFilterClick();
        }
    },

    initSlider: function () {
        var self = LayerFilters;
        self.updateSliderValue(0);
        dijit.byId("playTracksProgressBar").set("label", " ");
        dijit.byId("slider").setAttribute('disabled', true);

        //$("#playerDiv").attr("disabled", "disabled").off('click');

        self.displayStartButton();
    },

    /**
    * Tracks animation start
    */
    tracksAnimationStart: function () {
        var self = LayerFilters;
        var keys = [];
        var checkedTeamcodeId;

        if ($(".list_teamcode:checked").length > 0) {
            $(".list_teamcode:checked").each(function () {
                keys.push("'" + $(this).attr('id').substring(9, $(this).attr('id').length) + "'");
            });
        } else
            return;

        dijit.byId("slider").setAttribute('disabled', true);

        if (self.shouldPause) {
            //animation is paused, restart where it paused
            self.shouldPause = false;
            self.animationTracksAddPoint(self.pausedIndex);

            self.displayPauseButton();
        }
        else {
            // Stop animation if applicable
            self.tracksAnimationStop();

            if (dojo.hasClass("stopBtn", "stopBtn-disabled")) {
                dojo.removeClass("stopBtn", "stopBtn-disabled");
                dojo.addClass("stopBtn", "stopBtn");

                self.displayPauseButton();
            }

            // Get checked campaign days
            var campaignWhere = "AND CampaignDay IN(";
            var index = 0;
            inputs = dojo.query(".list_campaignday:checked");
            dojo.forEach(inputs, function (input) {
                var inputID = input.id.substring(12, input.id.length);
                if (index > 0)
                    campaignWhere += ", ";
                campaignWhere += inputID;
                index++;
            });
            campaignWhere += ")";

            // Build query
            var queryTask = new esri.tasks.QueryTask(Application.mapServiceURL + "/" + LAYERS_TRACKS_INFOS["layerIdTracksValid"]);
            var query = new esri.tasks.Query();
            query.where = "WardCode + TeamID + TeamCode IN (" + keys.toString() + ") " + campaignWhere;
            query.outFields = ["TimeStamp", "CampaignDay"];
            query.orderByFields = ["TimeStamp ASC"];
            query.returnGeometry = true;
            query.geometry = Application_VTS.getVisibleExtent();

            // Send query
            queryTask.execute(query, self.tracksAnimationStartQueryResult);
        }
    },

    displayStartButton: function () {
        var self = LayerFilters;

        $("#playBtn").attr('src', 'Images/Play.png');
        $("#playBtn").attr("title", "Play");
        $("#playBtn").removeClass("stopBtn-disabled");
        $("#playBtn").unbind();
        $("#playBtn").click(function () {
            self.tracksAnimationStart();
        });
    },

    refreshStartButton: function () {
        if ($(".list_teamcode:checked").length > 0 && $(".list_teamcode:checked").length <= $("#playBtn").attr("teamMax")) {
            LayerFilters.displayStartButton();
            return;
        }

        $("#playBtn").addClass("stopBtn-disabled");
        $("#playBtn").attr("title", "Player enabled for maximum " + $("#playBtn").attr("teamMax") + "  teams");
        $("#playBtn").unbind();
    },

    displayPauseButton: function () {
        var self = LayerFilters;

        $("#playBtn").attr('src', 'Images/Pause.png');
        $("#playBtn").attr("title", "Play");
        $("#playBtn").unbind();
        $("#playBtn").click(function () {
            self.tracksAnimationPause();
        });
    },

    /**
    * tracksAnimationStartQueryResult
    **/
    tracksAnimationStartQueryResult: function (featureSet) {
        var self = LayerFilters;
        var app = Application;

        if (featureSet) {
            // Query returned something ?
            if (featureSet.features.length > 0) {

                // Block map user navigation
                Map.enableUserNavigation(false);

                // Create graphics layer 
                self.tracksAnimationGraphicsLayer = new esri.layers.GraphicsLayer();

                // Add layer to the map
                Map.map.addLayer(self.tracksAnimationGraphicsLayer);

                // Create symbology for graphics layer
                var defaultSymbol = new esri.symbol.SimpleMarkerSymbol(PLAYTRACKS_CONFIG.defaultMarkerSymbol);

                // Create new renderer with symbology
                var renderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, "CampaignDay");

                for (var i = 0; i < PLAYTRACKS_CONFIG.colors.length; i++) {
                    var colorSymbol = new esri.symbol.SimpleMarkerSymbol(PLAYTRACKS_CONFIG.defaultMarkerSymbol);
                    colorSymbol.color = PLAYTRACKS_CONFIG.colors[i];
                    renderer.addValue(i + 1, colorSymbol);
                }

                self.tracksAnimationGraphicsLayer.renderer = renderer;

                var timestampStart = featureSet.features[0].attributes["TimeStamp"];
                var timestampStop = featureSet.features[featureSet.features.length - 1].attributes["TimeStamp"];

                self.updateSliderMinAndMax(0, 100);

                self.currentPlayingFeatures = featureSet.features;

                // Start "animation"
                self.animationTracksAddPoint(0);
            }
        }
    },



    /**
    * Animate tracks by using a timer
    *   - index: the index of the feature to add to the display
    */
    animationTracksAddPoint: function (index) {
        var self = LayerFilters;
        var app = Application;

        if (self.tracksAnimationGraphicsLayer != null) {

            var graphic = self.currentPlayingFeatures[index];
            var currentTimeStamp = graphic.attributes["TimeStamp"];

            self.tracksAnimationGraphicsLayer.add(graphic);

            var progress = Math.round(((index + 1) * 100) / self.currentPlayingFeatures.length);
            self.updateSliderValue(progress);

            self.updateProgressbarWithGraphic(graphic);

            if (index < self.currentPlayingFeatures.length - 1) {
                if (self.shouldPause == false) {
                    setTimeout(function () {
                        self.animationTracksAddPoint(index + 1);
                    }, PLAYTRACKS_CONFIG.animationDelayInMilliSec);
                }
                else {
                    self.pausedIndex = index;
                }
            } else {
                Map.enableUserNavigation(true);
                self.tracksAnimationPause();
                self.shouldPause = false;
            }
        }
        else {
            Map.enableUserNavigation(true);
        }
    },



    /**
    * Adds the current playing to tracks up to the given index
    *   - value: the index of the feature to add to the display in %
    */
    addTracksUpToIndex: function (value) {
        var self = LayerFilters;
        var app = Application;

        if (self.tracksAnimationGraphicsLayer != null) {
            dijit.byId("playTracksProgressBar").update({ progress: value });
            self.tracksAnimationGraphicsLayer.clear();

            var indexToShow = Math.floor((value * self.currentPlayingFeatures.length) / 100);
            self.pausedIndex = indexToShow;

            var lastGraphic;
            for (var i = 0; i < indexToShow - 1; i++) {
                lastGraphic = self.currentPlayingFeatures[i];
                self.tracksAnimationGraphicsLayer.add(lastGraphic);
            }

            if (lastGraphic != null) {
                self.updateProgressbarWithGraphic(lastGraphic);
            }
        }
    },



    /**
    * fs the animation (called when the user press 'Pause')
    **/
    tracksAnimationPause: function () {
        var self = LayerFilters;
        self.shouldPause = true;
        dijit.byId("slider").setAttribute('disabled', false);

        self.displayStartButton();
    },



    /**
    * Tracks animation stop
    */
    tracksAnimationStop: function () {
        var self = LayerFilters;
        var app = Application;
        self.shouldPause = false;

        if (self.tracksAnimationGraphicsLayer) {

            if (dojo.hasClass("stopBtn", "stopBtn")) {
                dojo.removeClass("stopBtn", "stopBtn");
                dojo.addClass("stopBtn", "stopBtn-disabled");

                self.displayStartButton();
            }

            // Clear data in the graphics layer
            self.tracksAnimationGraphicsLayer.clear();
            // Remove the layer from map
            Map.map.removeLayer(self.tracksAnimationGraphicsLayer);
            // Clean data
            self.tracksAnimationGraphicsLayer = null;

            self.currentPlayingFeatures = null;

            self.initSlider();
            Map.enableUserNavigation(true);
        }
    },


    /**
    * Updates the mininmum and maximum values for the animation slider
    **/
    updateSliderMinAndMax: function (min, max) {
        dijit.byId("slider").set("minimum", min);
        dijit.byId("slider").set("maximum", max);
    },



    /**
    * Updates the value of the animation slider
    **/
    updateSliderValue: function (value) {
        dijit.byId("playTracksProgressBar").update({ progress: value });
        dijit.byId("slider").set("value", value);
    },


    /**
    * Updates the progressbar color and label given the last graphic added for the animation
    **/
    updateProgressbarWithGraphic: function (graphic) {
        var campaignDay = graphic.attributes["CampaignDay"];
        dijit.byId("playTracksProgressBar").set("label", "Day " + campaignDay);

        var colorRGBA = PLAYTRACKS_CONFIG.colors[campaignDay - 1];
        dojo.query(".dijitProgressBarTile").style('background', '' + Application.rgbToHex(colorRGBA[0], colorRGBA[1], colorRGBA[2]));
    },



    /**
    * Build extent filters list
    */
    createFilterCheckboxHTML: function (id, attribute, fieldname) {
        var checkedStr = "checked=checked";

        if (!attribute.selected) {
            checkedStr = "";
        }

        var html = "<tr><td style='width:15px;'>";

        html += "<input type='checkbox' class='list_" + fieldname + "' " + checkedStr + " id='" + id + "' onclick='Application_VTS.onFilterClick();' />";
        html += "</td><td>";
        html += attribute.label;
        html += "</td></tr>";

        return html;
    },

    /**
    * flash
    **/
    flash: function (element, times) {
        var self = LayerFilters;
        var colors = ['none', 'inline'];
        dojo.style(element, 'display', colors[times % colors.length]);
        if (times === 0) {
            dojo.style(element, 'display', 'inline');
            return;
        }
        setTimeout(function () {
            self.flash(element, times - 1);
        }, 200);
    }
};
