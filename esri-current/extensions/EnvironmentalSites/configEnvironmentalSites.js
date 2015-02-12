// ==========================================================================================
//==============                     Specific configuration                  ==============//
// ==========================================================================================
var WATERSHED_GP_URL = "http://arcgis.novel-t.ch/arcgis/rest/services/EnvironmentalSites/Watershed_Delineation/GPServer/WatershedDelineation";

// ==========================================================================================
//==============                 Override core configuration                  ==============//
// ==========================================================================================
APP_TITLE = "Environmental Sites Map";
IDENTIFY_TOLERANCE = 5;

/** Identify on Map click **/
IDENTIFY_QUERYABLE_LAYERS = [0,1];

//Specify infowindowContent
IDENTIFY_INFOTEMPLATES[0] = {
    content: "Cumulated population : <strong>${CumulPop}</strong>",
    title: "Junction point"
};

IDENTIFY_INFOTEMPLATES[1] = {
    content: "Cumulated population : <strong>${CumulPop}</strong>",
    title: "Drainage point"
};

//LAYERS_NOT_SHOWN_IN_LAYERS_LIST = [0];

//----------------------------------------------------------------------------------
//------------------   MODULES CONFIGURATION  --------------------------------------
//----------------------------------------------------------------------------------

WATERSHED_MODULE = true;
GOTO_MODULE = false;
HIGHLIGHTSELECTION_MODULE = false;
