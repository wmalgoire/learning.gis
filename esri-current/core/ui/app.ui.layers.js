/**
 * Class: LayerList (Lists the layers and their visibility)
 */
(function(mapClient, config, events) {
  'use strict';
  /* globals dojo */

  // private properties
  var layersList = mapClient.ui.layers;
  var layersHidden = config.LAYERS.NOT_SHOWN_IN_LIST;
  var layersVisible = config.LAYERS.VISIBLE;

  // public properties
  mapClient.ui.layers = {
    timeoutUpdateLayerVisibility: null, //Timeout used to delay refresh for the layers (limits the number of requests sent to the server)
    groupPadding: 20, //the width of the indentation of a group
    numberOfParentLayers: numberOfParentLayers,
    getParent: getParent,
    buildLayerList: buildLayerList,
    updateLayerVisibility: updateLayerVisibility,
    updateLayerScaleVisibility: updateLayerScaleVisibility,
    doUpdateLayerVisibility: doUpdateLayerVisibility,
    handleChangeOnLayer: handleChangeOnLayer,
    subscribeToEvents: subscribeToEvents
  };

  ////////////////

  /*
   * Goes up in the layer hierarchy and counts the parents
   */
  function numberOfParentLayers(layer, layerId, visible) {
    //if we are on the top:
    if (layer.layerInfos[layerId] === undefined || layer.layerInfos[layerId].parentLayerId === -1) {
      //if the top layer is not visible
      if (visible && dojo.indexOf(layersHidden, layerId) > -1) {
        return -1;
      }
      return 0;
    }

    //get the parents of the parent
    var parents = layersList.numberOfParentLayers(layer, layer.layerInfos[layerId].parentLayerId, visible);

    if (visible) {
      //count the visibles only:
      if (dojo.indexOf(layersHidden, layerId) > -1) {
        return parents;
      }
    }

    return 1 + parents;
  }

  /*
   * gets the logical parent of a layer row
   */
  function getParent(element) {
    var level = parseInt(element.attr('data-row-level'));
    var indexOfCurrent = $('#tableFilter').children().index(element);

    for (var i = indexOfCurrent; i >= 0; i--) {
      var prevRow = $($('#tableFilter').children()[i]);
      if (parseInt(prevRow.attr('data-row-level')) === level - 1) {
        return prevRow;
      }
    }
    return null;
  }


  /**
   * Build layers list
   */
  function buildLayerList(layer) {
    if (!layersVisible) {
      layersVisible = [];
      dojo.map(layer.layerInfos, function(info) {
        if (info.defaultVisibility) {
          layersVisible.push(info.id);
        }
      });
    }
    var items = dojo.map(layer.layerInfos, function(info) {
      var layerVisibility = false;

      // Get visibility from config
      if (dojo.indexOf(layersVisible, info.id) > -1 && (info.subLayerIds === null || info.subLayerIds.length <= 0)) {
        mapClient.layers.visible.push(info.id.toString());
        layerVisibility = true;
      }

      //if it should not be shown, then do not show anything for this item
      if (dojo.indexOf(layersHidden, info.id) > -1) {
        return "";
      }

      //otherwise display it:
      var parentsCount = layersList.numberOfParentLayers(layer, info.id, true);
      var indent = parentsCount * layersList.groupPadding;

      return "<div class='layerFilter-row' data-id='" + info.id + "' data-row-level='" + parentsCount + "'>" +
        "<span class='layerFilter-placeholder' style='width:" + indent + "px;'></span>" +
        "<div class='layerFilter-content'>" +
        "<input type='checkbox' class='list_item' style='margin:0px 5px 0px 0px;'" + (layerVisibility ? "checked=checked" : "") + " id='" + info.id + "' onclick='layersList.updateLayerVisibility();' />" +
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
    layer.setVisibleLayers(mapClient.layers.visible);
    Map.map.addLayer(layer);

    //when it is added to the map, subscribe to changes
    layersList.subscribeToEvents();

    events.connect(events.MAP.EXTENT_CHANGE, function() {
      layersList.updateLayerScaleVisibility(layer);
    });
    layersList.updateLayerScaleVisibility(layer);

    events.trigger(events.UI.LAYER_LIST_LOADED);
  }

  /**
   * Shows or hides the icon showing the visibility of the layer given the scale of the map
   * PARAMS:
   *   - layer: ths ArcGISDynamicMapServiceLayer object corresponding to the layer represented in the layer list
   **/
  function updateLayerScaleVisibility(layer) {
    dojo.forEach(layer.layerInfos, function(layerInfo) {
      var mapScale = Map.map.getScale();

      var layerImgItems = dojo.query('.visibleImg[data-id="' + layerInfo.id + '"]');
      var layerNameItems = dojo.query('.layerName[data-id="' + layerInfo.id + '"]');

      if (layerInfo.maxScale === layerInfo.minScale || layerInfo.maxScale < mapScale && layerInfo.minScale > mapScale) {
        //console.info("$$$layerInfo: " + layerInfo.id + " - VISIBLE");
        dojo.forEach(layerImgItems, function(layerImg) {
          dojo.style(layerImg, "display", "none");
        });
        dojo.forEach(layerNameItems, function(layerName) {
          dojo.style(layerName, "color", "inherit");
        });
      } else {
        // console.info("$$$layerInfo: " + layerInfo.id + " - NOT VISIBLE");
        dojo.forEach(layerImgItems, function(layerImg) {
          dojo.style(layerImg, "display", "inherit");
        });
        dojo.forEach(layerNameItems, function(layerName) {
          dojo.style(layerName, "color", "#999999");
        });
      }
    });
  }

  /**
   * Update layers visibility
   */
  function updateLayerVisibility(useTimeout, useRefresh) {
    if (useTimeout === undefined || useTimeout === null) {
      useTimeout = true;
    }

    if (useRefresh === undefined || useRefresh === null) {
      useRefresh = true;
    }

    if (useTimeout) {
      clearTimeout(layersList.timeoutUpdateLayerVisibility);

      layersList.timeoutUpdateLayerVisibility = setTimeout(function() {
          layersList.doUpdateLayerVisibility(useRefresh);
        },
        config.LAYERS.LAYERS_REFRESH_DELAY
      );
    } else {
      layersList.doUpdateLayerVisibility(useRefresh);
    }
  }

  function doUpdateLayerVisibility(useRefresh) {
    var inputs = dojo.query(".list_item");

    mapClient.layers.visible = [];

    dojo.forEach(inputs, function(input) {
      if (input.checked && !isNaN(parseInt(input.id))) {
        mapClient.layers.visible.push(input.id);
      }
    });

    // No visible layers
    if (mapClient.layers.visible.length === 0) {
      mapClient.layers.visible.push(-1);
    }
    // Set visible layers
    //second parameter says if the dynamic layer should be automatically refereshed or not. (If not, then the query is not sent to the server.
    //It is good if there will be other filters in the same batch query
    mapClient.layers.dynamicLayer.setVisibleLayers(mapClient.layers.visible, !useRefresh);

    mapClient.map.legend.refresh();
  }

  /*
   * performs the selection change on radio or checkbox items (everything that is below in the hierarchy should be changed as well)
   */
  function handleChangeOnLayer(element, othersAsWell) {
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
    if ($element.attr('type') === 'radio') {
      if (othersAsWell) {

        //name of the group
        var name = $element.attr('name');

        //trigger event for other radio buttons in the same group, but do not cause infinite loo
        $('#tableFilter div.layerFilter-content > input[name="' + name + '"]')
          .not($element)
          .each(function() {
            layersList.handleChangeOnLayer(this, false);
          });
      }
    }

    //go upwards as well for unchecked elements.
    //if something gets unchecked, its groups should be unchecked as well.
    if (!element.checked) {
      var parent = layersList.getParent($element.closest('div.layerFilter-row'));
      while (parent !== null) {
        parent.find('div.layerFilter-content > input[type="checkbox"], div.layerFilter-content > input[type="radio"]').prop('checked', false);
        parent = layersList.getParent(parent);
      }
    }
  }

  /*
   * handle changes in the selection. (By default the elements are checkboxes but it can be changed to radio buttons as well
   */
  function subscribeToEvents() {
    //use 'on' change. Maybe later we will dinamically add content as well
    $('#tableFilter')
      .on('change', 'div.layerFilter-content > input[type="checkbox"], div.layerFilter-content > input[type="radio"]', function() {
        layersList.handleChangeOnLayer(this, true);
      });
  }

})(window.mapClient, window.mapClient.config, window.mapClient.events);
