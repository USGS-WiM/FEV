var stnServicesURL = "https://stn.wim.usgs.gov/STNServices";
// var stnServicesURL = 'https://stntest.wim.usgs.gov/stnservices'; //test URL

// public info PROD urls
var sensorPageURLRoot =
  "https://stn.wim.usgs.gov/STNPublicInfo/#/SensorPage?Site=";
var hwmPageURLRoot = "https://stn.wim.usgs.gov/STNPublicInfo/#/HWMPage?Site=";

// public info TEST urls
/* var sensorPageURLRoot = "https://test.wim.usgs.gov/publicInfoTest/#/SensorPage?Site=";
var hwmPageURLRoot = "https://test.wim.usgs.gov/publicInfoTest/#/HWMPage?Site="; */

var searchResults;

var fev = fev || {
  data: {
    events: [],
    eventTypes: [],
    states: [],
    counties: [],
    sensorTypes: [],
    sensorStatusTypes: [],
    collectionConditions: [],
    deploymentTypes: [],
    hwmTypes: [],
    hwmQualities: [],
    horizontalDatums: [],
    horizontalCollectionMethods: [],
    verticalDatums: [],
    verticalCollectionMethods: [],
    housingTypes: [],
    deploymentTypes: [],
    markerTypes: [],
    currentSelection: {
      site: {},
      instrument: {},
      hwm: {},
    },
  },
  urls: {
    jsonSensorsURLRoot:
      stnServicesURL + "/Instruments/FilteredInstruments.json",
    xmlSensorsURLRoot: stnServicesURL + "/Instruments/FilteredInstruments.xml",
    csvSensorsURLRoot: stnServicesURL + "/Instruments/FilteredInstruments.csv",

    jsonHWMsURLRoot: stnServicesURL + "/HWMs/FilteredHWMs.json",
    xmlHWMsURLRoot: stnServicesURL + "/HWMs/FilteredHWMs.xml",
    csvHWMsURLRoot: stnServicesURL + "/HWMs/FilteredHWMs.csv",
    hwmFilteredGeoJSONViewURL: stnServicesURL + "/HWMs/FilteredHWMs.geojson",
    hwmGeoJSONViewURL: stnServicesURL + "/hwms.geojson",

    xmlPeaksURLRoot: stnServicesURL + "/PeakSummaries/FilteredPeaks.xml",
    jsonPeaksURLRoot: stnServicesURL + "/PeakSummaries/FilteredPeaks.json",
    csvPeaksURLRoot: stnServicesURL + "/PeakSummaries/FilteredPeaks.csv",
    peaksFilteredGeoJSONViewURL:
      stnServicesURL + "/PeakSummaries/FilteredPeaks.geojson",

    baroGeoJSONViewURL:
      stnServicesURL + "/SensorViews.geojson?ViewType=baro_view&",
    metGeoJSONViewURL:
      stnServicesURL + "/SensorViews.geojson?ViewType=met_view&",
    rdgGeoJSONViewURL:
      stnServicesURL + "/SensorViews.geojson?ViewType=rdg_view&",
    stormtideGeoJSONViewURL:
      stnServicesURL + "/SensorViews.geojson?ViewType=stormtide_view&",
    waveheightGeoJSONViewURL:
      stnServicesURL + "/SensorViews.geojson?ViewType=waveheight_view&",
  },
  queryStrings: {},
  vars: {
    currentEventName: "",
    currentEventID_str: "",
    currentEventStartDate_str: "",
    currentEventEndDate_str: "",
    currentEventActive: false,
    extentNorth: 71.3888898, // north lat: Point Barrow Alaska
    extentWest: -179.148611, //west long: Amatignak Island, Alaska
    extentEast: -66.947028, //east long: Sail Rock, Maine
    extentSouth: 18.910833, //south lat: Ka Lae. Hawaii
  },
  layerList: [
    {
      ID: "baro",
      Name: "Barometric Pressure Sensor",
      Type: "sensor",
      Category: "observed",
    },
    {
      ID: "stormtide",
      Name: "Water Level Sensor",
      Type: "sensor",
      Category: "observed",
    },
    {
      ID: "met",
      Name: "Meteorological Sensor",
      Type: "sensor",
      Category: "observed",
    },
    {
      ID: "waveheight",
      Name: "Wave Height Sensor",
      Type: "sensor",
      Category: "observed",
    },
    {
      ID: "rdg",
      Name: "Rapid Deployment Gage",
      Type: "sensor",
      Category: "real-time",
    },
    {
      ID: "hwm",
      Name: "High Water Mark",
      Type: "observed",
      Category: "observed",
    },
    {
      ID: "peak",
      Name: "Peak Summary",
      Type: "interpreted",
      Category: "interpreted",
    },
    {
      ID: "cameras",
      Name: "USGS Coastal Imagery",
      Type: "supporting",
      Category: "supporting",
    },
    {
      ID: "tides",
      Name: "NOAA Tides and Currents Stations",
      Type: "real-time",
      Category: "real-time",
    },
    // {
    // 	"ID": "nwisrain",
    // 	"Name": "Real-time Ran Gage",
    // 	"Type": "nwis",
    // 	"Category": "real-time"
    // },
    // {
    // 	"ID": "nwisstreamgage",
    // 	"Name": "Real-time Stream Gage",
    // 	"Type": "nwis",
    // 	"Category": "real-time"
    // },
    // {
    // 	"ID": "nwistides",
    // 	"Name": "Tidal Gage",
    // 	"Type": "nwis",
    // 	"Category": "real-time"
    // },
  ],
  markerClasses: {
    baro: "wmm-diamond wmm-yellow wmm-icon-diamond wmm-icon-black wmm-size-20",
    baro_legend:
      "wmm-diamond wmm-yellow wmm-icon-diamond wmm-icon-black wmm-size-15",
    met: "wmm-square wmm-33a02c wmm-icon-diamond wmm-icon-black wmm-size-20",
    rdg: "wmm-circle wmm-blue wmm-icon-triangle wmm-icon-black wmm-size-20",
    stormtide: "wmm-pin wmm-red wmm-icon-diamond wmm-icon-black wmm-size-20",
    stormtide_legend:
      "wmm-pin wmm-red wmm-icon-diamond wmm-icon-black wmm-size-25",
    waveheight:
      "wmm-circle wmm-purple wmm-icon-diamond wmm-icon-black wmm-size-20 wmm-borderless",
    hwm: "wmm-diamond wmm-A0522D wmm-icon-circle wmm-icon-A0522D wmm-size-20",
    hwm_legend:
      "wmm-diamond wmm-A0522D wmm-icon-circle wmm-icon-A0522D wmm-size-15",
    peak:
      "wmm-diamond wmm-blue wmm-icon-noicon wmm-icon-green wmm-size-15 wmm-borderless",
    nwis:
      "wmm-circle wmm-mutedblue wmm-icon-triangle wmm-icon-black wmm-size-20 wmm-borderless",
    nwisTidal:
      "wmm-square wmm-altorange wmm-icon-triangle wmm-icon-black wmm-size-15 wmm-borderless",
    noaaTides:
      "wmm-diamond wmm-lime wmm-icon-triangle wmm-icon-black wmm-size-15 wmm-borderless",
  },
};

//L.esri.Support.cors = false;

var map;
var markerCoords = [];
var oms;

// divIcons using WIM marker maker
var baroMarkerIcon = L.divIcon({
  name: "Barometric Pressure Sensor",
  className: fev.markerClasses.baro,
  iconAnchor: [7, 10],
  popupAnchor: [0, 2],
});
var metMarkerIcon = L.divIcon({
  name: "Meteorological Sensor",
  className: fev.markerClasses.met,
  iconAnchor: [7, 10],
  popupAnchor: [0, 2],
});
var rdgMarkerIcon = L.divIcon({
  name: "Rapid Deployment Gage",
  className: fev.markerClasses.rdg,
  iconAnchor: [7, 10],
  popupAnchor: [0, 2],
});
var stormtideMarkerIcon = L.divIcon({
  name: "Storm Tide Sensor",
  className: fev.markerClasses.stormtide,
  iconAnchor: [7, 10],
  popupAnchor: [0, 2],
});
var waveheightMarkerIcon = L.divIcon({
  name: "Wave Height Sensor",
  className: fev.markerClasses.waveheight,
  iconAnchor: [7, 10],
  popupAnchor: [0, 2],
});
var hwmMarkerIcon = L.divIcon({
  name: "Hight Water Mark",
  className: fev.markerClasses.hwm,
  iconAnchor: [7, 10],
  popupAnchor: [0, 2],
});
var peakMarkerIcon = L.divIcon({
  name: "Peak Summary",
  className: fev.markerClasses.peak,
  iconAnchor: [7, 10],
  popupAnchor: [0, 2],
});
var nwisMarkerIcon = L.divIcon({
  name: "NWIS",
  className: fev.markerClasses.nwis,
  iconAnchor: [7, 10],
  popupAnchor: [0, 2],
});
var nwisTidalMarkerIcon = L.divIcon({
  name: "NWIS Tidal",
  className: fev.markerClasses.nwisTidal,
  iconAnchor: [7, 10],
  popupAnchor: [0, 2],
});
var tidesMarkerIcon = L.divIcon({
  name: "NOAA Tides and Current Stations",
  className: fev.markerClasses.noaaTides,
  iconAnchor: [7, 10],
  popupAnchor: [0, 2],
});

// rain layer uses an icon
var nwisRainMarkerIcon = L.icon({
  name: "Real-time Rain Gage",
  className: "nwisMarker",
  iconUrl: "images/nwis_rain.png",
  iconAnchor: [7, 10],
  popupAnchor: [0, 2],
  iconSize: [25, 25],
});

//  sensor subgroup layerGroups for sensor marker cluster group (layerGroup has no support for mouse event listeners)
var baro = L.layerGroup();
var met = L.layerGroup();
var stormtide = L.layerGroup();
var waveheight = L.layerGroup();
var hwm = L.layerGroup();
var peak = L.layerGroup();
var cameras = L.layerGroup();
var tides = L.layerGroup();

// var editableLayers = new L.FeatureGroup();
// var drawnItems = new L.FeatureGroup();
// var drawLayer = new L.FeatureGroup();

var peakLabels = false;

var watershedStyle = {
  color: "gray",
  fillOpacity: 0,
  opacity: 0.65,
  weight: 4,
};

var allWatersheds = L.esri.dynamicMapLayer({
  url:
    "https://gis.streamstats.usgs.gov/arcgis/rest/services/StreamStats/nationalLayer/MapServer",
  layers: [2, 3, 4, 5, 6, 7],
  maxZoom: 14,
  minZoom: 4,
  useCors: false,
});

//rdg and USGSrtGages layers must be featureGroup type to support mouse event listeners
var rdg = L.featureGroup();
var USGSRainGages = L.featureGroup();
var USGSTideGages = L.featureGroup();
var USGSrtGages = L.featureGroup();
var noaaService = L.esri.dynamicMapLayer({
  url:
    "https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer",
  opacity: 0.5,
  f: "image",
});

var noAdvisories = false;
var test;

var noaaLegend = $.ajax({
  url:
    "https://nowcoast.noaa.gov/layerinfo?request=legend&format=json&service=wwa_meteocean_tropicalcyclones_trackintensityfcsts_time",
  dataType: "json",
  timeout: 10000,
  success: function (data) {
    if (data[0].label == "No active advisories at this time") {
      noAdvisories = true;
      test = data;
      console.log(noAdvisories);
    }
  },
  error: function (error) {
    console.log("Error processing the JSON. The error is:" + error);
  },
});

/* $.getJSON('https://nowcoast.noaa.gov/layerinfo?request=legend&format=json&service=wwa_meteocean_tropicalcyclones_trackintensityfcsts_time', {
	async: false,
})
	.done(function (data) {
		//if any results (features in the bounding box), then add forecast track layer to map, add toggle to interpreted data category.

			if (data[0].label == "No active advisories at this time") {
				noAdvisories = true;
				console.log(noAdvisories);
			} else {
				//interpretedOverlays["NOAA Tropical Cyclone Forecast Track"] = "noaaService";
				//noaaService = noaaTrack;
				console.log("noaa layer added");
			}
	})
	.fail(function () {
		console.log("NOAA Tropical Cyclone legend retrieve failed.");
	}); */

/* function callbackFuncWithData(data)
	{
		if (data[0].label == "No active advisories at this time") {
			noAdvisories = true;
			console.log(test);
		} else {
			//interpretedOverlays["NOAA Tropical Cyclone Forecast Track"] = "noaaService";
			//noaaService = noaaTrack;
			console.log("noaa layer added");
		}
	} */

var zoomMargin;
///end markercluster code//////////////////////////////////////////////////////////////
//main document ready function
$(document).on("ready", function () {
  //for jshint
  "use strict";

  //Start with the rain and stream gage checkboxes disabled
  var streamgageCheckBox = document.getElementById("streamGageToggle");
  streamgageCheckBox.disabled = true;
  var raingageCheckBox = document.getElementById("rainGageToggle");
  raingageCheckBox.disabled = true;
  var nwisTidalCheckBox = document.getElementById("nwisTidalGageToggle");
  nwisTidalCheckBox.disabled = true;

  $("#peakDatePicker .input-daterange").datepicker({
    format: "yyyy-mm-dd",
    endDate: "today",
    startView: 2,
    maxViewMode: 3,
    todayBtn: true,
    clearBtn: true,
    multidate: false,
    autoclose: true,
    todayHighlight: true,
  });

  //listener for submit event button on welcome modal - sets event vars and passes event id to filterMapData function
  $("#btnSubmitEvent").on("click", function () {
    //check if an event has been selected
    if ($("#evtSelect_welcomeModal").val() !== null) {
      //if event selected, hide welcome modal and begin filter process
      $("#welcomeModal").modal("hide");
      var eventID = $("#evtSelect_welcomeModal").val()[0];
      $("#evtSelect_filterModal").val([eventID]).trigger("change");
      //retrieve event details
      $.getJSON(
        "https://stn.wim.usgs.gov/STNServices/events/" + eventID + ".json",
        {}
      )
        .done(function (data) {
          setEventVars(
            data.event_name,
            data.event_id,
            data.event_status_id,
            data.event_start_date,
            data.event_end_date
          );
        })
        .fail(function () {
          console.log("Request Failed. Most likely invalid event name.");
        });
      //populateEventDates(eventID);
      filterMapData(eventID, false);
    } else {
      //if no event selected, warn user with alert
      //alert("Please choose an event to proceed.")
      $(".eventSelectAlert").show();
    }
  });

  //listener for submit filters button on filters modal - sets event vars and passes event id to filterMapData function
  $("#btnSubmitFilters").on("click", function () {
    if ($("#evtSelect_filterModal").val() !== null) {
      //if event selected, hide welcome modal and begin filter process
      $("#welcomeModal").modal("hide");
      var eventFormValue = $("#evtSelect_filterModal").val();
      var numEvents = eventFormValue.length;
      if (numEvents == 1) {
        var eventID = eventFormValue[0];
        //retrieve event details
        for (var i = 0; i < fev.data.events.length; i++) {
          if (fev.data.events[i].event_id == eventID) {
            //set currentEventActive boolean var based on event_status_id value
            setEventVars(
              fev.data.events[i].event_name,
              fev.data.events[i].event_id,
              fev.data.events[i].event_status_id,
              fev.data.events[i].event_start_date,
              fev.data.events[i].event_end_date
            );
          }
        }
        filterMapData(eventID, false);
        $(".eventSelectAlert").hide();
        $("#filtersModal").modal("hide");
      } else {
        setMultiEventVars(eventFormValue, numEvents);
      }
    } else {
      //if no event selected, warn user with alert
      $(".eventSelectAlert").show();
    }
  });

  //'listener' for URL event params - sets event vars and passes event id to filterMapData function
  if (window.location.hash) {
    //user has arrived with an event name after the hash on the URL
    //grab the hash value, remove the '#', leaving the event name parameter
    var eventParam = window.location.hash.substring(1);
    //retrieve event details
    $.getJSON(
      "https://stn.wim.usgs.gov/STNServices/events/" + eventParam + ".json",
      {}
    )
      .done(function (data) {
        var eventID = data.event_id.toString();
        setEventVars(
          data.event_name,
          data.event_id,
          data.event_status_id,
          data.event_start_date,
          data.event_end_date
        );
        //call filter function, passing the eventid parameter string and 'true' for the 'isUrlParam' boolean argument
        filterMapData(eventID, true);
      })
      .fail(function () {
        console.log("Request Failed. Most likely invalid event name.");
      });
  } else {
    //show modal and set options - disallow user from bypassing
    $("#welcomeModal").modal({ backdrop: "static", keyboard: false });
  }

  function setMultiEventVars(eventIDs, numEvents) {
    var eventNames = [];
    var eventsIDs;
    var eventStatusActive = [];
    var eventStatusInactive = [];
    var eventStartDates;
    var eventEndDates;
    var eventNameString = "";
    for (var eventCount = 0; eventCount < numEvents; eventCount++) {
      for (var i = 0; i < fev.data.events.length; i++) {
        if (fev.data.events[i].event_id == eventIDs[eventCount]) {
          eventNames.push(fev.data.events[i].event_name);
          if (eventCount !== numEvents - 1) {
            eventNameString =
              eventNameString + String(fev.data.events[i].event_name) + ", ";
          }
          if (eventCount == numEvents - 1) {
            eventNameString =
              eventNameString + String(fev.data.events[i].event_name);
          }
          if (fev.data.events[i].event_status_id == 1) {
            eventStatusActive.push(fev.data.events[i].event_name);
          }
          if (fev.data.events[i].event_status_id !== 1) {
            eventStatusInactive.push(fev.data.events[i].event_name);
          }
        }
      }
    }
    //could put in eventNameString instead of 'multiple_events', it just might be a bit long
    history.pushState(null, null, "#" + "multiple_events".replace(/\s+/g, ""));
    fev.vars.currentEventName = eventNameString;
    //might need to set fev.vars.currentEventID_str at some point, maybe only if we include multiselect in welcome modal
    //might also need to set fev.vars.currentEventActive (boolean) sometime, right now using vars eventStatusActive & eventStatusInactive instead
    //ignoring start and end dates for now. Could list all ranges, or set it to earliest start date and latest end date
    console.log("Selected events are ", eventNameString);
    console.log("Active events: ", eventStatusActive);
    console.log("Inactive events: ", eventStatusInactive);
  }

  function setEventVars(
    event_name,
    event_id,
    event_status_id,
    event_start_date,
    event_end_date
  ) {
    //set event name in URL, using regex to remove spaces
    history.pushState(null, null, "#" + event_name.replace(/\s+/g, ""));
    //set current event name
    fev.vars.currentEventName = event_name;
    //set current event id string
    fev.vars.currentEventID_str = event_id.toString();
    //set currentEventActive boolean var based on event_status_id value
    event_status_id == 1
      ? (fev.vars.currentEventActive = true)
      : (fev.vars.currentEventActive = false);
    //set event date string vars, cutting off time portion and storing date only; check for undefined because services do not return the property if it has no value
    fev.vars.currentEventStartDate_str =
      event_start_date == undefined ? "" : event_start_date.substr(0, 10);
    fev.vars.currentEventEndDate_str =
      event_end_date == undefined ? "" : event_end_date.substr(0, 10);
    console.log(
      "Selected event is " +
        event_name +
        ". START date is " +
        fev.vars.currentEventStartDate_str +
        " and END date is " +
        fev.vars.currentEventEndDate_str +
        ". Event is active = " +
        fev.vars.currentEventActive
    );
    setEventIndicators(
      event_name,
      event_id,
      fev.vars.currentEventStartDate_str,
      fev.vars.currentEventEndDate_str
    );
  }

  function setEventIndicators(
    eventName,
    eventID,
    eventStartDateStr,
    eventEndDateStr
  ) {
    $("#eventNameDisplay").html(eventName);
    $("#largeEventNameDisplay").html(eventName);
    //TODO: determine why this is not working, though its same code and input as in the btnSubmitEvent function above
    var eventValue = [eventID.toString()];
    $("#evtSelect_filterModal").val([eventValue]).trigger("change");

    //set the event display, only if both date strings are not empty
    if (eventStartDateStr == "" && eventEndDateStr == "") {
      return;
    } else if (eventEndDateStr == "") {
      //if no end date, only show begin date
      $("#largeEventDateRangeDisplay").html(
        moment(eventStartDateStr).format("D MMM YYYY")
      );
    } else {
      //if both start and end date, show beginDate thru endDate
      $("#largeEventDateRangeDisplay").html(
        moment(eventStartDateStr).format("D MMM YYYY") +
          " thru " +
          moment(eventEndDateStr).format("D MMM YYYY")
      );
    }
  }

  /* create map */
  map = L.map("mapDiv").setView([39.833333, -98.583333], 4);
  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  var drawControl = new L.Control.Draw({
    draw: {
      polygon: false,
      marker: true,
      circlemarker: false,
      rectangle: false,
      circle: false,
    },
    edit: {
      featureGroup: drawnItems,
    },
  });
  map.addControl(drawControl);

  // Truncate value based on number of decimals
  function _round(num, len) {
    return Math.round(num * Math.pow(10, len)) / Math.pow(10, len);
  }
  // Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
  function strLatLng(latlng) {
    return "(" + _round(latlng.lat, 6) + ", " + _round(latlng.lng, 6) + ")";
  }

  // Generate popup content based on layer type
  // - Returns HTML string, or null if unknown object
  function getPopupContent(layer) {
    // Marker - add lat/long
    if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
      return strLatLng(layer.getLatLng());
      // Circle - lat/long, radius
    } else if (layer instanceof L.Circle) {
      const center = layer.getLatLng(),
        radius = layer.getRadius();
      return (
        "Center: " +
        strLatLng(center) +
        "<br />" +
        "Radius: " +
        _round(radius, 2) +
        " m"
      );
      // Rectangle/Polygon - area
    } else if (layer instanceof L.Polygon) {
      const latlngs = layer._defaultShape
          ? layer._defaultShape()
          : layer.getLatLngs(),
        area = L.GeometryUtil.geodesicArea(latlngs);
      return "Area: " + L.GeometryUtil.readableArea(area, true);
      // Polyline - distance
    } else if (layer instanceof L.Polyline) {
      const latlngs = layer._defaultShape
        ? layer._defaultShape()
        : layer.getLatLngs();
      let distance = 0;
      if (latlngs.length < 2) {
        return "Distance: N/A";
      } else {
        for (let i = 0; i < latlngs.length - 1; i++) {
          distance += latlngs[i].distanceTo(latlngs[i + 1]);
        }
        return "Distance: " + _round(distance, 2) + " m";
      }
    }
    return null;
  }
  // Object created - bind popup to layer, add to feature group
  map.on(L.Draw.Event.CREATED, function (event) {
    const layer = event.layer;
    const content = getPopupContent(layer);
    if (content !== null) {
      layer.bindPopup(content);
    }
    drawnItems.addLayer(layer);
  });
  // Object(s) edited - update popups
  map.on(L.Draw.Event.EDITED, function (event) {
    const layers = event.layers;
    // const content = null;
    layers.eachLayer(function (layer) {
      const content = getPopupContent(layer);
      if (content !== null) {
        layer.setPopupContent(content);
      }
    });
  });

  var layer = L.esri.basemapLayer("Topographic").addTo(map);
  var layerLabels;
  L.Icon.Default.imagePath = "./images";

  //display USGS rt gages by default on map load
  //USGSrtGages.addTo(map);

  // checking to see if service is live
  noaaService.metadata(function (err, response) {
    if (response) {
      noaaService.addTo(map);
    }
  });

  //define layer 'overlays' (overlay is a leaflet term)
  //define the real-time overlay and manually add the NWIS RT gages to it
  var realTimeOverlays = {
    // "<img class='legendSwatch' src='images/nwis.png'>&nbsp;Tidal Gage": USGSTideGages
  };

  //define observed overlay and interpreted overlay, leave blank at first
  var observedOverlays = {};
  var interpretedOverlays = {};
  var supportingLayers = {};
  populateCameraLayer();
  if (noAdvisories) {
    var div = document.getElementById("noTrackAdvisory");
    div.innerHTML += "No Active Advisories";
  } else {
    supportingLayers = {
      "<img class='legendSwatch' src='images/noaa.png'>&nbsp;NOAA Tropical Cyclone Forecast Track": noaaService,
    };
  }

  //loop thru layer list and add the legend item to the appropriate heading
  $.each(fev.layerList, function (index, layer) {
    if (layer.Category == "real-time") {
      if (layer.ID == "rdg") {
        realTimeOverlays[
          "<div class='legend-icon'><div class='" +
            fev.markerClasses.rdg +
            "'></div><label>" +
            layer.Name +
            "</label></div>"
        ] = window[layer.ID];
      } else if (layer.ID == "tides") {
        realTimeOverlays[
          "<div class='legend-icon'><div class='" +
            fev.markerClasses.noaaTides +
            "'></div><label>" +
            layer.Name +
            "</label></div>"
        ] = window[layer.ID];
      } else {
        realTimeOverlays[
          "<img class='legendSwatch' src='images/" +
            layer.ID +
            ".png'>&nbsp;" +
            layer.Name
        ] = window[layer.ID];
      }
    }

    if (layer.Category == "observed") {
      if (layer.ID == "baro") {
        observedOverlays[
          "<div class='legend-icon'><div class='" +
            fev.markerClasses.baro_legend +
            "'></div><label>" +
            layer.Name +
            "</label></div>"
        ] = window[layer.ID];
      } else if (layer.ID == "stormtide") {
        observedOverlays[
          "<div class='legend-icon'><div class='" +
            fev.markerClasses.stormtide_legend +
            "'></div><label>" +
            layer.Name +
            "</label></div>"
        ] = window[layer.ID];
      } else if (layer.ID == "met") {
        observedOverlays[
          "<div class='legend-icon'><div class='" +
            fev.markerClasses.met +
            "'></div><label>" +
            layer.Name +
            "</label></div>"
        ] = window[layer.ID];
      } else if (layer.ID == "waveheight") {
        observedOverlays[
          "<div class='legend-icon'><div class='" +
            fev.markerClasses.waveheight +
            "'></div><label>" +
            layer.Name +
            "</label></div>"
        ] = window[layer.ID];
      } else if (layer.ID == "hwm") {
        observedOverlays[
          "<div class='legend-icon'><div class='" +
            fev.markerClasses.hwm_legend +
            "'></div><label>" +
            layer.Name +
            "</label></div>"
        ] = window[layer.ID];
      } else {
        observedOverlays[
          "<img class='legendSwatch' src='images/" +
            layer.ID +
            ".png'>&nbsp;" +
            layer.Name
        ] = window[layer.ID];
      }
    }

    if (layer.Category == "supporting")
      supportingLayers[
        "<img class='legendSwatch' src='images/camera-solid.png'></img>&nbsp;" +
          layer.Name
      ] = window[layer.ID];
  });

  //attach the listener for data disclaimer button after the popup is opened - needed b/c popup content not in DOM right away
  map.on("popupopen", function () {
    $(".data-disclaim").on("click", function (e) {
      $("#aboutModal").modal("show");
      $('.nav-tabs a[href="#disclaimerTabPane"]').tab("show");
      $('.nav-tabs a[href="#faqTabPane"]').tab("show");
    });

    $(".sensor-data-btn").on("click", function (e) {
      var siteInstrumentArray = e.target.value.split(",");
      var siteID = siteInstrumentArray[0];
      var instrumentID = siteInstrumentArray[1];
      populateCurrentSelectionData("sensor", siteID, instrumentID);
    });

    $(".hwm-data-btn").on("click", function (e) {
      var siteHWMArray = e.target.value.split(",");
      var siteID = siteHWMArray[0];
      var hwmID = siteHWMArray[1];
      // TODO: adapt for HWM
      populateCurrentSelectionData("hwm", siteID, hwmID);
    });

    function populateCurrentSelectionData(type, siteID, objectID) {
      var siteUrl =
        "https://stn.wim.usgs.gov/STNServices/Sites/" + siteID + ".json";

      if (type == "sensor") {
        var instrumentUrl =
          "https://stn.wim.usgs.gov/STNServices/Instruments/" +
          objectID +
          "/FullInstrument.json";

        $.ajax({
          url: siteUrl,
          dataType: "json",
          headers: { Accept: "*/*" },
          success: function (siteData) {
            // return data;
            fev.data.currentSelection.site = siteData;

            $("#site_no").html(fev.data.currentSelection.site.site_no);
            $("#site_description").html(
              fev.data.currentSelection.site.site_description
            );
            $("#latitude").html(fev.data.currentSelection.site.latitude);
            $("#longitude").html(fev.data.currentSelection.site.longitude);
            $("#hdatum").html(
              translateToDisplayValue(
                fev.data.currentSelection.site.hdatum_id,
                "datum_id",
                "datum_name",
                fev.data.horizontalDatums
              )
            );
            $("#hcollect_method").html(
              translateToDisplayValue(
                fev.data.currentSelection.site.hcollect_method_id,
                "hcollect_method_id",
                "hcollect_method",
                fev.data.horizontalCollectionMethods
              )
            );
            $("#address").html(fev.data.currentSelection.site.address);
            $("#city").html(fev.data.currentSelection.site.city);
            $("#state").html(fev.data.currentSelection.site.state);
            $("#zip").html(fev.data.currentSelection.site.zip);
            $("#county").html(fev.data.currentSelection.site.county);
            $("#waterbody").html(fev.data.currentSelection.site.waterbody);
            $("#drainage_area").html(
              fev.data.currentSelection.site.drainage_area
                ? fev.data.currentSelection.site.drainage_area
                : "---"
            );
            $("#usgs_sid").html(fev.data.currentSelection.site.usgs_sid);
            $("#noaa_sid").html(fev.data.currentSelection.site.noaa_sid);
            $("#other_sid").html(fev.data.currentSelection.site.other_sid);

            // get site objective points
            // out of use for now (Sept 2020)
            // $.ajax({
            // 	url: 'https://stn.wim.usgs.gov/STNServices/Sites/' + siteID + '/ObjectivePoints.json',
            // 	dataType: 'json',
            // 	async: false,
            // 	headers: { 'Accept': '*/*' },
            // 	success: function (response) {
            // 		fev.data.currentSelection.site.objective_points = response;
            // 	},
            // 	error: function (error) {
            // 		console.log('Error processing the JSON. The error is:' + error);
            // 		//return error;
            // 	}
            // });

            $.ajax({
              url: instrumentUrl,
              dataType: "json",
              headers: { Accept: "*/*" },
              success: function (instrumentData) {
                fev.data.currentSelection.instrument = instrumentData;

                $("#event").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.instrument.event_id,
                    "event_id",
                    "event_name",
                    fev.data.events
                  )
                );
                // Deployed sensor section
                $("#sensor_type").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.instrument.sensor_type_id,
                    "sensor_type_id",
                    "sensor",
                    fev.data.sensorTypes
                  )
                );
                $("#sensorBrand").html(
                  fev.data.currentSelection.instrument.sensorBrand
                );
                $("#serial_number").html(
                  fev.data.currentSelection.instrument.serial_number
                );
                $("#housing_serial_number").html(
                  fev.data.currentSelection.instrument_housing_serial_number
                    ? fev.data.currentSelection.instrument_housing_serial_number
                    : "---"
                );
                $("#housing_type").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.instrument.housing_type_id,
                    "housing_type_id",
                    "type_name",
                    fev.data.housingTypes
                  )
                );
                $("#deployment_type").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.instrument.deployment_type_id,
                    "deployment_type_id",
                    "method",
                    fev.data.deploymentTypes
                  )
                );
                $("#location_description").html(
                  fev.data.currentSelection.instrument.location_description
                );
                $("#interval").html(
                  fev.data.currentSelection.instrument.interval + " seconds"
                );
                $("#vented").html(fev.data.currentSelection.instrument.vented);

                var deployedInstrumentStatusID;
                var retrievedInstrumentStatusID;

                // parse out deployed and retrieved instruments
                for (
                  var i = 0;
                  i <
                  fev.data.currentSelection.instrument.instrument_status.length;
                  i++
                ) {
                  if (
                    fev.data.currentSelection.instrument.instrument_status[i]
                      .status == "Deployed"
                  ) {
                    // creates a named field (with object value) for the deployed instrument status
                    fev.data.currentSelection.instrument.deployed =
                      fev.data.currentSelection.instrument.instrument_status[i];
                    deployedInstrumentStatusID =
                      fev.data.currentSelection.instrument.deployed
                        .instrument_status_id;
                    $("#deploy_date").html(
                      moment(
                        fev.data.currentSelection.instrument.deployed
                          .time_stamp,
                        "YYYY-MM-DDTHH:mm:ss"
                      ).format("l LT")
                    );
                    $("#deployed_note").html(
                      fev.data.currentSelection.instrument.deployed.notes
                    );
                  }
                  if (
                    fev.data.currentSelection.instrument.instrument_status[i]
                      .status == "Retrieved"
                  ) {
                    // creates a named field (with object value) for the deployed instrument status
                    fev.data.currentSelection.instrument.retrieved =
                      fev.data.currentSelection.instrument.instrument_status[i];
                    retrievedInstrumentStatusID =
                      fev.data.currentSelection.instrument.retrieved
                        .instrument_status_id;
                    $("#ret_sensor_status").html(
                      fev.data.currentSelection.instrument.retrieved.status
                    );
                    $("#retrieved_note").html(
                      fev.data.currentSelection.instrument.retrieved.notes
                    );
                    $("#retrieved_date").html(
                      moment(
                        fev.data.currentSelection.instrument.retrieved
                          .time_stamp,
                        "YYYY-MM-DDTHH:mm:ss"
                      ).format("l LT")
                    );
                  }
                }

                $("#instCollection").html(
                  fev.data.currentSelection.instrument.instCollection
                );

                // empty the data files and photo files lists of existing elements
                $("#dataFilesList").empty();
                $("#photoFilesList").empty();
                // retrieve files data
                $.ajax({
                  url:
                    "https://stn.wim.usgs.gov/STNServices/Instruments/" +
                    objectID +
                    "/Files.json",
                  dataType: "json",
                  async: false,
                  headers: { Accept: "*/*" },
                  success: function (response) {
                    fev.data.currentSelection.instrument.files = response;
                    if (fev.data.currentSelection.instrument.files.length > 0) {
                      $("#dataFilesList").append(
                        '<ul id="dataFile_ul" style="padding:0"></ul>'
                      );
                      $("#photoFilesList").append(
                        '<ul id="photoFile_ul" style="padding: 0;margin-top:15px;"></ul>'
                      );
                      // loop through data files array and use jquery append to add a li for each

                      var dataFileCount = 0;
                      var photoFileCount = 0;
                      for (
                        var i = 0;
                        i < fev.data.currentSelection.instrument.files.length;
                        i++
                      ) {
                        var fileTypeID =
                          fev.data.currentSelection.instrument.files[i]
                            .filetype_id;
                        var fileID =
                          fev.data.currentSelection.instrument.files[i].file_id;
                        var fileDate =
                          fev.data.currentSelection.instrument.files[i]
                            .file_date;
                        var fileName =
                          fev.data.currentSelection.instrument.files[i].name;
                        var photoDate =
                          fev.data.currentSelection.instrument.files[i]
                            .photo_date;

                        var fileDescription;
                        if (
                          fev.data.currentSelection.instrument.files[i]
                            .description == "" ||
                          fev.data.currentSelection.instrument.files[i]
                            .description == null
                        ) {
                          fileDescription = "Description left blank";
                        } else {
                          fileDescription =
                            fev.data.currentSelection.instrument.files[i]
                              .description;
                        }

                        // if file type is a data file
                        if (fileTypeID == 2) {
                          var dataFileItemMarkup =
                            '<li style="list-style:none;">' +
                            '<a target="_blank" title="Download File" href="https://stn.wim.usgs.gov/STNServices/Files/' +
                            fileID +
                            '/Item">' +
                            moment(fileDate).format("MM/DD/yyyy") +
                            " : " +
                            fileName +
                            "</a></li>";
                          $("#dataFile_ul").append(dataFileItemMarkup);
                          dataFileCount++;
                        }

                        // if file type is a photo or hydrograph
                        if (fileTypeID == 1 || fileTypeID == 13) {
                          var photoFileItemMarkup =
                            '<li style="list-style:none;">' +
                            '<a target="_blank" title="Download File" href="https://stn.wim.usgs.gov/STNServices/Files/' +
                            fileID +
                            '/Item">' +
                            "Photo of " +
                            fileDescription +
                            " at " +
                            fev.data.currentSelection.site.site_description +
                            ", " +
                            fev.data.currentSelection.site.county +
                            ", " +
                            fev.data.currentSelection.site.state +
                            ", " +
                            moment(photoDate).format("MM/DD/yyyy") +
                            "</a>" +
                            '<div style="max-width:100px;"><img style="max-width:100px;" src="https://stn.wim.usgs.gov/STNServices/Files/' +
                            fileID +
                            '/Item" /></div>';
                          $("#photoFile_ul").append(photoFileItemMarkup);
                          photoFileCount++;
                        }
                      }

                      if (dataFileCount < 1) {
                        $("#dataFile_ul").append(
                          "<span>No Data Files available</span>"
                        );
                      }
                      if (photoFileCount < 1) {
                        $("#photoFile_ul").append(
                          "<span>No photo files available</span>"
                        );
                      }
                    } else if (
                      fev.data.currentSelection.instrument.files.length == 0
                    ) {
                      $("#dataFilesList").append(
                        "<span>No data files available</span>"
                      );
                      $("#photoFilesList").append(
                        "<span>No photo files available</span>"
                      );
                    }

                    // empty the peak summary table body of existing elements
                    $("#peakSummaryTableBody").empty();
                    // get peak summaries
                    $.ajax({
                      url:
                        "https://stn.wim.usgs.gov/STNServices/Sites/" +
                        siteID +
                        "/PeakSummaryView.json",
                      dataType: "json",
                      async: false,
                      headers: { Accept: "*/*" },
                      success: function (response) {
                        fev.data.currentSelection.site.peak_summaries = response;

                        if (
                          fev.data.currentSelection.site.peak_summaries.length >
                          0
                        ) {
                          for (
                            var i = 0;
                            i <
                            fev.data.currentSelection.site.peak_summaries
                              .length;
                            i++
                          ) {
                            var peakStage =
                              fev.data.currentSelection.site.peak_summaries[i]
                                .peak_stage;
                            var rawPeakDate =
                              fev.data.currentSelection.site.peak_summaries[i]
                                .peak_date;
                            var peakDate = moment(
                              rawPeakDate,
                              "YYYY-MM-DDTHH:mm:ss"
                            ).format("l LT");
                            var eventName =
                              fev.data.currentSelection.site.peak_summaries[i]
                                .event_name;
                            var peakRowMarkup =
                              "<tr><td>" +
                              peakStage +
                              "</td>" +
                              "<td>" +
                              peakDate +
                              "</td>" +
                              "<td>" +
                              eventName +
                              "</td></tr>";
                            $("#peakSummaryTableBody").append(peakRowMarkup);
                          }
                        }

                        var mapHeight = $("#mapDiv").height();
                        var modalHeight = Math.floor(mapHeight * 0.8);
                        var modalHeightString = modalHeight.toString() + "px";

                        // after populating the current selection data fully, show the modal
                        $(".sensor-modal-body").css(
                          "height",
                          modalHeightString
                        );
                        $("#sensorDataModal").modal("show");
                      },
                      error: function (error) {
                        console.log(
                          "Error processing the JSON. The error is:" + error
                        );
                        //return error;
                      },
                    });
                  },
                  error: function (error) {
                    console.log(
                      "Error processing the JSON. The error is:" + error
                    );
                    //return error;
                  },
                });

                // the commented-out code block below is for retieving data for Objective Points and displaying tapedown info.
                // this is being left out for the time being, in an effort to move these internal-oriented data off of the public flood data viewer application (BAD, Sept 2020)
                // first get deployed
                // $.ajax({
                // 	url: 'https://stn.wim.usgs.gov/STNServices/InstrumentStatus/' + deployedInstrumentStatusID + '/OPMeasurements.json',
                // 	dataType: 'json',
                // 	async: false,
                // 	headers: { 'Accept': '*/*' },
                // 	success: function (deployedMeasurements) {
                // 		fev.data.currentSelection.instrument.deployed.measurements = deployedMeasurements;
                // 		// on success, get retrieved
                // 		$.ajax({
                // 			url: 'https://stn.wim.usgs.gov/STNServices/InstrumentStatus/' + retrievedInstrumentStatusID + '/OPMeasurements.json',
                // 			dataType: 'json',
                // 			async: false,
                // 			headers: { 'Accept': '*/*' },
                // 			success: function (retrievedMeasurements) {
                // 				fev.data.currentSelection.instrument.retrieved.measurements = retrievedMeasurements;
                // 				// TODO: handle tapedown retrieval and display
                // 				// TODO: get all the Objective points from web service
                // 				// loop through measurements and use jquery append to add a tr for each with the data
                // 				// for (var i = 0; i < fev.data.currentSelection.instrument.deployed.measurements.length; i++) {
                // 				// 	var tableRowMarkup = '<tr>' +
                // 				// 		'<td></td>' +
                // 				// 		'<td style="text-align:center"></td>' +
                // 				// 		'<td style="text-align:center"></td>' +
                // 				// 		'<td style="text-align:center"></td>' +
                // 				// 		'<td style="text-align:center"></td> </tr>'
                // 				// }
                // 			},
                // 			error: function (error) {
                // 				console.log('Error processing the JSON. The error is:' + error);
                // 				//return error;
                // 			}
                // 		});
                // 	},
                // 	error: function (error) {
                // 		console.log('Error processing the JSON. The error is:' + error);
                // 		// return error;
                // 	}
                // });
              },
              error: function (error) {
                console.log("Error processing the JSON. The error is:" + error);
                //return error;
              },
            });
          },
          error: function (error) {
            console.log("Error processing the JSON. The error is:" + error);
            //return error;
          },
        });
      } else if (type == "hwm") {
        var hwmUrl =
          "https://stn.wim.usgs.gov/STNServices/HWMs/" + objectID + ".json";

        $.ajax({
          url: siteUrl,
          dataType: "json",
          headers: { Accept: "*/*" },
          success: function (siteData) {
            // return data;
            fev.data.currentSelection.site = siteData;

            $("#hwm_site_no").html(fev.data.currentSelection.site.site_no);
            $("#hwm_site_description").html(
              fev.data.currentSelection.site.site_description
            );
            $("#hwm_site_latitude").html(
              fev.data.currentSelection.site.latitude_dd
            );
            $("#hwm_site_longitude").html(
              fev.data.currentSelection.site.longitude_dd
            );
            $("#hwm_hdatum").html(
              translateToDisplayValue(
                fev.data.currentSelection.site.hdatum_id,
                "datum_id",
                "datum_name",
                fev.data.horizontalDatums
              )
            );
            $("#hwm_site_hcollect_method").html(
              translateToDisplayValue(
                fev.data.currentSelection.site.hcollect_method_id,
                "hcollect_method_id",
                "hcollect_method",
                fev.data.horizontalCollectionMethods
              )
            );
            $("#hwm_address").html(fev.data.currentSelection.site.address);
            $("#hwm_city").html(fev.data.currentSelection.site.city);
            $("#hwm_state").html(fev.data.currentSelection.site.state);
            $("#hwm_zip").html(fev.data.currentSelection.site.zip);
            $("#hwm_county").html(fev.data.currentSelection.site.county);
            $("#hwm_waterbody").html(fev.data.currentSelection.site.waterbody);
            $("#hwm_drainage_area").html(
              fev.data.currentSelection.site.drainage_area
                ? fev.data.currentSelection.site.drainage_area
                : "---"
            );
            $("#hwm_usgs_sid").html(fev.data.currentSelection.site.usgs_sid);
            $("#hwm_noaa_sid").html(fev.data.currentSelection.site.noaa_sid);
            $("#hwm_other_sid").html(fev.data.currentSelection.site.other_sid);

            $.ajax({
              url: hwmUrl,
              dataType: "json",
              headers: { Accept: "*/*" },
              success: function (hwmData) {
                fev.data.currentSelection.hwm = hwmData;

                $("#hwm_label").html(fev.data.currentSelection.hwm.hwm_label);
                $("#hwm_approval").html(
                  fev.data.currentSelection.hwm.approval_id !== undefined
                    ? "Approved"
                    : "Provisional"
                );
                $("#hwm_event").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.hwm.event_id,
                    "event_id",
                    "event_name",
                    fev.data.events
                  )
                );
                $("#hwm_type").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.hwm.hwm_type_id,
                    "hwm_type_id",
                    "hwm_type",
                    fev.data.hwmTypes
                  )
                );
                $("#hwm_marker").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.hwm.marker_id,
                    "marker_id",
                    "marker1",
                    fev.data.markerTypes
                  )
                );
                $("#hwm_environment").html(
                  fev.data.currentSelection.hwm.hwm_environment
                );
                $("#hwm_quality").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.hwm.hwm_quality_id,
                    "hwm_quality_id",
                    "hwm_quality",
                    fev.data.hwmQualities
                  )
                );
                $("#hwm_bank").html(fev.data.currentSelection.hwm.hwm_bank);
                $("#hwm_location_description").html(
                  fev.data.currentSelection.hwm.hwm_locationdescription
                );
                $("#hwm_latitude").html(
                  fev.data.currentSelection.hwm.latitude_dd
                );
                $("#hwm_longitude").html(
                  fev.data.currentSelection.hwm.longitude_dd
                );
                $("#hwm_horizontal_datum").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.hwm.hdatum_id,
                    "datum_id",
                    "datum_abbreviation",
                    fev.data.horizontalDatums
                  )
                );
                $("#hwm_hcollect_method").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.hwm.hcollect_method_id,
                    "hcollect_method_id",
                    "hcollect_method",
                    fev.data.horizontalCollectionMethods
                  )
                );
                $("#height_above_gnd").html(
                  fev.data.currentSelection.hwm.height_above_gnd
                );
                $("#hwm_flag_date").html(
                  moment(
                    fev.data.currentSelection.hwm.flag_date,
                    "YYYY-MM-DDTHH:mm:ss"
                  ).format("L")
                );
                $("#hwm_survey_date").html(
                  moment(
                    fev.data.currentSelection.hwm.survey_date,
                    "YYYY-MM-DDTHH:mm:ss"
                  ).format("L")
                );
                $("#elev_ft").html(fev.data.currentSelection.hwm.elev_ft);
                $("#hwm_vertical_datum").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.hwm.vdatum_id,
                    "datum_id",
                    "datum_abbreviation",
                    fev.data.verticalDatums
                  )
                );
                $("#hwm_vcollect_method").html(
                  translateToDisplayValue(
                    fev.data.currentSelection.hwm.vcollect_method_id,
                    "vcollect_method_id",
                    "vcollect_method",
                    fev.data.verticalCollectionMethods
                  )
                );
                $("#hwm_uncertainty").html(
                  fev.data.currentSelection.hwm.hwm_uncertainty
                );
                $("#hwm_notes").html(fev.data.currentSelection.hwm.hwm_notes);
                $("#stillwater").html(
                  fev.data.currentSelection.hwm.stillwater == 0 ? "No" : "Yes"
                );

                // empty the hwm photo files lists of existing elements
                $("#hwmPhotoFilesList").empty();
                // retrieve files data
                $.ajax({
                  url:
                    "https://stn.wim.usgs.gov/STNServices/HWMs/" +
                    objectID +
                    "/Files.json",
                  dataType: "json",
                  async: false,
                  headers: { Accept: "*/*" },
                  success: function (response) {
                    fev.data.currentSelection.hwm.files = response;
                    if (fev.data.currentSelection.hwm.files.length > 0) {
                      $("#hwmPhotoFilesList").append(
                        '<ul id="hwmPhotoFile_ul" style="padding: 0;margin-top:15px;"></ul>'
                      );
                      // loop through data files array and use jquery append to add a li for each
                      for (
                        var i = 0;
                        i < fev.data.currentSelection.hwm.files.length;
                        i++
                      ) {
                        var fileTypeID =
                          fev.data.currentSelection.hwm.files[i].filetype_id;
                        var fileID =
                          fev.data.currentSelection.hwm.files[i].file_id;
                        // var fileDate = fev.data.currentSelection.hwm.files[i].file_date;
                        // var fileName = fev.data.currentSelection.hwm.files[i].name;
                        var photoDate =
                          fev.data.currentSelection.hwm.files[i].photo_date;
                        var fileDescription;
                        if (
                          fev.data.currentSelection.hwm.files[i].description ==
                            "" ||
                          fev.data.currentSelection.hwm.files[i].description ==
                            null
                        ) {
                          fileDescription = "Description left blank";
                        } else {
                          fileDescription =
                            fev.data.currentSelection.hwm.files[i].description;
                        }
                        // if file type is a photo or hydrograph
                        if (fileTypeID == 1 || fileTypeID == 13) {
                          var photoFileItemMarkup =
                            '<li style="list-style:none;">' +
                            '<a target="_blank" title="Download File" href="https://stn.wim.usgs.gov/STNServices/Files/' +
                            fileID +
                            '/Item">' +
                            "Photo of " +
                            fileDescription +
                            " at " +
                            fev.data.currentSelection.site.site_description +
                            ", " +
                            fev.data.currentSelection.site.county +
                            ", " +
                            fev.data.currentSelection.site.state +
                            ", " +
                            moment(photoDate).format("MM/DD/yyyy") +
                            "</a>" +
                            '<div style="max-width:100px;"><img style="max-width:100px;" src="https://stn.wim.usgs.gov/STNServices/Files/' +
                            fileID +
                            '/Item" /></div>';
                          $("#hwmPhotoFile_ul").append(photoFileItemMarkup);
                        }
                      }
                    } else if (
                      fev.data.currentSelection.hwm.files.length == 0
                    ) {
                      $("#hwmPhotoFilesList").append(
                        "<span>No photo files available</span>"
                      );
                    }

                    // empty the peak summary table body of existing elements
                    $("#hwmPeakSummaryTableBody").empty();
                    // get peak summaries
                    $.ajax({
                      url:
                        "https://stn.wim.usgs.gov/STNServices/Sites/" +
                        siteID +
                        "/PeakSummaryView.json",
                      dataType: "json",
                      async: false,
                      headers: { Accept: "*/*" },
                      success: function (response) {
                        fev.data.currentSelection.site.peak_summaries = response;

                        if (
                          fev.data.currentSelection.site.peak_summaries.length >
                          0
                        ) {
                          for (
                            var i = 0;
                            i <
                            fev.data.currentSelection.site.peak_summaries
                              .length;
                            i++
                          ) {
                            var peakStage =
                              fev.data.currentSelection.site.peak_summaries[i]
                                .peak_stage;
                            var rawPeakDate =
                              fev.data.currentSelection.site.peak_summaries[i]
                                .peak_date;
                            var peakDate = moment(
                              rawPeakDate,
                              "YYYY-MM-DDTHH:mm:ss"
                            ).format("l LT");
                            var eventName =
                              fev.data.currentSelection.site.peak_summaries[i]
                                .event_name;
                            var peakRowMarkup =
                              "<tr><td>" +
                              peakStage +
                              "</td>" +
                              "<td>" +
                              peakDate +
                              "</td>" +
                              "<td>" +
                              eventName +
                              "</td></tr>";
                            $("#hwmPeakSummaryTableBody").append(peakRowMarkup);
                          }
                        }

                        var mapHeight = $("#mapDiv").height();
                        var modalHeight = Math.floor(mapHeight * 0.8);
                        var modalHeightString = modalHeight.toString() + "px";

                        // after populating the current selection data fully, show the modal
                        $(".sensor-modal-body").css(
                          "height",
                          modalHeightString
                        );
                        $("#hwmDataModal").modal("show");
                      },
                      error: function (error) {
                        console.log(
                          "Error processing the JSON. The error is:" + error
                        );
                        //return error;
                      },
                    });
                  },
                  error: function (error) {
                    console.log(
                      "Error processing the JSON. The error is:" + error
                    );
                    //return error;
                  },
                });
              },
              error: function (error) {
                console.log("Error processing the JSON. The error is:" + error);
                //return error;
              },
            });
          },
          error: function (error) {
            console.log("Error processing the JSON. The error is:" + error);
            //return error;
          },
        });
      }
    }
  });

  // set up a toggle for the sensors layers and place within legend div, overriding default behavior
  var realTimeToggle = L.control.layers(null, realTimeOverlays, {
    collapsed: false,
  });
  realTimeToggle.addTo(map);
  $("#realTimeToggleDiv").append(realTimeToggle.onAdd(map));

  // var rtScaleAlertMarkup = "<div class='alert alert-warning' role='alert'>Please zoom in to refresh</div>";
  // $('#realTimeToggleDiv').append(rtScaleAlertMarkup);

  $(".leaflet-top.leaflet-right").hide();

  // set up toggle for the observed layers and place within legend div, overriding default behavior
  var observedToggle = L.control.layers(null, observedOverlays, {
    collapsed: false,
  });
  observedToggle.addTo(map);
  $("#observedToggleDiv").append(observedToggle.onAdd(map));
  $(".leaflet-top.leaflet-right").hide();

  // set up toggle for the interpreted layers and place within legend div, overriding default behavior
  var interpretedToggle = L.control.layers(null, interpretedOverlays, {
    collapsed: false,
  });
  interpretedToggle.addTo(map);
  $("#interpretedToggleDiv").append(interpretedToggle.onAdd(map));
  $(".leaflet-top.leaflet-right").hide();

  var supportingLayersToggle = L.control.layers(null, supportingLayers, {
    collapsed: false,
  });
  supportingLayersToggle.addTo(map);
  $("#supportingToggleDiv").append(supportingLayersToggle.onAdd(map));
  $(".leaflet-top.leaflet-right").hide();

  //overlapping marker spidifier
  oms = new OverlappingMarkerSpiderfier(map, {
    keepSpiderfied: true,
  });

  //experimental - untested against actual hurricane track published by NOAA
  //make request for tropical cyclones layer legend. if label = "No active advisories at this time", no data to show. else, add forecast track layer to map. This method suggested by NOAA developer Jason Greenlaw. See below for alternate Identify method
  /* $.getJSON( 'https://nowcoast.noaa.gov/layerinfo?request=legend&format=json&service=wwa_meteocean_tropicalcyclones_trackintensityfcsts_time', {} )
		.done(function( data ) {
			//if any results (features in the bounding box), then add forecast track layer to map, add toggle to interpreted data category.
			if (data[0].label == "No active advisories at this time"){
				return
			} else {
				var noaaTrack = L.esri.dynamicMapLayer({
					url:"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer",
					opacity: 0.5,
					f:'image'
				}).addTo(map);
				interpretedOverlays["NOAA Tropical Cyclone Forecast Track"] = "noaaTrack";
			}
		})
		.fail(function() {
			console.log( "NOAA Tropical Cyclone legend retrieve failed." );
		}); */

  //experimental - untested against actual hurricane track published by NOAA
  //run identify operation against the NOAA tropical cyclone service to check if any features exist within a bounding box around US and into hurricane formation territory of Atlantic Ocean. Suspended in favor of legend check method above.
  // $.getJSON( 'https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer/identify?geometry=%7B%22rings%22%3A%5B%5B%5B1095773.4076228663%2C-2264052.666983325%5D%2C%5B-16260935.479144061%2C1853127.202922333%5D%2C%5B-16280503.35838506%2C9515810.636098623%5D%2C%5B880526.735971868%2C9554946.394580625%5D%2C%5B1095773.4076228663%2C-2264052.666983325%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D%7D&geometryType=esriGeometryPolygon&sr=&layers=&layerDefs=&time=&layerTimeOptions=&tolerance=1&mapExtent=%7B%22xmin%22%3A-18853651.648703426%2C%22ymin%22%3A-6174306.988588039%2C%22xmax%22%3A7739096.239815462%2C%22ymax%22%3A11123698.260455891%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%7D&imageDisplay=600%2C550%2C96&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&dynamicLayers=&returnZ=false&returnM=false&gdbVersion=&f=pjson', {} )
  // 	.done(function( data ) {
  // 		//if any results (features in the bounding box), then add forecast track layer to map, add toggle to interpreted data category.
  // 		if (data.results.length > 0 ){
  // 			var noaaTrack = L.esri.dynamicMapLayer({
  // 				url:"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer",
  // 				opacity: 0.5,
  // 				f:'image'
  // 			}).addTo(map);
  // 			interpretedOverlays["NOAA Tropical Cyclone Forecast Track"] = "noaaTrack";
  // 			//below is older logic, for a dedicated NOAA overlays group. replaced in favor of appending NOAA layer to 'Interpreted Data'
  // 			// var supportingLayers = {
  // 			// 	"NOAA Tropical Cyclone Forecast Track" : noaaTrack
  // 			// 	//"National Geodetic Survey Imagery": noaaImagery
  // 			// };
  // 			// set up toggle for the noaa layers and place within legend div, overriding default behavior
  // 			// var supportingLayersToggle = L.control.layers(null, supportingLayers, {collapsed: false});
  // 			// supportingLayersToggle.addTo(map);
  // 			// $('#noaaToggleDiv').append(supportingLayersToggle.onAdd(map));
  // 			// $('.leaflet-top.leaflet-right').hide();
  // 		}
  // 	})
  // 	.fail(function() {
  // 		console.log( "NOAA Tropical Cyclone layer identify operation failed." );
  // 	});

  //populate initial unfiltered download URLs
  $("#sensorDownloadButtonCSV").attr("href", fev.urls.csvSensorsURLRoot);
  $("#sensorDownloadButtonJSON").attr("href", fev.urls.jsonSensorsURLRoot);
  $("#sensorDownloadButtonXML").attr("href", fev.urls.xmlSensorsURLRoot);
  $("#hwmDownloadButtonCSV").attr("href", fev.urls.csvHWMsURLRoot);
  $("#hwmDownloadButtonJSON").attr("href", fev.urls.jsonHWMsURLRoot);
  $("#hwmDownloadButtonXML").attr("href", fev.urls.xmlHWMsURLRoot);
  $("#peaksDownloadButtonCSV").attr("href", fev.urls.csvPeaksURLRoot);
  $("#peaksDownloadButtonJSON").attr("href", fev.urls.jsonPeaksURLRoot);
  $("#peaksDownloadButtonXML").attr("href", fev.urls.xmlPeaksURLRoot);

  /* sets up data type radio buttons to hide/show the respective forms*/
  $(".dataTypeRadio").each(function () {
    //for the clicked radio
    $(this).on("click", function () {
      var radioId = $(this).attr("id");
      var formToShow = $("#" + radioId + "Form");
      formToShow.show();
      $(".hiddenForm").not(formToShow).hide();
    });
  });

  //toggle the appearance of the check box on click, including toggling the check icon
  $(".check").on("click", function () {
    $(this).find("span").toggle();
  });
  $("#geosearchNav").on("click", function () {
    showGeosearchModal();
  });
  function showAboutModal() {
    $("#aboutModal").modal("show");
  }
  $("#aboutNav").on("click", function () {
    showAboutModal();
  });

  function showFiltersModal() {
    $("#filtersModal").modal("show");
  }
  $("#btnChangeFilters").on("click", function () {
    //update the event select within the filters modal to reflect current event
    $("#evtSelect_filterModal")
      .val([fev.vars.currentEventID_str])
      .trigger("change");
    showFiltersModal();
  });

  // FAQ Modal controls.

  $(".faq-header").on("click", function (event) {
    var div = "#" + event.target.nextElementSibling.id;
    var angle = "#" + event.target.children[0].id;
    $(div).slideToggle(250);

    if ($(angle).css("transform") == "none") {
      $(angle).css("transform", "rotate(90deg)");
    } else {
      $(angle).css("transform", "");
    }
  });

  /* begin basemap controller */
  function setBasemap(basemap) {
    if (layer) {
      map.removeLayer(layer);
    }
    layer = L.esri.basemapLayer(basemap);
    map.addLayer(layer);
    if (layerLabels) {
      map.removeLayer(layerLabels);
    }

    if (
      basemap === "ShadedRelief" ||
      basemap === "Oceans" ||
      basemap === "Gray" ||
      basemap === "DarkGray" ||
      basemap === "Imagery" ||
      basemap === "Terrain"
    ) {
      layerLabels = L.esri.basemapLayer(basemap + "Labels");
      map.addLayer(layerLabels);
    }
  }

  $(".basemapBtn").on("click", function () {
    var baseMap = this.id.replace("btn", "");

    // https://github.com/Esri/esri-leaflet/issues/504 submitted issue that esri-leaflet basemaps dont match esri jsapi

    switch (baseMap) {
      case "Streets":
        baseMap = "Streets";
        break;
      case "Satellite":
        baseMap = "Imagery";
        break;
      case "Topo":
        baseMap = "Topographic";
        break;
      case "Terrain":
        baseMap = "ShadedRelief";
        break;
      case "Gray":
        baseMap = "Gray";
        break;
      case "NatGeo":
        baseMap = "NationalGeographic";
        break;
    }

    setBasemap(baseMap);
  });
  /* end basemap controller */

  /* geocoder control */
  //import USGS search API
  /*
	var searchScript = document.createElement('script');
	searchScript.src = 'https://txpub.usgs.gov/DSS/search_api/1.1/api/search_api.min.js';
	searchScript.onload = function () {
		setSearchAPI();
	};
	document.body.appendChild(searchScript);
	*/

  // add empty geojson layer that will contain suggested locations on update
  var suggestion_layer = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
        opacity: 0.4,
      })
        .bindPopup(
          // popup content
          '<div style="text-align:center;">' +
            "<b>" +
            feature.properties.Label +
            "</b><br/>" +
            feature.properties.Category +
            "</div>",
          // options
          { autoPan: false } // do not pan map to popup when opens
        )
        .on("mouseover", function () {
          // make marker opaque and open popup when mouse is over marker
          this.setOpacity(1.0).openPopup();
        })
        .on("mouseout", function () {
          // make marker semi-transparent and close popup when mouse exits marker
          this.setOpacity(0.4).closePopup();
        })
        .on("click", function () {
          // set result with the marker feature and trigger result event to select the location when the marker is clicked
          searchObj.result = feature;
          searchObj.val("").trigger("result");
        });
    },
  }).addTo(map);

  function showGeosearchModal() {
    $("#geosearchModal").modal("show");

    search_api.create("searchMap", {
      // appearance
      size: "lg", // sizing option, one of "lg" (large), "md" (medium), "sm" (small), "xs" (extra small)
      width: 500, // width of the widget [px]
      placeholder: "Search for a location", // text box placeholder prompt to display when no text is entered
      /* // search area
			lat_min       : bounds.getSouth(), // minimum latitude
			lat_max       : bounds.getNorth(), // maximum latitude
			lon_min       : bounds.getWest(),  // minimum longitude
			lon_max       : bounds.getEast(),  // maximum longitude
			search_states : "tx,ok,nm",        // csv list of 1 or more U.S. States or Territories */

      // suggestion menu
      menu_min_char: 2, // minimum number of characters required before attempting to find menu suggestions
      menu_max_entries: 50, // maximum number of menu items to display
      menu_height: 400, // maximum height of menu [px]

      include_gnis_major: true, // whether to include GNIS places as suggestions in the menu: major categories (most common)...
      include_gnis_minor: false, // ...minor categories (less common)

      include_state: true, // whether to include U.S. States and Territories as suggestions in the menu
      include_zip_code: false, // whether to include 5-digit zip codes as suggestions in the menu
      include_area_code: false, // whether to include 3-digit area codes as suggestions in the menu

      include_usgs_sw: false, // whether to include USGS site numbers as suggestions in the menu: surface water...
      include_usgs_gw: false, // ...ground water
      include_usgs_sp: false, // ...spring
      include_usgs_at: false, // ...atmospheric
      include_usgs_ot: false, // ...other

      include_huc2: false, // whether to include Hydrologic Unit Code (HUC) numbers as suggestions in the menu: 2-digit...
      include_huc4: false, // ... 4-digit
      include_huc6: false, // ... 6-digit
      include_huc8: false, // ... 8-digit
      include_huc10: false, // ...10-digit
      include_huc12: false, // ...12-digit

      // event callback functions
      // function argument "o" is widget object
      // "o.result" is geojson point feature of search result with properties

      // function to execute when a search is started
      // triggered when the search textbox text changes
      on_search: function (o) {
        //console.warn(o.id + ": my 'on_search' callback function - a search is started");
        map.closePopup(); // close any previous popup when user searches for new location
      },

      // function to execute when the suggestion menu is updated
      on_update: function (o) {
        // update geojson layer with menu suggestions
        suggestion_layer.clearLayers().addData(o.getSuggestions());

        // zoom to layer if there are any points
        // pad left so open menu does not cover any points
        if (suggestion_layer.getBounds().isValid()) {
          map.fitBounds(suggestion_layer.getBounds().pad(0.4), {
            paddingTopLeft: [350, 0],
          });
        }

        // find corresponding map marker by lat-lon when mouse enters a menu item
        // open the marker popup and set opaque
        $(".search-api-menu-item")
          .off("mouseenter")
          .on("mouseenter", function () {
            var Lat = $(this).data("properties").Lat;
            var Lon = $(this).data("properties").Lon;
            /*suggestion_layer.eachLayer(function (lyr) {
						if (Lat === lyr.feature.properties.Lat && Lon === lyr.feature.properties.Lon) {
							lyr.setOpacity(1.0).openPopup();
						} else {
							lyr.setOpacity(0.4).closePopup();
						} 
					});*/
          });

        // close popups and set markers semi-transparent when mouse leaves a menu item
        $(".search-api-menu-item")
          .off("mouseleave")
          .on("mouseleave", function () {
            map.closePopup();
            suggestion_layer.eachLayer(function (lyr) {
              lyr.setOpacity(0.4);
            });
          });
      },

      // function to execute when a suggestion is chosen
      // triggered when a menu item is selected
      on_result: function (o) {
        console.warn(
          o.id + ": my 'on_result' callback function - a menu item was selected"
        );
        searchResults = o;
        $("#geosearchModal").modal("hide");
        geosearchComplete();
      },

      // function to execute when no suggestions are found for the typed text
      // triggered when services return no results or time out
      on_failure: function (o) {
        console.warn(
          o.id +
            ": my 'on_failure' callback function - the services returned no results or timed out"
        );
      },

      // miscellaneous
      verbose: false, // whether to set verbose mode on (true) or off (false)
    });
  }

  //the geosearch (in the navbar) zooms to the input location and returns a popup with location name, county, state
  function geosearchComplete() {
    map.fitBounds([
      // zoom to location
      [
        searchResults.result.properties.LatMin,
        searchResults.result.properties.LonMin,
      ],
      [
        searchResults.result.properties.LatMax,
        searchResults.result.properties.LonMax,
      ],
    ]);

    //location popup
    map.openPopup(
      "<b>" +
        searchResults.result.properties.Name +
        "</b><br/>" +
        searchResults.result.properties.County +
        ", " +
        searchResults.result.properties.State,
      [searchResults.result.properties.Lat, searchResults.result.properties.Lon]
    );
  }
  //end of search api

  /* geocoder control */

  /* legend control */
  $("#legendButtonNavBar, #legendButtonSidebar").on("click", function () {
    $("#legend").toggle();
    //return false;
  });
  $("#legendClose").on("click", function () {
    $("#legend").hide();
  });
  /* legend control */

  // map.on('moveend', function(e) {
  //     USGSrtGages.clearLayers();
  //     if (map.hasLayer(USGSrtGages) && map.getZoom() >= 10) {
  //         var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
  //         queryNWISrtGages(bbox);
  //     }
  // });

  //render different HUCs depending on zoom
  map.on("zoomend zoomlevelschange", function (e) {
    var hucCheckBox = document.getElementById("hucToggle");
    if (hucCheckBox.checked == true) {
      allWatersheds.addTo(map);
    }
  });

  ///fix to prevent re-rendering nwis rt gages on pan
  map.on("load moveend zoomend", function (e) {
    var foundPopup;
    $.each(USGSrtGages.getLayers(), function (index, marker) {
      var popup = marker.getPopup();
      if (popup) {
        foundPopup = popup._isOpen;
      }
    });

    $.each(USGSRainGages.getLayers(), function (index, marker) {
      var popup = marker.getPopup();
      if (popup) {
        foundPopup = popup._isOpen;
      }
    });

    $.each(USGSTideGages.getLayers(), function (index, marker) {
      var popup = marker.getPopup();
      if (popup) {
        foundPopup = popup._isOpen;
      }
    });

    //When zoom is less than 9, uncheck and disable rain and stream checkboxes
    if (map.getZoom() < 9) {
      var streamgageCheckBox = document.getElementById("streamGageToggle");
      streamgageCheckBox.checked = false;
      streamgageCheckBox.disabled = true;

      var raingageCheckBox = document.getElementById("rainGageToggle");
      raingageCheckBox.checked = false;
      raingageCheckBox.disabled = true;

      var nwisTidalCheckBox = document.getElementById("nwisTidalGageToggle");
      nwisTidalCheckBox.checked = false;
      nwisTidalCheckBox.disabled = true;

      USGSrtGages.clearLayers();
      USGSRainGages.clearLayers();
      USGSTideGages.clearLayers();
      $("#rtScaleAlert").show();

      if (peakLabels === true) {
        peak.eachLayer(function (myMarker) {
          myMarker.unbindLabel();
          var labelText =
            myMarker.feature.properties.peak_stage !== undefined
              ? myMarker.feature.properties.peak_stage.toString()
              : "No Value";
          myMarker.bindLabel("Peak: " + labelText);
        });
        $("#peakCheckbox").click();
        peakLabels = false;
        return;
      }
    }

    //When zoom is 9 or greater, enable the stream and rain gage checkboxes
    if (map.getZoom() >= 9) {
      var streamgageCheckBox = document.getElementById("streamGageToggle");
      streamgageCheckBox.disabled = false;
      var raingageCheckBox = document.getElementById("rainGageToggle");
      raingageCheckBox.disabled = false;
      var nwisTidalCheckbox = document.getElementById("nwisTidalGageToggle");
      nwisTidalCheckbox.disabled = false;
      $("#rtScaleAlert").hide();
      if (
        streamgageCheckBox.checked == true ||
        raingageCheckBox.checked == true ||
        nwisTidalCheckbox.checked == true
      ) {
        $("#nwisLoadingAlert").show();
      }
    }

    //Show stream gages in new map view when map is panned
    if (
      document.getElementById("streamGageToggle").checked == true &&
      map.getZoom() >= 9 &&
      !foundPopup
    ) {
      var bbox =
        map.getBounds().getSouthWest().lng.toFixed(7) +
        "," +
        map.getBounds().getSouthWest().lat.toFixed(7) +
        "," +
        map.getBounds().getNorthEast().lng.toFixed(7) +
        "," +
        map.getBounds().getNorthEast().lat.toFixed(7);
      queryNWISrtGages(bbox);
      if (map.hasLayer(USGSrtGages) && map.hasLayer(USGSRainGages)) {
        USGSRainGages.bringToFront();
      }
    }

    //Show rain gages in new map view when map is panned
    if (
      document.getElementById("rainGageToggle").checked == true &&
      map.getZoom() >= 9 &&
      !foundPopup
    ) {
      var bbox =
        map.getBounds().getSouthWest().lng.toFixed(7) +
        "," +
        map.getBounds().getSouthWest().lat.toFixed(7) +
        "," +
        map.getBounds().getNorthEast().lng.toFixed(7) +
        "," +
        map.getBounds().getNorthEast().lat.toFixed(7);
      queryNWISRainGages(bbox);
      if (map.hasLayer(USGSrtGages) && map.hasLayer(USGSRainGages)) {
        USGSRainGages.bringToFront();
      }
    }

    //Show tidal gages in new map view when map is panned
    if (
      document.getElementById("nwisTidalGageToggle").checked == true &&
      map.getZoom() >= 9 &&
      !foundPopup
    ) {
      var bbox =
        map.getBounds().getSouthWest().lng.toFixed(7) +
        "," +
        map.getBounds().getSouthWest().lat.toFixed(7) +
        "," +
        map.getBounds().getNorthEast().lng.toFixed(7) +
        "," +
        map.getBounds().getNorthEast().lat.toFixed(7);
      queryNWISTideGages(bbox);
    }

    if (map.hasLayer(USGSrtGages) && map.getZoom() >= 9 && !foundPopup) {
      //put the rdg layer on top
      //set timeout because if the stream gages finish loading after they rdg gages are loaded, they'll be on top
      if (map.hasLayer(rdg)) {
        setTimeout(() => {
          rdg.bringToFront();
          displaySensorGeoJSON(
            "rdg",
            "Rapid Deployment Gage",
            fev.urls["rdg" + "GeoJSONViewURL"] +
              fev.queryStrings.sensorsQueryString,
            window["rdg" + "MarkerIcon"]
          );
        }, 2000);
      }
    }
  });

  USGSrtGages.on("click", function (e) {
    queryNWISgraph(e);
  });

  USGSRainGages.on("click", function (e) {
    queryNWISRaingraph(e);
  });

  USGSTideGages.on("click", function (e) {
    queryNWISgraphTides(e);
  });

  rdg.on("click", function (e) {
    queryNWISgraphRDG(e);
  });

  //begin latLngScale utility logic/////////////////////////////////////////////////////////////////////////////////////////

  //displays map scale on map load
  //map.on( 'load', function() {
  map.whenReady(function () {
    var mapScale = scaleLookup(map.getZoom());
    $("#scale")[0].innerHTML = mapScale;
    console.log("Initial Map scale registered as " + mapScale, map.getZoom());

    var initMapCenter = map.getCenter();
    $("#latitudeScale").html(initMapCenter.lat.toFixed(4));
    $("#longitudeScale").html(initMapCenter.lng.toFixed(4));
  });

  //displays map scale on scale change (i.e. zoom level)
  map.on("zoomend", function () {
    var mapZoom = map.getZoom();
    var mapScale = scaleLookup(mapZoom);
    $("#scale")[0].innerHTML = mapScale;
    $("#zoomLevel")[0].innerHTML = mapZoom;
  });

  //updates lat/lng indicator on mouse move. does not apply on devices w/out mouse. removes 'map center' label
  map.on("mousemove", function (cursorPosition) {
    $("#mapCenterLabel").css("display", "none");
    if (cursorPosition.latlng !== null) {
      $("#latitudeScale").html(cursorPosition.latlng.lat.toFixed(4));
      $("#longitudeScale").html(cursorPosition.latlng.lng.toFixed(4));
    }
  });
  //updates lat/lng indicator to map center after pan and shows 'map center' label.
  map.on("dragend", function () {
    //displays latitude and longitude of map center
    $("#mapCenterLabel").css("display", "inline");
    var geographicMapCenter = map.getCenter();
    $("#latitudeScale").html(geographicMapCenter.lat.toFixed(4));
    $("#longitudeScale").html(geographicMapCenter.lng.toFixed(4));
  });

  function scaleLookup(mapZoom) {
    switch (mapZoom) {
      case 19:
        return "1,128";
      case 18:
        return "2,256";
      case 17:
        return "4,513";
      case 16:
        return "9,027";
      case 15:
        return "18,055";
      case 14:
        return "36,111";
      case 13:
        return "72,223";
      case 12:
        return "144,447";
      case 11:
        return "288,895";
      case 10:
        return "577,790";
      case 9:
        return "1,155,581";
      case 8:
        return "2,311,162";
      case 7:
        return "4,622,324";
      case 6:
        return "9,244,649";
      case 5:
        return "18,489,298";
      case 4:
        return "36,978,596";
      case 3:
        return "73,957,193";
      case 2:
        return "147,914,387";
      case 1:
        return "295,828,775";
      case 0:
        return "591,657,550";
    }
  }
  //end latLngScale utility logic////////
  // size legend panel after having added legend elements
  sizeLegendPanel();
});

function sizeLegendPanel() {
  var mapHeight = $("#mapDiv").height();
  var legendHeight = Math.floor(mapHeight * 0.8);
  var legendHeightString = legendHeight.toString() + "px";
  $(".legend-panel-body").css("max-height", legendHeightString);
  $(".legend-panel-body").css("overflow-y", "auto");
}

function togglePeakLabels() {
  if (map.getZoom() < 9) {
    document.getElementById("peakCheckbox").disabled = true;
  } else if (map.getZoom() >= 9) {
    document.getElementById("peakCheckbox").disabled = false;
    if (peakLabels === false) {
      peak.eachLayer(function (myMarker) {
        myMarker.unbindLabel();
        var labelText =
          myMarker.feature.properties.peak_stage !== undefined
            ? myMarker.feature.properties.peak_stage.toString()
            : "No Value";
        myMarker.bindLabel("Peak: " + labelText, { noHide: true });
        myMarker.showLabel();
      });
      peakLabels = true;
      console.log("show");
      return;
    }
    if (peakLabels === true) {
      peak.eachLayer(function (myMarker) {
        myMarker.unbindLabel();
        var labelText =
          myMarker.feature.properties.peak_stage !== undefined
            ? myMarker.feature.properties.peak_stage.toString()
            : "No Value";
        myMarker.bindLabel("Peak: " + labelText);
      });
      peakLabels = false;
      console.log("hide");
      return;
    }
  }
}

function enlargeImage() {
  $(".imagepreview").attr("src", $(".hydroImage").attr("src"));
  $("#imagemodal").modal("show");
}

//when user checks the Watershed layer in the legend, HUC size appears according to zoom
function clickWatershed() {
  var hucCheckBox = document.getElementById("hucToggle");
  if (hucCheckBox.checked == true) {
    allWatersheds.addTo(map);
  }
  if (hucCheckBox.checked == false) {
    allWatersheds.removeFrom(map);
  }
}

//Display stream gage layer and legend item when rain gage box is checked
function clickStreamGage() {
  var streamgageCheckBox = document.getElementById("streamGageToggle");
  //Prevent user from using toggle when zoom is less than 9
  if (map.getZoom() < 9) {
    streamgageCheckBox.checked = false;
    streamgageCheckBox.disabled = true;
  }

  if (streamgageCheckBox.checked == true) {
    //var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
    //queryNWISrtGages(bbox);
    //When checkbox is checked, add layer to map
    USGSrtGages.addTo(map);
    $("#nwisLoadingAlert").show();
    var bbox =
      map.getBounds().getSouthWest().lng.toFixed(7) +
      "," +
      map.getBounds().getSouthWest().lat.toFixed(7) +
      "," +
      map.getBounds().getNorthEast().lng.toFixed(7) +
      "," +
      map.getBounds().getNorthEast().lat.toFixed(7);
    queryNWISrtGages(bbox);
  }
  //Remove symbol and layer name from legend when box is unchecked
  if (streamgageCheckBox.checked == false) {
    USGSrtGages.clearLayers(map);
  }
}

//Display rain gage layer and legend item when rain gage box is checked
function clickRainGage() {
  var raingageCheckBox = document.getElementById("rainGageToggle");
  //Prevent user from using toggle when zoom is less than 9
  if (map.getZoom() < 9) {
    raingageCheckBox.checked = false;
    raingageCheckBox.disabled = true;
  }
  if (raingageCheckBox.checked == true) {
    USGSRainGages.addTo(map);
    $("#nwisLoadingAlert").show();
    var bbox =
      map.getBounds().getSouthWest().lng.toFixed(7) +
      "," +
      map.getBounds().getSouthWest().lat.toFixed(7) +
      "," +
      map.getBounds().getNorthEast().lng.toFixed(7) +
      "," +
      map.getBounds().getNorthEast().lat.toFixed(7);
    queryNWISRainGages(bbox);
  }
  //Remove symbol and layer name from legend when box is unchecked
  if (raingageCheckBox.checked == false) {
    USGSRainGages.clearLayers(map);
  }
}

//Display NWIS Tidal gage layer and legend item when rain gage box is checked
function clickNwisTidalGage() {
  var nwisTidalCheckbox = document.getElementById("nwisTidalGageToggle");
  //Prevent user from using toggle when zoom is less than 9
  if (map.getZoom() < 9) {
    nwisTidalCheckbox.checked = false;
    nwisTidalCheckbox.disabled = true;
  }
  if (nwisTidalCheckbox.checked == true) {
    USGSTideGages.addTo(map);
    $("#nwisLoadingAlert").show();
    var bbox =
      map.getBounds().getSouthWest().lng.toFixed(7) +
      "," +
      map.getBounds().getSouthWest().lat.toFixed(7) +
      "," +
      map.getBounds().getNorthEast().lng.toFixed(7) +
      "," +
      map.getBounds().getNorthEast().lat.toFixed(7);
    queryNWISTideGages(bbox);
  }
  //Remove symbol and layer name from legend when box is unchecked
  if (nwisTidalCheckbox.checked == false) {
    USGSTideGages.clearLayers(map);
  }
}

//Display peak layer and legend item when peak box is checked
function clickPeaks() {
  var peaksCheckBox = document.getElementById("peaksToggle");
  if (peaksCheckBox.checked == true) {
    //When checkbox is checked, add layer to map
    displayPeaksGeoJSON(
      "peak",
      "Peak Summary",
      fev.urls.peaksFilteredGeoJSONViewURL + fev.queryStrings.peaksQueryString,
      peakMarkerIcon
    );
  }
  //Remove symbol and layer name from legend when box is unchecked
  if (peaksCheckBox.checked == false) {
    peak.clearLayers();
    var peakLabels = document.getElementById("peakCheckbox");
    peakLabels.checked = false;
  }
}
