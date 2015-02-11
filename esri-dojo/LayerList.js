/**
* Class: LayerList (Lists the layers and their visibility)
* 
* This module declares a singleton object, that is intended to be used
* directly.
*/
LayerList = {
    //Timeout used to delay refresh for the layers (limits the number of requests sent to the server)
    timeoutUpdateLayerVisibility: null,
    
    //the width of the indentation of a group
    groupPadding: 20,

    /*
     * Goes up in the layer hierarchy and counts the parents
     */
    numberOfParentLayers: function (layer, layerId, visible) {
        //if we are on the top:
        if (layer.layerInfos[layerId] === undefined || layer.layerInfos[layerId].parentLayerId == -1) {
            //if the top layer is not visible
            if (visible && dojo.indexOf(LAYERS_NOT_SHOWN_IN_LAYERS_LIST, layerId) > -1) {
                return -1;
            }
            return 0;
        }

        //get the parents of the parent
        var parents = LayerList.numberOfParentLayers(layer, layer.layerInfos[layerId].parentLayerId, visible);

        if (visible) {
            //count the visibles only:
            if (dojo.indexOf(LAYERS_NOT_SHOWN_IN_LAYERS_LIST, layerId) > -1) {
                return parents;
            }
        }

        return 1 + parents;
    },

    /*
     * gets the logical parent of a layer row
     */
    getParent: function (element) {
        var level = parseInt(element.attr('data-row-level'));
        var indexOfCurrent = $('#tableFilter').children().index(element);

        for (var i = indexOfCurrent; i >= 0; i--) {
            var prevRow = $($('#tableFilter').children()[i]);
            if (parseInt(prevRow.attr('data-row-level')) == level - 1) {
                return prevRow;
            }
        }
        return null;
    },

    /**
    * Build layers list
    */
    buildLayerList: function (layer) {
        var app = Application;

        if (!LAYERS_VISIBLE) {
            LAYERS_VISIBLE = [];
            dojo.map(layer.layerInfos, function (info, index) {
                if (info.defaultVisibility) {
                    LAYERS_VISIBLE.push(info.id);
                }
            });
        }
        var items = dojo.map(layer.layerInfos, function (info, index) {
            var layerVisibility = false;

            // Get visibility from config
            if (dojo.indexOf(LAYERS_VISIBLE, info.id) > -1 && (info.subLayerIds == null || info.subLayerIds.length <= 0)) {
                app.visible.push(info.id.toString());
                layerVisibility = true;
            }

            //if it should not be shown, then do not show anything for this item
            if (dojo.indexOf(LAYERS_NOT_SHOWN_IN_LAYERS_LIST, info.id) > -1) {
                return "";
            }

            //otherwise display it:
            var parentsCount = LayerList.numberOfParentLayers(layer, info.id, true);
            var indent = parentsCount * LayerList.groupPadding;
            
            return "<div class='layerFilter-row' data-id='" + info.id + "' data-row-level='" + parentsCount + "'>" +
                        "<span class='layerFilter-placeholder' style='width:"+indent+"px;'></span>" +
                        "<div class='layerFilter-content'>" +
                            "<input type='checkbox' class='list_item' style='margin:0px 5px 0px 0px;'" + (layerVisibility ? "checked=checked" : "") + " id='" + info.id + "' onclick='LayerList.updateLayerVisibility();' />" +
                            "<span class='layerName' data-id='" + info.id + "'>" + info.name + "</span>" +
                            "<span data-id='" + info.id + "' class='visibleImg' title='Layer not visible at current scale'/>" +
                        "</div>" +
                    "</div>";
        });

        // Append checkbox
        var html = "<div id='tableFilter' class='tableFilter'>";
        html += items.join(" ");
        html += "</div>";
        dojo.byId("layer_list").innerHTML = html;

        // Set visible layers
        layer.setVisibleLayers(app.visible);
        Map.map.addLayer(layer);

        //when it is added to the map, subscribe to changes
        LayerList.subscribeToEvents();

        Event.connect(Event.MAP_EXTENT_CHANGE, function (extent) {
            LayerList.updateLayerScaleVisibility(layer);
        });
        LayerList.updateLayerScaleVisibility(layer);

        Event.trigger(Event.LAYER_LIST_LOADED, app);
    },

    /**
    * Shows or hides the icon showing the visibility of the layer given the scale of the map
    * PARAMS:
    *   - layer: ths ArcGISDynamicMapServiceLayer object corresponding to the layer represented in the layer list
    **/
    updateLayerScaleVisibility:function(layer){
        dojo.forEach(layer.layerInfos, function (layerInfo) {
            var mapScale = Map.map.getScale();

            var layerImgItems = dojo.query('.visibleImg[data-id="' + layerInfo.id + '"]');
            var layerNameItems = dojo.query('.layerName[data-id="' + layerInfo.id + '"]');

            if (layerInfo.maxScale == layerInfo.minScale || layerInfo.maxScale < mapScale && layerInfo.minScale > mapScale) {
                //console.info("$$$layerInfo: " + layerInfo.id + " - VISIBLE");
                dojo.forEach(layerImgItems, function (layerImg) {
                    dojo.style(layerImg, "display", "none");
                });
                dojo.forEach(layerNameItems, function (layerName) {
                    dojo.style(layerName, "color", "inherit");
                });
            }
            else {
               // console.info("$$$layerInfo: " + layerInfo.id + " - NOT VISIBLE");
                dojo.forEach(layerImgItems, function (layerImg) {
                    dojo.style(layerImg, "display", "inherit");
                });
                dojo.forEach(layerNameItems, function (layerName) {
                    dojo.style(layerName, "color", "#999999");
                });
            }
        });
    },

    /**
    * Update layers visibility
    */
    updateLayerVisibility: function (useTimeout, useRefresh) {
        if (useTimeout === undefined || useTimeout === null) {
            useTimeout = true;
        }

        if (useRefresh === undefined || useRefresh === null) {
            useRefresh = true;
        }

        var self = LayerList;

        if (useTimeout) {
            clearTimeout(self.timeoutUpdateLayerVisibility);

            self.timeoutUpdateLayerVisibility = setTimeout(function() {
                    LayerList.doUpdateLayerVisibility(useRefresh);
                },
                LAYERS_REFRESH_DELAY
            );
        } else {
            LayerList.doUpdateLayerVisibility(useRefresh);
        }
    },

    doUpdateLayerVisibility: function (useRefresh) {
        var app = Application;

        var inputs = dojo.query(".list_item");
        
        app.visible = [];

        dojo.forEach(inputs, function (input) {
            if (input.checked && !isNaN(parseInt(input.id))) {
                app.visible.push(input.id);
            }
        });

        // No visible layers
        if (app.visible.length === 0) {
            app.visible.push(-1);
        }



        // Set visible layers
        //second parameter says if the dynamic layer should be automatically refereshed or not. (If not, then the query is not sent to the server. 
        //It is good if there will be other filters in the same batch query
        app.dynamicLayer.setVisibleLayers(app.visible, !useRefresh);

        app.legend.refresh();
    },

    /*
     * performs the selection change on radio or checkbox items (everything that is below in the hierarchy should be changed as well)
     */
    handleChangeOnLayer: function(element, othersAsWell) {
        var $element = $(element);

        //get the row div
        var row = $element.closest('div.layerFilter-row');

        //find logical level
        var level = parseInt(row.attr('data-row-level'));
        //find index of current row
        var indexOfCurrent = $('#tableFilter').children().index(row);
            
        var totalNumOfRows = $('#tableFilter').children().length;

        //index of next element on the same logical level or higher. By default it is the index of the last + 1.
        var indexOfNext = totalNumOfRows;
        for (var i = indexOfCurrent + 1; i < totalNumOfRows; i++) {
            if (parseInt($($('#tableFilter').children()[i]).attr('data-row-level')) <= level) {
                indexOfNext = i;
                break;
            }
        }
            
        //change every checked between the two
        $('#tableFilter div.layerFilter-content > input[type="checkbox"], #tableFilter div.layerFilter-content > input[type="radio"]')
            .slice(indexOfCurrent, indexOfNext)
            .prop('checked', element.checked);
        
        //in case of radio buttons we have to change the items that are now unchecked in the group
        if ($element.attr('type') == 'radio')
        {
            if (othersAsWell) {

                //name of the group
                var name = $element.attr('name');

                //trigger event for other radio buttons in the same group, but do not cause infinite loo
                $('#tableFilter div.layerFilter-content > input[name="'+name+'"]')
                    .not($element)
                    .each(function() {
                        LayerList.handleChangeOnLayer(this, false);
                    });
            }                
        }
        
        //go upwards as well for unchecked elements.
        //if something gets unchecked, its groups should be unchecked as well.
        if (!element.checked) {
            var parent = LayerList.getParent($element.closest('div.layerFilter-row'));
            while (parent !== null) {
                parent.find('div.layerFilter-content > input[type="checkbox"], div.layerFilter-content > input[type="radio"]').prop('checked', false);
                parent = LayerList.getParent(parent);
            }
        }
    },

    
    /*
     * handle changes in the selection. (By default the elements are checkboxes but it can be changed to radio buttons as well
     */
    subscribeToEvents: function () {
        //use 'on' change. Maybe later we will dinamically add content as well
        $('#tableFilter').on('change', 'div.layerFilter-content > input[type="checkbox"], div.layerFilter-content > input[type="radio"]', function() {
            LayerList.handleChangeOnLayer(this, true);
        });
    }
};