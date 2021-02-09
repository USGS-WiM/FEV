/**
 * Created by bdraper on 8/4/2016.
 */
///function to grab all values from the inputs, form into arrays, and build query strings
var layerCount = 0;
//ajax retrieval function
function displaySensorGeoJSON(
  type,
  name,
  url,
  markerIcon,
  mainMap,
  eventPopupName
) {
  //increment layerCount
  if (mainMap == true) {
    layerCount++;
    var currentSubGroup = eval(type);
    currentSubGroup.clearLayers();
  }

  var currentMarker = L.geoJson(false, {
    pointToLayer: function (feature, latlng) {
      markerCoords.push(latlng);
      var marker = L.marker(latlng, {
        icon: markerIcon,
      });
      return marker;
    },
    onEachFeature: function (feature, latlng) {
      var instrumentID = feature.properties.instrument_id;
      var url =
        "https://stn.wim.usgs.gov/STNServices/Instruments/" +
        instrumentID +
        "/Files.json";
      var data;

      $.ajax({
        url: url,
        dataType: "json",
        data: data,
        headers: { Accept: "*/*" },
        success: function (data) {
          var hydrographURL = "";
          var hydrographElement;
          var containsHydrograph = false;
          var noHydrograph =
            '<span style="float: right;padding-right: 15px;">No graph available</span>';
          var hydroPopupText;
          for (var i = 0; i < data.length; i++) {
            if (data[i].filetype_id === 13) {
              containsHydrograph = true;
              hydrographURL =
                "https://stn.wim.usgs.gov/STNServices/Files/" +
                data[i].file_id +
                "/Item";
              hydrographElement =
                '<br><img title="Click to enlarge" style="cursor: pointer;" data-toggle="tooltip" class="hydroImage" onclick="enlargeImage()" src=' +
                hydrographURL +
                ">";
            }
          }

          if (containsHydrograph === true) {
            hydroPopupText = hydrographElement;
          } else {
            hydroPopupText = noHydrograph;
          }
          //add marker to overlapping marker spidifier
          if (mainMap == true) {
            oms.addMarker(latlng);
          }
          if (mainMap == false) {
            omsSensorMap.addMarker(latlng);
          }
          //var popupContent = '';
          if (type == "rdg") {
            return;
          }
          if (mainMap == true) {
            var currentEvent = fev.vars.currentEventName;
          }
          if (mainMap == false) {
            var currentEvent = eventPopupName;
          }
          var siteInstrumentArray = [
            feature.properties.site_id,
            feature.properties.instrument_id,
          ];
          var popupContent =
            '<table class="table table-hover table-striped table-condensed wim-table">' +
            '<caption class="popup-title">' +
            name +
            ' | <span style="color:gray"> ' +
            currentEvent +
            "</span></caption>" +
            '<tr><td><strong>STN Site Number: </strong></td><td><span id="siteName">' +
            feature.properties.site_no +
            "</span></td></tr>" +
            '<tr><td><strong>Status: </strong></td><td><span id="status">' +
            feature.properties.status +
            "</span></td></tr>" +
            '<tr><td><strong>City: </strong></td><td><span id="city">' +
            (feature.properties.city == "" ||
            feature.properties.city == null ||
            feature.properties.city == undefined
              ? "<i>No city recorded</i>"
              : feature.properties.city) +
            "</span></td></tr>" +
            '<tr><td><strong>County: </strong></td><td><span id="county">' +
            feature.properties.county +
            "</span></td></tr>" +
            '<tr><td><strong>State: </strong></td><td><span id="state">' +
            feature.properties.state +
            "</span></td></tr>" +
            '<tr><td><strong>Latitude, Longitude (DD): </strong></td><td><span class="latLng">' +
            feature.properties.latitude_dd.toFixed(4) +
            ", " +
            feature.properties.longitude_dd.toFixed(4) +
            "</span></td></tr>" +
            // '<tr><td><strong>STN data page: </strong></td><td><span id="sensorDataLink"><b><a target="blank" href=' + sensorPageURLRoot + feature.properties.site_id + '&Sensor=' + feature.properties.instrument_id + '\>Sensor data page</a></b></span></td></tr>' +
            '<tr><td><strong>Site and Sensor Detail: </strong></td><td><span id="sensorData"><button type="button" class="btn btn-sm sensor-data-btn" title="Click to view site and sensor details" value="' +
            siteInstrumentArray +
            '">View Details</button></span></td></tr>' +
            '<tr><td colspan="2"><strong>Hydrograph: </strong>' +
            hydroPopupText;
          ("</table>");
          latlng.bindPopup(popupContent);
        },
        error: function (error) {
          console.log("Error processing the JSON. The error is:" + error);
        },
      });
    },
  });

  $.getJSON(url, function (data) {
    if (data.length == 0) {
      console.log("0 " + markerIcon.options.name + " GeoJSON features found");
      return;
    }
    if (data.features.length > 0) {
      console.log(
        data.features.length +
          " " +
          markerIcon.options.name +
          " GeoJSON features found"
      );
      //check for bad lat/lon values
      for (var i = data.features.length - 1; i >= 0; i--) {
        //check that lat/lng are not NaN
        if (
          isNaN(data.features[i].geometry.coordinates[0]) ||
          isNaN(data.features[i].geometry.coordinates[1])
        ) {
          console.error(
            "Bad latitude or latitude value for point: ",
            data.features[i]
          );
          //remove it from array
          data.features.splice(i, 1);
        }
        //check that lat/lng are within the US and also not 0
        if (
          (fev.vars.extentSouth <=
            data.features[i].geometry.coordinates[0] <=
            fev.vars.extentNorth &&
            fev.vars.extentWest <=
              data.features[i].geometry.coordinates[1] <=
              fev.vars.extentEast) ||
          data.features[i].geometry.coordinates[0] == 0 ||
          data.features[i].geometry.coordinates[1] == 0
        ) {
          console.error(
            "Bad latitude or latitude value for point: ",
            data.features[i]
          );
          //remove it from array
          data.features.splice(i, 1);
        }
      }
      currentMarker.addData(data);
      if (mainMap == true) {
        currentMarker.eachLayer(function (layer) {
          layer.addTo(currentSubGroup);
        });
        currentSubGroup.addTo(map);
        if (currentSubGroup == "rdg") {
          alert("RDG feature created");
        }
        checkLayerCount(layerCount);
      }
      if (mainMap == false) {
        currentMarker.eachLayer(function (layer) {
          layer.addTo(sensorCompareLayer);
        });
        sensorCompareLayer.addTo(sensorMap);
      }
    }
  });
}

function displayHWMGeoJSON(type, name, url, markerIcon) {
  //increment layerCount
  layerCount++;
  hwm.clearLayers();
  var currentMarker = L.geoJson(false, {
    pointToLayer: function (feature, latlng) {
      markerCoords.push(latlng);
      var marker = L.marker(latlng, {
        icon: markerIcon,
      });
      return marker;
    },
    onEachFeature: function (feature, latlng) {
      if (
        feature.properties.longitude_dd == undefined ||
        feature.properties.latitude_dd == undefined
      ) {
        console.log(
          "Lat/lng undefined for HWM at site no: " + feature.properties.site_no
        );
        return;
      }

      if (
        latlng.feature.geometry.coordinates[0] == null ||
        latlng.feature.geometry.coordinates[1] == null
      ) {
        console.log(
          "null coordinates returned for " + feature.properties.site_no
        );
      }
      //add marker to overlapping marker spidifier
      oms.addMarker(latlng);
      // var popupContent = '';
      var currentEvent = fev.vars.currentEventName;
      var siteHWMArray = [
        feature.properties.site_id,
        feature.properties.hwm_id,
      ];
      var popupContent =
        '<table class="table table-hover table-striped table-condensed wim-table">' +
        '<caption class="popup-title">' +
        name +
        ' | <span style="color:gray">' +
        currentEvent +
        "</span></caption>" +
        '<col style="width:50%"> <col style="width:50%">' +
        '<tr><td><strong>STN Site No.: </strong></td><td><span id="hwmSiteNo">' +
        feature.properties.site_no +
        "</span></td></tr>" +
        '<tr><td><strong>HWM Label: </strong></td><td><span id="hwmLabel">' +
        feature.properties.hwm_label +
        "</span></td></tr>" +
        '<tr><td><strong>Elevation(ft): </strong></td><td><span id="hwmElev">' +
        feature.properties.elev_ft +
        "</span></td></tr>" +
        '<tr><td><strong>Datum: </strong></td><td><span id="hwmWaterbody">' +
        feature.properties.verticalDatumName +
        "</span></td></tr>" +
        '<tr><td><strong>Height Above Ground: </strong></td><td><span id="hwmHtAboveGnd">' +
        (feature.properties.height_above_gnd !== undefined
          ? feature.properties.height_above_gnd
          : "<i>No value recorded</i>") +
        "</span></td></tr>" +
        //'<tr><td><strong>Approval status: </strong></td><td><span id="hwmStatus">'+ (feature.properties.approval_id == undefined || feature.properties.approval_id == 0 ? 'Provisional  <button type="button" class="btn btn-sm data-disclaim"><span class="glyphicon glyphicon-question-sign" aria-hidden="true"></button>'  : 'Approved')+ '</span></td></tr>'+
        '<tr><td><strong>Approval status: </strong></td><td><span id="hwmStatus">' +
        (feature.properties.approval_id == undefined ||
        feature.properties.approval_id == 0
          ? '<button type="button" class="btn btn-sm data-disclaim" title="Click to view provisional data statement">Provisional <span class="glyphicon glyphicon-question-sign" aria-hidden="true"></button>'
          : "Approved") +
        "</span></td></tr>" +
        '<tr><td><strong>Type: </strong></td><td><span id="hwmType"></span>' +
        feature.properties.hwmTypeName +
        "</td></tr>" +
        '<tr><td><strong>Marker: </strong></td><td><span id="hwmMarker">' +
        feature.properties.markerName +
        "</span></td></tr>" +
        '<tr><td><strong>Quality: </strong></td><td><span id="hwmQuality">' +
        feature.properties.hwmQualityName +
        "</span></td></tr>" +
        '<tr><td><strong>Waterbody: </strong></td><td><span id="hwmWaterbody">' +
        feature.properties.waterbody +
        "</span></td></tr>" +
        '<tr><td><strong>County: </strong></td><td><span id="hwmCounty">' +
        feature.properties.countyName +
        "</span></td></tr>" +
        '<tr><td><strong>State: </strong></td><td><span id="hwmState">' +
        feature.properties.stateName +
        "</span></td></tr>" +
        '<tr><td><strong>Latitude, Longitude (DD): </strong></td><td><span class="latLng">' +
        feature.properties.latitude_dd.toFixed(4) +
        ", " +
        feature.properties.longitude_dd.toFixed(4) +
        "</span></td></tr>" +
        '<tr><td><strong>Description: </strong></td><td><span id="hwmDescription">' +
        feature.properties.hwm_locationdescription +
        "</span></td></tr>" +
        // '<tr><td><strong>Full data link: </strong></td><td><span id="sensorDataLink"><b><a target="blank" href=' + hwmPageURLRoot + feature.properties.site_id + '&HWM=' + feature.properties.hwm_id + '\>HWM data page</a></b></span></td></tr>' +
        '<tr><td><strong>High Water Mark Detail: </strong></td><td><span id="hwmData"><button type="button" class="btn btn-sm hwm-data-btn" title="Click to view high water mark details" value="' +
        siteHWMArray +
        '">View Details</button></span></td></tr>' +
        "</table>";
      // $.each(feature.properties, function( index, value ) {
      //     if (value && value != 'undefined') popupContent += '<b>' + index + '</b>:&nbsp;&nbsp;' + value + '</br>';
      // });
      latlng.bindPopup(popupContent);
    },
  });

  $.getJSON(url, function (data) {
    if (data.length == 0) {
      console.log("0 " + markerIcon.options.name + " GeoJSON features found");
      return;
    }
    if (data.features.length > 0) {
      console.log(
        data.features.length +
          " " +
          markerIcon.options.name +
          " GeoJSON features found"
      );
      //check for bad lat/lon values
      for (var i = data.features.length - 1; i >= 0; i--) {
        //check that lat/lng are not NaN
        if (
          isNaN(data.features[i].geometry.coordinates[0]) ||
          isNaN(data.features[i].geometry.coordinates[1])
        ) {
          console.error(
            "Bad latitude or latitude value for point: ",
            data.features[i]
          );
          //remove it from array
          data.features.splice(i, 1);
        }
        //check that lat/lng are within the US and also not 0
        if (
          (fev.vars.extentSouth <=
            data.features[i].geometry.coordinates[0] <=
            fev.vars.extentNorth &&
            fev.vars.extentWest <=
              data.features[i].geometry.coordinates[1] <=
              fev.vars.extentEast) ||
          data.features[i].geometry.coordinates[0] == 0 ||
          data.features[i].geometry.coordinates[1] == 0
        ) {
          console.error(
            "Bad latitude or latitude value for point: ",
            data.features[i]
          );
          //remove it from array
          data.features.splice(i, 1);
        }
      }
      currentMarker.addData(data);
      currentMarker.eachLayer(function (layer) {
        layer.addTo(hwm);
      });
      hwm.addTo(map);
      checkLayerCount(layerCount);
    }
  });
}

function displayPeaksGeoJSON(type, name, url, markerIcon, mainMap, multiTitle) {
  //increment layerCount
  if (mainMap == true) {
    layerCount++;
    peak.clearLayers();
  }
  var currentMarker = L.geoJson(false, {
    pointToLayer: function (feature, latlng) {
      var labelText =
        feature.properties.peak_stage !== undefined
          ? feature.properties.peak_stage.toString()
          : "No Value";
      markerCoords.push(latlng);
      var marker = L.marker(latlng, {
        icon: markerIcon,
      }).bindLabel("Peak: " + labelText);
      return marker;
    },
    onEachFeature: function (feature, latlng) {
      console.log(feature.properties.is_peak_estimated);
      //add marker to overlapping marker spidifier
      oms.addMarker(latlng);
      //var popupContent = '';
      if (mainMap == true) {
        var currentEvent = fev.vars.currentEventName;
      }
      if (mainMap == false) {
        var currentEvent = multiTitle;
      }
      //If peak is not estimated, keep the original popup
      if (feature.properties.is_peak_estimated == 0) {
        //set popup content using moment js to pretty format the date value
        var popupContent =
          '<table class="table table-condensed table-striped table-hover wim-table">' +
          '<caption class="popup-title">' +
          name +
          ' | <span style="color:gray"> ' +
          currentEvent +
          "</span></caption>" +
          "<tr><th>Peak Stage (ft)</th><th>Datum</th><th>Peak Date & Time (UTC)</th></tr>" +
          "<tr><td>" +
          feature.properties.peak_stage +
          "</td><td>" +
          feature.properties.vdatum +
          "</td><td>" +
          moment(feature.properties.peak_date).format(
            "dddd, MMMM Do YYYY, h:mm:ss a"
          ) +
          "</td></tr>" +
          "</table>";
      }
      //If peak is estimated, indicate that in popup
      if (feature.properties.is_peak_estimated == 1) {
        console.log(feature.properties);
        //set popup content using moment js to pretty format the date value
        var popupContent =
          '<table class="table table-condensed table-striped table-hover wim-table">' +
          '<caption class="popup-title">' +
          name +
          ' | <span style="color:gray"> ' +
          currentEvent +
          "</span></caption>" +
          "<tr><th>Peak Stage (ft)</th><th>Datum</th><th>Peak Date & Time (UTC)</th></tr>" +
          "<tr><td>" +
          feature.properties.peak_stage +
          "*" +
          "</td><td>" +
          feature.properties.vdatum +
          "</td><td>" +
          moment(feature.properties.peak_date).format(
            "dddd, MMMM Do YYYY, h:mm:ss a"
          ) +
          "</td></tr>" +
          "</table>" +
          "*Estimated";
      }

      // $.each(feature.properties, function( index, value ) {
      //     if (value && value != 'undefined') popupContent += '<b>' + index + '</b>:&nbsp;&nbsp;' + value + '</br>';
      // });
      latlng.bindPopup(popupContent);
    },
  });

  $.getJSON(url, function (data) {
    if (data.length == 0) {
      console.log("0 " + markerIcon.options.name + " GeoJSON features found");
      return;
    }
    if (data.features.length > 0) {
      console.log(
        data.features.length +
          " " +
          markerIcon.options.name +
          " GeoJSON features found"
      );

      //check for bad lat/lon values
      for (var i = data.features.length - 1; i >= 0; i--) {
        //check that lat/lng are not NaN
        if (
          isNaN(data.features[i].geometry.coordinates[0]) ||
          isNaN(data.features[i].geometry.coordinates[1])
        ) {
          console.error(
            "Bad latitude or latitude value for point: ",
            data.features[i]
          );
          //remove it from array
          data.features.splice(i, 1);
        }
        //check that lat/lng are within the US and also not 0
        if (
          (fev.vars.extentSouth <=
            data.features[i].geometry.coordinates[0] <=
            fev.vars.extentNorth &&
            fev.vars.extentWest <=
              data.features[i].geometry.coordinates[1] <=
              fev.vars.extentEast) ||
          data.features[i].geometry.coordinates[0] == 0 ||
          data.features[i].geometry.coordinates[1] == 0
        ) {
          console.error(
            "Bad latitude or latitude value for point: ",
            data.features[i]
          );
          //remove it from array
          data.features.splice(i, 1);
        }
      }
      currentMarker.addData(data);
      if (mainMap == true) {
        currentMarker.eachLayer(function (layer) {
          layer.addTo(peak);
        });
        peak.addTo(map);
        var peaksCheckBox = document.getElementById("peaksToggle");
        peaksCheckBox.checked = true;
      }
      if (mainMap == false) {
        currentMarker.eachLayer(function (layer) {
          layer.addTo(peakCompareLayer);
        });
      }
    }
  });
}

function populateCameraLayer(type, name, url, markerIcon) {
  // USGS Coastal Cameras layer
  var cameraLocations = [
    {
      type: "Feature",
      properties: {
        name: "Unalakleet, AK",
        url:
          "https://cmgp-coastcam.s3-us-west-2.amazonaws.com/cameras/unalakleet/latest/c1_snap.jpg",
        source:
          "https://www.usgs.gov/centers/pcmsc/science/using-video-imagery-study-wave-dynamics-unalakleet",
      },
      geometry: {
        type: "Point",
        coordinates: [-160.7956, 63.8759],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Santa Cruz, CA",
        url:
          "https://cmgp-coastcam.s3-us-west-2.amazonaws.com/cameras/dreaminn/latest/c1_snap.jpg",
        source:
          "https://www.usgs.gov/centers/pcmsc/science/using-video-imagery-study-coastal-change-santa-cruz-beaches",
      },
      geometry: {
        type: "Point",
        coordinates: [-122.025166, 36.961271],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Sunset State Beach, CA",
        url:
          "https://cmgp-coastcam.s3-us-west-2.amazonaws.com/cameras/sunset/latest/c1_snap.jpg",
        source:
          "https://www.usgs.gov/centers/pcmsc/science/using-video-imagery-study-coastal-change-sunset-state-beach",
      },
      geometry: {
        type: "Point",
        coordinates: [-121.833, 36.887],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Tres Palmas, Rincon, Purto Rico",
        url:
          "https://cmgp-coastcam.s3-us-west-2.amazonaws.com/cameras/rincon/latest/c2_snap.jpg",
        source:
          "https://www.usgs.gov/centers/pcmsc/science/using-video-imagery-study-wave-dynamics-tres-palmas",
      },
      geometry: {
        type: "Point",
        coordinates: [-67.263198, 18.348096],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Madeira Beach, FL",
        url:
          "https://coastal.er.usgs.gov/hurricanes/research/images/madbeach.c1.snap.jpg",
        source:
          "https://www.usgs.gov/centers/spcmsc/science/video-remote-sensing-coastal-processes",
      },
      geometry: {
        type: "Point",
        coordinates: [-82.796093, 27.796206],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Sand Key, FL",
        url:
          "https://coastal.er.usgs.gov/hurricanes/research/images/sandkey.c2.snap.jpg",
        source:
          "https://www.usgs.gov/centers/spcmsc/science/video-remote-sensing-coastal-processes",
      },
      geometry: {
        type: "Point",
        coordinates: [-82.839343, 27.939069],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Head of the Meadow, MA",
        url:
          "https://cmgp-coastcam.s3-us-west-2.amazonaws.com/cameras/caco-01/latest/c1_snap.jpg",
        source:
          "https://www.usgs.gov/centers/whcmsc/science/using-video-imagery-study-head-meadow-beach",
      },
      geometry: {
        type: "Point",
        coordinates: [-70.07738, 42.05048],
      },
    },
  ];

  var cameraIcon = new L.Icon({
    iconSize: [15, 15],
    iconAnchor: [13, 27],
    popupAnchor: [1, -24],
    iconUrl: "images/camera-solid.png",
  });

  var cameraFeatures = L.geoJson(cameraLocations, {
    pointToLayer: function (feature, latlng) {
      // console.log(latlng, feature);
      return L.marker(latlng, {
        icon: cameraIcon,
      });
    },
    onEachFeature: function (feature, latlng) {
      var popupContent =
        "<h4> " +
        feature.properties.name +
        " (latest feed)</h4>" +
        '<img title="Click to enlarge" style="cursor: pointer;" data-toggle="tooltip" class="hydroImage" onclick="enlargeImage()" src=' +
        feature.properties.url +
        ">" +
        '<br><span>Source: <a target="_blank" href=' +
        feature.properties.source +
        ">" +
        feature.properties.source +
        "</a></span>";
      latlng.bindPopup(popupContent);
    },
  });

  cameraFeatures.eachLayer(function (layer) {
    layer.addTo(cameras);
  });
}
//get NOAA tides gages and plot on map
function displayTidesGeoJSON(type, name, url, markerIcon) {
  var timeseriesData = [];
  //increment layerCount
  layerCount++;
  tides.clearLayers();

  //create a geoJSON to populate with coordinates of NOAA tides gages
  var noaaTidesGeoJSON = {
    features: [
      { type: "Feature", geometry: { coordinates: [0, 0], type: "Point" } },
    ],
  };
  var currentMarker = L.geoJson(false, {
    pointToLayer: function (feature, latlng) {
      markerCoords.push(latlng);
      var marker = L.marker(latlng, {
        icon: markerIcon,
      });
      return marker;
    },
    onEachFeature: function (feature, latlng) {
      var beginDate = fev.vars.currentEventStartDate_str.replace("-", "");
      var beginDate = beginDate.replace("-", "");
      var endDate = fev.vars.currentEventEndDate_str.replace("-", "");
      var endDate = endDate.replace("-", "");
      var stationId = feature.properties.id;
      var gageUrl =
        "https://tidesandcurrents.noaa.gov/waterlevels.html?id=" +
        stationId +
        "&units=standard&bdate=" +
        beginDate +
        "&edate=" +
        endDate +
        "&timezone=GMT&datum=MLLW&interval=6&action=";

      // url that would be used if we wanted to make our own graphs
      //var dataUrl = 'https://tidesandcurrents.noaa.gov/api/datagetter?product=water_level&begin_date=' + beginDate + '&end_date=' + endDate + '&datum=MLLW&station=' + stationId + '&time_zone=GMT&units=english&format=json&application=NOS.COOPS.TAC.WL';

      var popupContent =
        '<span><a target="_blank" href=' +
        gageUrl +
        ">Graph of Observed Water Levels at site " +
        stationId +
        "</a></span>";
      latlng.bindPopup(popupContent);
    },
  });

  //access the url that contains the tides data
  $.ajax({
    url: url,
    dataType: "json",
    async: false,
    headers: { Accept: "*/*" },
    //jsonpCallback: 'MyJSONPCallback', // specify the callback name if you're hard-coding it
    success: function (data) {
      console.log(data);
      if (data.stations.length == 0) {
        console.log("0 " + markerIcon.options.name + " GeoJSON features found");
        return;
      }
      if (data.stations.length > 0) {
        console.log(
          data.stations.length +
            " " +
            markerIcon.options.name +
            " GeoJSON features found"
        );
        //loop through every gage in the geojson
        for (var i = data.stations.length - 1; i >= 0; i--) {
          //retrieve lat/lon coordinates
          var latitude = data.stations[i].lat;
          var longitude = data.stations[i].lng;
          var affiliations = data.stations[i].affiliations;
          var stationId = data.stations[i].id;

          //check that there are lat/lng coordinates
          if (isNaN(latitude) || isNaN(longitude)) {
            console.error(
              "latitude or longitude value for point: ",
              data.stations[i],
              "is null"
            );
          }

          //if the lat/lng seems good, add the point to the geoJSON
          else {
            noaaTidesGeoJSON.features[i] = {
              type: "Feature",
              properties: {
                affiliations: affiliations,
                id: stationId,
              },
              geometry: {
                coordinates: [longitude, latitude],
                type: "Point",
              },
            };
          }
        }
        //get the data from the new geoJSON
        currentMarker.addData(noaaTidesGeoJSON);
        currentMarker.eachLayer(function (layer) {
          layer.addTo(tides);
        });
        //plot tides gages on map
        //.addTo(map);
        checkLayerCount(layerCount);
      }
    },
  });
}

///this function sets the current event's start and end dates as global vars. may be better as a function called on demand when date compare needed for NWIS graph setup
function populateEventDates(eventID) {
  for (var i = 0; i < fev.data.events.length; i++) {
    if (fev.data.events[i].event_id == eventID) {
      //set currentEventActive boolean var based on event_status_id value
      fev.data.events[i].event_status_id == 1
        ? (fev.vars.currentEventActive = true)
        : (fev.vars.currentEventActive = false);
      //set event date vars; check for undefined because services do not return the property if it has no value
      fev.vars.currentEventStartDate_str =
        fev.data.events[i].event_start_date == undefined
          ? ""
          : fev.data.events[i].event_start_date.substr(0, 10);
      fev.vars.currentEventEndDate_str =
        fev.data.events[i].event_end_date == undefined
          ? ""
          : fev.data.events[i].event_end_date.substr(0, 10);
      console.log(
        "Selected event is " +
          fev.data.events[i].event_name +
          ". START date is " +
          fev.vars.currentEventStartDate_str +
          " and END date is " +
          fev.vars.currentEventEndDate_str +
          ". Event is active = " +
          fev.vars.currentEventActive
      );
    }
  }
}

function checkLayerCount(layerCount) {
  if (layerCount == fev.layerList.length) {
    if (markerCoords.length > 0) {
      map.fitBounds(markerCoords);
    }
  }
}

function createComparisonData(eventIDs, dataTypeSubmitted) {
  $(".esconder").hide();
  $(".labelSpan").empty();
  eventSelections = eventIDs;
  var sensorTypeSelectionArray = [];

  //change these icons later to a style not associated with a specific event (circle?)
  eventIcon0 = L.divIcon({
    name: "High Water Mark",
    className:
      "wmm-diamond wmm-A0522D wmm-icon-circle wmm-icon-A0522D wmm-size-20",
    iconAnchor: [7, 10],
    popupAnchor: [0, 2],
  });
  eventIcon1 = L.divIcon({
    name: "High Water Mark",
    className:
      "wmm-diamond wmm-red wmm-icon-circle wmm-icon-A0522D wmm-size-20",
    iconAnchor: [7, 10],
    popupAnchor: [0, 2],
  });
  eventIcon2 = L.divIcon({
    name: "High Water Mark",
    className:
      "wmm-diamond wmm-purple wmm-icon-circle wmm-icon-A0522D wmm-size-20",
    iconAnchor: [7, 10],
    popupAnchor: [0, 2],
  });
  eventIcon3 = L.divIcon({
    name: "High Water Mark",
    className:
      "wmm-diamond wmm-gray wmm-icon-circle wmm-icon-A0522D wmm-size-20",
    iconAnchor: [7, 10],
    popupAnchor: [0, 2],
  });
  eventIcon4 = L.divIcon({
    name: "High Water Mark",
    className:
      "wmm-diamond wmm-green wmm-icon-circle wmm-icon-A0522D wmm-size-20",
    iconAnchor: [7, 10],
    popupAnchor: [0, 2],
  });
  var hwmHTML = [
    "<div class= 'wmm-diamond wmm-A0522D wmm-icon-circle wmm-icon-A0522D wmm-size-20'></div>",
    "<div class= 'wmm-diamond wmm-red wmm-icon-circle wmm-icon-A0522D wmm-size-20'></div>",
    "<div class= 'wmm-diamond wmm-purple wmm-icon-circle wmm-icon-A0522D wmm-size-20'></div>",
    "<div class= 'wmm-diamond wmm-gray wmm-icon-circle wmm-icon-A0522D wmm-size-20'></div>",
    "<div class= 'wmm-diamond wmm-green wmm-icon-circle wmm-icon-A0522D wmm-size-20'></div>",
  ];
  eventIconOptions = [
    eventIcon0,
    eventIcon1,
    eventIcon2,
    eventIcon3,
    eventIcon4,
  ];

  var eventNames = [];
  for (var eventCount = 0; eventCount < eventIDs.length; eventCount++) {
    for (var i = 0; i < fev.data.events.length; i++) {
      if (fev.data.events[i].event_id == eventIDs[eventCount]) {
        eventNames.push(fev.data.events[i].event_name);
      }
    }
  }

  //state
  var stateSelections = "";
  if ($("#stateSelectCompare").val() !== null) {
    var stateSelectionsArray = $("#stateSelectCompare").val();
    stateSelections = stateSelectionsArray.toString();
  }
  //county
  var countySelections = "";
  if ($("#countySelectCompare").val() !== null) {
    var countySelectionsArray = $("#countySelectCompare").val();
    countySelections = countySelectionsArray.toString();
  }

  /////////////////////////
  // start SENSOR section//
  /////////////////////////
  if (dataTypeSubmitted == "submitSensors") {
    //overlapping marker spidifier
    omsSensorMap = new OverlappingMarkerSpiderfier(sensorMap, {
      keepSpiderfied: true,
    });
    //sensor type
    var sensorTypeSelections = "";
    if ($("#sensorTypeSelectCompare").val() !== null) {
      sensorTypeSelectionArray = $("#sensorTypeSelectCompare").val();
      sensorTypeSelections = sensorTypeSelectionArray.toString();
    }
    //sensor status
    var sensorStatusSelections = "";
    if ($("#sensorStatusSelectCompare").val() !== null) {
      var sensorStatusSelectionArray = $("#sensorStatusSelectCompare").val();
      sensorStatusSelections = sensorStatusSelectionArray.toString();
    }

    //sensor collection condition
    var collectConditionSelections = "";
    if ($("#collectionConditionSelectCompare").val() !== null) {
      var collectConditionSelectionArray = $(
        "#collectionConditionSelectCompare"
      ).val();
      collectConditionSelections = collectConditionSelectionArray.toString();
    }

    //sensor deployment type
    var deploymentTypeSelections = "";
    if ($("#deployTypeSelectCompare").val() !== null) {
      var deploymentTypeSelectionArray = $("#deployTypeSelectCompare").val();
      deploymentTypeSelections = deploymentTypeSelectionArray.toString();
    }

    //query string including event status and event type params
    ////query string not including event status and event type params
    fev.queryStrings.sensorsQueryString =
      "?Event=" +
      eventSelections +
      "&States=" +
      stateSelections +
      "&County=" +
      countySelections +
      "&SensorType=" +
      sensorTypeSelections +
      "&CurrentStatus=" +
      sensorStatusSelections +
      "&CollectionCondition=" +
      collectConditionSelections +
      "&DeploymentType=" +
      deploymentTypeSelections;

    sensorQueryParameterString =
      "&States=" +
      stateSelections +
      "&County=" +
      countySelections +
      "&SensorType=" +
      sensorTypeSelections +
      "&CurrentStatus=" +
      sensorStatusSelections +
      "&CollectionCondition=" +
      collectConditionSelections +
      "&DeploymentType=" +
      deploymentTypeSelections;

    fev.urls.csvSensorsQueryURL =
      fev.urls.csvSensorsURLRoot + fev.queryStrings.sensorsQueryString;
    fev.urls.jsonSensorsQueryURL =
      fev.urls.jsonSensorsURLRoot + fev.queryStrings.sensorsQueryString;
    fev.urls.xmlSensorsQueryURL =
      fev.urls.xmlSensorsURLRoot + fev.queryStrings.sensorsQueryString;

    //add download buttons
    $("#sensorDownloadButtonCSVCompare").attr(
      "href",
      fev.urls.csvSensorsQueryURL
    );
    $("#sensorDownloadButtonJSONCompare").attr(
      "href",
      fev.urls.jsonSensorsQueryURL
    );

    var sensorViewURL = "/SensorViews.geojson?ViewType=";
    var sensorTypes = [
      [
        "rdg_view&",
        "Rapid Deployment Gage",
        "wmm-circle wmm-icon-triangle wmm-icon-black wmm-size-20",
      ],
      [
        "baro_view&",
        "Barometric Pressure Sensor",
        "wmm-diamond wmm-icon-diamond wmm-icon-black wmm-size-20",
      ],
      [
        "stormtide_view&",
        "Water Level Sensor",
        "wmm-pin wmm-icon-diamond wmm-icon-black wmm-size-20",
      ],
      [
        "met_view&",
        "Meteorological Sensor",
        "wmm-square wmm-icon-diamond wmm-icon-black wmm-size-20",
      ],
      [
        "waveheight_view&",
        "Wave Height Sensor",
        "wmm-circle wmm-icon-diamond wmm-icon-black wmm-size-20 wmm-borderless",
      ],
    ];

    var sensorShapes =
      "<div class='legend-icon' style='margin-left: 10px; margin-bottom: 5px;'>" +
      "<div class= 'wmm-circle wmm-white wmm-icon-triangle wmm-icon-black wmm-size-20 '></div>" +
      "<label style='margin-left: 5px;'>" +
      "Rapid Deployment Gage" +
      "</label></div>" +
      "<div class='legend-icon' style='margin-left: 10px; margin-bottom: 5px;'>" +
      "<div class= 'wmm-diamond wmm-white wmm-icon-diamond wmm-icon-black wmm-size-15 '></div>" +
      "<label style='margin-left: 5px;'>" +
      "Barometric Pressure" +
      "</label></div>" +
      "<div class='legend-icon' style='margin-left: 10px; margin-bottom: 5px;'>" +
      "<div class= 'wmm-pin wmm-white wmm-icon-diamond wmm-icon-black wmm-size-25 '></div>" +
      "<label style='margin-left: 5px;'>" +
      "Water Level Sensor" +
      "</label></div>" +
      "<div class='legend-icon' style='margin-left: 10px; margin-bottom: 5px;'>" +
      "<div class= 'wmm-square wmm-white wmm-icon-diamond wmm-icon-black wmm-size-20 '></div>" +
      "<label style='margin-left: 5px;'>" +
      "Meteorological Sensor" +
      "</label></div>" +
      "<div class='legend-icon' style='margin-left: 10px; margin-bottom: 5px;'>" +
      "<div class= 'wmm-circle wmm-white wmm-icon-diamond wmm-icon-black wmm-size-20 wmm-borderless '></div>" +
      "<label style='margin-left: 5px;'>" +
      "Wave Height Sensor" +
      "</label></div>";

    var eventColor = [
      "wmm-blue",
      "wmm-red",
      "wmm-purple",
      "wmm-gray",
      "wmm-green",
    ];
    //could also use marker clusters instead of changing the offset,
    //but then you can't see the genral layout of colors and shapes without zooming way in
    var uniqueMarkerOffset_x = -10;
    var uniqueMarkerOffset_y = -15;

    //if map was checked, plot the sensor markers
    if (document.getElementById("sensorMapViewCheckbox").checked == true) {
      sensorCompareLayer.clearLayers();
      $("#sensorLegend").children().remove();
      $("#sensorTypeLegend").children().remove();
      for (i = 0; i < eventIDs.length; i++) {
        for (
          var sensorTypeCount = 0;
          sensorTypeCount < sensorTypes.length;
          sensorTypeCount++
        ) {
          var sensorIconClass =
            sensorTypes[sensorTypeCount][2] + " " + eventColor[i];
          console.log("sensorIconClass", sensorIconClass);
          var eventURL = "?Event=" + eventIDs[i] + sensorQueryParameterString;
          displaySensorGeoJSON(
            "",
            sensorTypes[sensorTypeCount][1],
            stnServicesURL +
              sensorViewURL +
              sensorTypes[sensorTypeCount][0] +
              eventURL,
            L.divIcon({
              className: sensorIconClass,
              iconAnchor: [uniqueMarkerOffset_x, uniqueMarkerOffset_y],
            }),
            false,
            eventNames[i]
          );
          uniqueMarkerOffset_x = uniqueMarkerOffset_x + 3;
          uniqueMarkerOffset_y = uniqueMarkerOffset_y + 2;
        }
        var sensorMarkersLegend =
          "<div class='legend-icon' style='margin-left: 10px; margin-bottom: 5px;'>" +
          hwmHTML[i] +
          "<label style='margin-left: 5px;'>" +
          eventNames[i] +
          "</label></div>";

        $("#sensorLegend").append(sensorMarkersLegend);
      }
      $("#sensorTypeLegend").append(sensorShapes);

      sensorCompareLayer.addTo(sensorMap);
      $("#sensorCompareMapResults").show();
    }
    if (document.getElementById("sensorDataViewCheckbox").checked == true) {
      $("#sensorDownloadButtonsCompare").show();
    }
    $("#sensorCompareSelections").hide();
    $("#btnSubmitSensorFilters").hide();
    $("#filtersForAllDataCompare").hide();
    $("#returnToSensorFilters").show();
  }
  //end sensor section

  /////////////////////
  //start HWM section//
  /////////////////////
  if (dataTypeSubmitted == "submitHWMs") {
    omsHwmMap = new OverlappingMarkerSpiderfier(hwmMap, {
      keepSpiderfied: true,
    });
    //HWM types
    var hwmTypeSelections = "";
    if ($("#hwmTypeSelectCompare").val() !== null) {
      var hwmTypeSelectionArray = $("#hwmTypeSelectCompare").val();
      hwmTypeSelections = hwmTypeSelectionArray.toString();
    }
    //HWM quality
    var hwmQualitySelections = "";
    if ($("#hwmQualitySelectCompare").val() !== null) {
      var hwmQualitySelectionArray = $("#hwmQualitySelectCompare").val();
      hwmQualitySelections = hwmQualitySelectionArray.toString();
    }
    ////HWM environment
    var hwmEnvSelectionArray = [];
    //HWM environment: coastal
    if ($("#coastalCompare")[0].checked && !$("#riverine")[0].checked) {
      hwmEnvSelectionArray.push("Coastal");
    }
    //HWM environment: riverine
    if ($("#riverineCompare")[0].checked && !$("#coastal")[0].checked) {
      hwmEnvSelectionArray.push("Riverine");
    }
    var hwmEnvSelections = hwmEnvSelectionArray.toString();
    //HWM survey status
    var hwmSurveyStatusSelectionArray = [];
    ///HWM survey status: complete
    if (
      $("#surveyCompleteYesCompare")[0].checked &&
      !$("#surveyCompleteNoCompare")[0].checked
    ) {
      hwmSurveyStatusSelectionArray.push("true");
    }
    ///HWM survey status: not complete
    if (
      $("#surveyCompleteNoCompare")[0].checked &&
      !$("#surveyCompleteYesCompare")[0].checked
    ) {
      hwmSurveyStatusSelectionArray.push("false");
    }
    var hwmSurveyStatusSelections = hwmSurveyStatusSelectionArray.toString();
    //HWM stillwater status
    var hwmStillwaterStatusSelectionArray = [];
    ///HWM stillwater status: yes
    if (
      $("#stillWaterYesCompare")[0].checked &&
      !$("#stillWaterNoCompare")[0].checked
    ) {
      hwmStillwaterStatusSelectionArray.push("true");
    }
    ///HWM stillwater status: no
    if (
      $("#stillWaterNoCompare")[0].checked &&
      !$("#stillWaterYesCompare")[0].checked
    ) {
      hwmStillwaterStatusSelectionArray.push("false");
    }
    var hwmStillwaterStatusSelections = hwmStillwaterStatusSelectionArray.toString();

    fev.queryStrings.hwmsQueryString =
      "?Event=" +
      eventSelections +
      "&States=" +
      stateSelections +
      "&County=" +
      countySelections +
      "&HWMType=" +
      hwmTypeSelections +
      "&HWMQuality=" +
      hwmQualitySelections +
      "&HWMEnvironment=" +
      hwmEnvSelections +
      "&SurveyComplete=" +
      hwmSurveyStatusSelections +
      "&StillWater=" +
      hwmStillwaterStatusSelections;

    hwmQueryParameterString =
      "&States=" +
      stateSelections +
      "&County=" +
      countySelections +
      "&HWMType=" +
      hwmTypeSelections +
      "&HWMQuality=" +
      hwmQualitySelections +
      "&HWMEnvironment=" +
      hwmEnvSelections +
      "&SurveyComplete=" +
      hwmSurveyStatusSelections +
      "&StillWater=" +
      hwmStillwaterStatusSelections;

    fev.urls.csvHWMsQueryURL =
      fev.urls.csvHWMsURLRoot + fev.queryStrings.hwmsQueryString;
    fev.urls.jsonHWMsQueryURL =
      fev.urls.jsonHWMsURLRoot + fev.queryStrings.hwmsQueryString;
    fev.urls.xmlHWMsQueryURL =
      fev.urls.xmlHWMsURLRoot + fev.queryStrings.hwmsQueryString;

    //add download buttons
    $("#hwmDownloadButtonCSVCompare").attr("href", fev.urls.csvHWMsQueryURL);
    $("#hwmDownloadButtonJSONCompare").attr("href", fev.urls.jsonHWMsQueryURL);

    ////Add HWM markers to map
    if (document.getElementById("hwmMapViewCheckbox").checked == true) {
      hwmCompareLayer.clearLayers();
      $("#hwmLegend").children().remove();
      for (i = 0; i < eventIDs.length; i++) {
        var eventURL = "?Event=" + eventIDs[i] + hwmQueryParameterString;
        multiDisplayHWMGeoJSON(
          "High Water Mark",
          fev.urls.hwmFilteredGeoJSONViewURL + eventURL,
          eventIconOptions[i],
          eventNames[i]
        );
        var hwmMarkersLegend =
          "<div class='legend-icon' style='margin-left: 10px; margin-bottom: 5px;'>" +
          hwmHTML[i] +
          "<label style='margin-left: 5px;'>" +
          eventNames[i] +
          "</label></div>";
        $("#hwmLegend").append(hwmMarkersLegend);
      }

      hwmCompareLayer.addTo(hwmMap);
      $("#hwmCompareMapResults").show();
    }
    if (document.getElementById("hwmDataViewCheckbox").checked == true) {
      $("#hwmCompareDataResults").show();
    }

    $("#hwmCompareSelections").hide();
    $("#btnSubmitHwmFilters").hide();
    $("#filtersForAllDataCompare").hide();
    $("#returnToHwmFilters").show();
  }
  //end hwm section

  //////////////////////
  //start PEAK section//
  //////////////////////
  if (dataTypeSubmitted == "sumbitPeaks") {
    var peakStartDate;
    if ($("#peakStartDateCompare")[0].value !== "") {
      peakStartDate = $("#peakStartDateCompare")[0].value;
    }
    var peakEndDate;
    if ($("#peakEndDateCompare")[0].value !== "") {
      peakEndDate = $("#peakEndDateCompare")[0].value;
    }

    //query string including event status and event type params
    //query string not including event status and event type params
    fev.queryStrings.peaksQueryString =
      "?Event=" +
      eventSelections +
      "&States=" +
      stateSelections +
      "&County=" +
      countySelections +
      "&StartDate=" +
      peakStartDate +
      "&EndDate=" +
      peakEndDate;

    peakQueryParameterString =
      "&States=" +
      stateSelections +
      "&County=" +
      countySelections +
      "&StartDate=" +
      peakStartDate +
      "&EndDate=" +
      peakEndDate;

    fev.urls.csvPeaksQueryURL =
      fev.urls.csvPeaksURLRoot + fev.queryStrings.peaksQueryString;
    fev.urls.jsonPeaksQueryURL =
      fev.urls.jsonPeaksURLRoot + fev.queryStrings.peaksQueryString;
    fev.urls.xmlPeaksQueryURL =
      fev.urls.xmlPeaksURLRoot + fev.queryStrings.peaksQueryString;

    //add download buttons
    $("#peakDownloadButtonCSVCompare").attr("href", fev.urls.csvPeaksQueryURL);
    $("#peakDownloadButtonJSONCompare").attr(
      "href",
      fev.urls.jsonPeaksQueryURL
    );

    //if map was checked, plot the sensor markers
    if (document.getElementById("peakMapViewCheckbox").checked == true) {
      peakCompareLayer.clearLayers();
      $("#peakLegend").children().remove();
      for (i = 0; i < eventIDs.length; i++) {
        var eventURL = "?Event=" + eventIDs[i] + peakQueryParameterString;
        displayPeaksGeoJSON(
          "peak",
          "Peaks Summary",
          fev.urls.peaksFilteredGeoJSONViewURL + eventURL,
          eventIconOptions[i],
          false,
          eventNames[i]
        );
        var peakMarkersLegend =
          "<div class='legend-icon' style='margin-left: 10px; margin-bottom: 5px;'>" +
          hwmHTML[i] +
          "<label style='margin-left: 5px;'>" +
          eventNames[i] +
          "</label></div>";
        $("#peakLegend").append(peakMarkersLegend);
      }
      peakCompareLayer.addTo(peakMap);
      $("#peakCompareMapResults").show();
    }
  }
  if (document.getElementById("peakDataViewCheckbox").checked == true) {
    $("#peakDownloadButtonsCompare").show();
  }

  $("#peakCompareSelections").hide();
  $("#btnSubmitPeakFilters").hide();
  $("#filtersForAllDataCompare").hide();
  $("#returnToPeakFilters").show();
}
//end peaks section

function multiDisplayHWMGeoJSON(name, urlForEvent, markerIcon, eventTitle) {
  var currentMarker = L.geoJson(false, {
    pointToLayer: function (feature, latlng) {
      markerCoords.push(latlng);
      var marker = L.marker(latlng, {
        icon: markerIcon,
      });
      return marker;
    },
    onEachFeature: function (feature, latlng) {
      if (
        feature.properties.longitude_dd == undefined ||
        feature.properties.latitude_dd == undefined
      ) {
        console.log(
          "Lat/lng undefined for HWM at site no: " + feature.properties.site_no
        );
        return;
      }

      if (
        latlng.feature.geometry.coordinates[0] == null ||
        latlng.feature.geometry.coordinates[1] == null
      ) {
        console.log(
          "null coordinates returned for " + feature.properties.site_no
        );
      }
      //add marker to overlapping marker spidifier
      omsHwmMap.addMarker(latlng);
      // var popupContent = '';
      var currentEvent = eventTitle;
      var siteHWMArray = [
        feature.properties.site_id,
        feature.properties.hwm_id,
      ];
      var popupContent =
        '<table class="table table-hover table-striped table-condensed wim-table">' +
        '<caption class="popup-title">' +
        name +
        ' | <span style="color:gray">' +
        currentEvent +
        "</span></caption>" +
        '<col style="width:50%"> <col style="width:50%">' +
        '<tr><td><strong>STN Site No.: </strong></td><td><span id="hwmSiteNo">' +
        feature.properties.site_no +
        "</span></td></tr>" +
        '<tr><td><strong>HWM Label: </strong></td><td><span id="hwmLabel">' +
        feature.properties.hwm_label +
        "</span></td></tr>" +
        '<tr><td><strong>Elevation(ft): </strong></td><td><span id="hwmElev">' +
        feature.properties.elev_ft +
        "</span></td></tr>" +
        '<tr><td><strong>Datum: </strong></td><td><span id="hwmWaterbody">' +
        feature.properties.verticalDatumName +
        "</span></td></tr>" +
        '<tr><td><strong>Height Above Ground: </strong></td><td><span id="hwmHtAboveGnd">' +
        (feature.properties.height_above_gnd !== undefined
          ? feature.properties.height_above_gnd
          : "<i>No value recorded</i>") +
        "</span></td></tr>" +
        //'<tr><td><strong>Approval status: </strong></td><td><span id="hwmStatus">'+ (feature.properties.approval_id == undefined || feature.properties.approval_id == 0 ? 'Provisional  <button type="button" class="btn btn-sm data-disclaim"><span class="glyphicon glyphicon-question-sign" aria-hidden="true"></button>'  : 'Approved')+ '</span></td></tr>'+
        '<tr><td><strong>Approval status: </strong></td><td><span id="hwmStatus">' +
        (feature.properties.approval_id == undefined ||
        feature.properties.approval_id == 0
          ? '<button type="button" class="btn btn-sm data-disclaim" title="Click to view provisional data statement">Provisional <span class="glyphicon glyphicon-question-sign" aria-hidden="true"></button>'
          : "Approved") +
        "</span></td></tr>" +
        '<tr><td><strong>Type: </strong></td><td><span id="hwmType"></span>' +
        feature.properties.hwmTypeName +
        "</td></tr>" +
        '<tr><td><strong>Marker: </strong></td><td><span id="hwmMarker">' +
        feature.properties.markerName +
        "</span></td></tr>" +
        '<tr><td><strong>Quality: </strong></td><td><span id="hwmQuality">' +
        feature.properties.hwmQualityName +
        "</span></td></tr>" +
        '<tr><td><strong>Waterbody: </strong></td><td><span id="hwmWaterbody">' +
        feature.properties.waterbody +
        "</span></td></tr>" +
        '<tr><td><strong>County: </strong></td><td><span id="hwmCounty">' +
        feature.properties.countyName +
        "</span></td></tr>" +
        '<tr><td><strong>State: </strong></td><td><span id="hwmState">' +
        feature.properties.stateName +
        "</span></td></tr>" +
        '<tr><td><strong>Latitude, Longitude (DD): </strong></td><td><span class="latLng">' +
        feature.properties.latitude_dd.toFixed(4) +
        ", " +
        feature.properties.longitude_dd.toFixed(4) +
        "</span></td></tr>" +
        '<tr><td><strong>Description: </strong></td><td><span id="hwmDescription">' +
        feature.properties.hwm_locationdescription +
        "</span></td></tr>" +
        // '<tr><td><strong>Full data link: </strong></td><td><span id="sensorDataLink"><b><a target="blank" href=' + hwmPageURLRoot + feature.properties.site_id + '&HWM=' + feature.properties.hwm_id + '\>HWM data page</a></b></span></td></tr>' +
        '<tr><td><strong>High Water Mark Detail: </strong></td><td><span id="hwmData"><button type="button" class="btn btn-sm hwm-data-btn" title="Click to view high water mark details" value="' +
        siteHWMArray +
        '">View Details</button></span></td></tr>' +
        "</table>";
      // $.each(feature.properties, function( index, value ) {
      //     if (value && value != 'undefined') popupContent += '<b>' + index + '</b>:&nbsp;&nbsp;' + value + '</br>';
      // });
      latlng.bindPopup(popupContent);
    },
  });

  $.getJSON(urlForEvent, function (data) {
    if (data.length == 0) {
      console.log("0 " + markerIcon.options.name + " GeoJSON features found");
      return;
    }
    if (data.features.length > 0) {
      console.log(
        data.features.length +
          " " +
          markerIcon.options.name +
          " GeoJSON features found"
      );
      //check for bad lat/lon values
      for (var i = data.features.length - 1; i >= 0; i--) {
        //check that lat/lng are not NaN
        if (
          isNaN(data.features[i].geometry.coordinates[0]) ||
          isNaN(data.features[i].geometry.coordinates[1])
        ) {
          console.error(
            "Bad latitude or latitude value for point: ",
            data.features[i]
          );
          //remove it from array
          data.features.splice(i, 1);
        }
        //check that lat/lng are within the US and also not 0
        if (
          (fev.vars.extentSouth <=
            data.features[i].geometry.coordinates[0] <=
            fev.vars.extentNorth &&
            fev.vars.extentWest <=
              data.features[i].geometry.coordinates[1] <=
              fev.vars.extentEast) ||
          data.features[i].geometry.coordinates[0] == 0 ||
          data.features[i].geometry.coordinates[1] == 0
        ) {
          console.error(
            "Bad latitude or latitude value for point: ",
            data.features[i]
          );
          //remove it from array
          data.features.splice(i, 1);
        }
      }
      currentMarker.addData(data);
      currentMarker.eachLayer(function (layer) {
        layer.addTo(hwmCompareLayer);
      });
    }
  });
}

function filterMapData(event, isUrlParam) {
  $(".esconder").hide();
  $(".labelSpan").empty();

  layerCount = 0;
  markerCoords = [];
  var eventSelections = "";
  eventSelections = event;
  if (event == null || event == undefined) {
    alert("Please select an event to proceed");
    return;
  }

  //below not needed because we know when user submits event from welcome modal based on button click listener
  ///eventSelect_welcomeModal: display the event name both in display area and large event indicator; set the eventSelections value
  // if ($('#evtSelect_welcomeModal').val() !== null){
  //     var eventSelectionsArray = $('#evtSelect_welcomeModal').val();
  //     eventSelections = eventSelectionsArray.toString();
  //     $('#eventNameDisplay').html($('#evtSelect_welcomeModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
  //     $('#largeEventNameDisplay').html($('#evtSelect_welcomeModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
  //
  // }
  //eventSelect_filterModal: display the event name both in display area and large event indicator; set the eventSelections value
  //eventSelections = '';
  // if ($('#evtSelect_filterModal').val() !== null){
  //     var eventSelectionsArray = $('#evtSelect_filterModal').val();
  //     eventSelections = eventSelectionsArray.toString();
  //     $('#eventNameDisplay').html($('#evtSelect_filterModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
  //     $('#largeEventNameDisplay').html($('#evtSelect_filterModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
  //     populateEventDates(eventSelections);
  //
  // }

  //disabling the logic below pending removal of the event type select and event status select
  //event type
  // var eventTypeSelections = '';
  // if ($('#evtTypeSelect').val() !== null){
  //     var evtTypeSelectionsArray = $('#evtTypeSelect').val();
  //     eventTypeSelections = evtTypeSelectionsArray.toString();
  //     $('#eventTypeDisplay').html($('#evtTypeSelect').select2('data').map(function(elem){ return elem.text;}).join(', '));
  // }
  // //event status
  // var eventStatusSelectionArray = [];
  // //event status: active
  // if ($('#active')[0].checked && !($('#complete')[0].checked) ) {
  //     eventStatusSelectionArray.push(1);
  //     $('#eventStatusDisplay').html('Active');
  // }
  // //event status: complete
  // if ($('#complete')[0].checked && !($('#active')[0].checked)) {
  //     eventStatusSelectionArray.push(2);
  //     $('#eventStatusDisplay').html('Complete');
  // }
  // if ($('#active')[0].checked && $('#complete')[0].checked) {
  //     eventStatusSelectionArray.push(0);
  //     $('#eventStatusDisplay').html('Active, Complete');
  // }
  // if ( !($('#active')[0].checked) && !($('#complete')[0].checked)) {
  //     eventStatusSelectionArray.push(0);
  //     $('#eventStatusDisplay').html('');
  // }
  //
  // var eventStatusSelection =  eventStatusSelectionArray.toString();

  //state
  var stateSelections = "";
  if ($("#stateSelect").val() !== null) {
    var stateSelectionsArray = $("#stateSelect").val();
    stateSelections = stateSelectionsArray.toString();
    if ($("#stateSelect").select2("data").length > 0) {
      for (var i = 0; i < $("#stateSelect").select2("data").length; i++) {
        //sensorTypeSelectionsTextArray.push($('#sensorTypeSelect').select2('data')[i].text);
        $("#stateDisplay").append(
          '<span class="label label-default">' +
            $("#stateSelect").select2("data")[i].text +
            "</span>"
        );
      }
    }
    $("#locationGroupDiv").show();
    $("#stateDisplay_li").show();
    //$('#stateDisplay').html(stateSelections);
  }
  //county
  var countySelections = "";
  if ($("#countySelect").val() !== null) {
    var countySelectionsArray = $("#countySelect").val();
    countySelections = countySelectionsArray.toString();
    if ($("#countySelect").select2("data").length > 0) {
      for (var i = 0; i < $("#countySelect").select2("data").length; i++) {
        //sensorTypeSelectionsTextArray.push($('#sensorTypeSelect').select2('data')[i].text);
        $("#countyDisplay").append(
          '<span class="label label-default">' +
            $("#countySelect").select2("data")[i].text +
            "</span>"
        );
      }
    }
    $("#locationGroupDiv").show();
    $("#countyDisplay_li").show();
    //$('#countyDisplay').html(countySelections);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //SENSORS
  //if ($('#sensorRad')[0].checked){

  //check if any of the sensor filters have value, if so show the sensorsGroupDiv
  if (
    $("#sensorTypeSelect").val() !== null ||
    $("#sensorStatusSelect").val() !== null ||
    $("#collectionConditionSelect").val() !== null ||
    $("#deployTypeSelect").val() !== null
  ) {
    $("#sensorsGroupDiv").show();
  }

  //sensor type
  var sensorTypeSelections = "";
  if ($("#sensorTypeSelect").val() !== null) {
    var sensorTypeSelectionArray = $("#sensorTypeSelect").val();
    sensorTypeSelections = sensorTypeSelectionArray.toString();
    //var sensorTypeSelectionsTextArray = [];
    if ($("#sensorTypeSelect").select2("data").length > 0) {
      for (var i = 0; i < $("#sensorTypeSelect").select2("data").length; i++) {
        //sensorTypeSelectionsTextArray.push($('#sensorTypeSelect').select2('data')[i].text);
        $("#sensorTypeDisplay").append(
          '<span class="label label-default">' +
            $("#sensorTypeSelect").select2("data")[i].text +
            "</span>"
        );
      }
    }
    $("#sensorTypeDisplay_li").show();
    //$('#sensorTypeDisplay').html(sensorTypeSelectionsTextArray.toString());
  }
  //sensor status
  var sensorStatusSelections = "";
  if ($("#sensorStatusSelect").val() !== null) {
    var sensorStatusSelectionArray = $("#sensorStatusSelect").val();
    sensorStatusSelections = sensorStatusSelectionArray.toString();
    //var sensorStatusSelectionsTextArray = [];
    if ($("#sensorStatusSelect").select2("data").length > 0) {
      for (
        var i = 0;
        i < $("#sensorStatusSelect").select2("data").length;
        i++
      ) {
        //sensorStatusSelectionsTextArray.push($('#sensorStatusSelect').select2('data')[i].text)
        $("#sensorStatusDisplay").append(
          '<span class="label label-default">' +
            $("#sensorStatusSelect").select2("data")[i].text +
            "</span>"
        );
      }
    }
    $("#sensorStatusDisplay_li").show();
    //$('#sensorStatusDisplay').html(sensorStatusSelectionsTextArray.toString());
  }

  //sensor collection condition
  var collectConditionSelections = "";
  if ($("#collectionConditionSelect").val() !== null) {
    var collectConditionSelectionArray = $("#collectionConditionSelect").val();
    collectConditionSelections = collectConditionSelectionArray.toString();
    //var collectConditionSelectionsTextArray = [];
    if ($("#collectionConditionSelect").select2("data").length > 0) {
      for (
        var i = 0;
        i < $("#collectionConditionSelect").select2("data").length;
        i++
      ) {
        //collectConditionSelectionsTextArray.push($('#collectionConditionSelect').select2('data')[i].text)
        $("#collectConditionDisplay").append(
          '<span class="label label-default">' +
            $("#collectionConditionSelect").select2("data")[i].text +
            "</span>"
        );
      }
    }
    $("#collectConditionDisplay_li").show();
    //$('#collectConditionDisplay').html(collectConditionSelectionsTextArray.toString());
  }

  //sensor deployment type
  var deploymentTypeSelections = "";
  if ($("#deployTypeSelect").val() !== null) {
    var deploymentTypeSelectionArray = $("#deployTypeSelect").val();
    deploymentTypeSelections = deploymentTypeSelectionArray.toString();
    //var deployTypeSelectionsTextArray = [];
    if ($("#deployTypeSelect").select2("data").length > 0) {
      for (var i = 0; i < $("#deployTypeSelect").select2("data").length; i++) {
        //deployTypeSelectionsTextArray.push($('#deployTypeSelect').select2('data')[i].text)
        $("#deployTypeDisplay").append(
          '<span class="label label-default">' +
            $("#deployTypeSelect").select2("data")[i].text +
            "</span>"
        );
      }
    }
    $("#deployTypeDisplay_li").show();
    //$('#deployTypeDisplay').html(deployTypeSelectionsTextArray.toString());
  }

  //query string including event status and event type params
  //fev.queryStrings.sensorsQueryString = '?Event=' + eventSelections + '&EventType=' + eventTypeSelections + '&EventStatus=' + eventStatusSelection + '&States=' + stateSelections + '&County=' + countySelections + '&SensorType=' + sensorTypeSelections + '&CurrentStatus=' + sensorStatusSelections + '&CollectionCondition=' + collectConditionSelections + '&DeploymentType=' + deploymentTypeSelections;
  ////query string not including event status and event type params
  fev.queryStrings.sensorsQueryString =
    "?Event=" +
    eventSelections +
    "&States=" +
    stateSelections +
    "&County=" +
    countySelections +
    "&SensorType=" +
    sensorTypeSelections +
    "&CurrentStatus=" +
    sensorStatusSelections +
    "&CollectionCondition=" +
    collectConditionSelections +
    "&DeploymentType=" +
    deploymentTypeSelections;

  //var resultIsEmpty = false;

  fev.urls.csvSensorsQueryURL =
    fev.urls.csvSensorsURLRoot + fev.queryStrings.sensorsQueryString;
  fev.urls.jsonSensorsQueryURL =
    fev.urls.jsonSensorsURLRoot + fev.queryStrings.sensorsQueryString;
  fev.urls.xmlSensorsQueryURL =
    fev.urls.xmlSensorsURLRoot + fev.queryStrings.sensorsQueryString;

  //add download buttons
  $("#sensorDownloadButtonCSV").attr("href", fev.urls.csvSensorsQueryURL);
  $("#sensorDownloadButtonJSON").attr("href", fev.urls.jsonSensorsQueryURL);
  $("#sensorDownloadButtonXML").attr("href", fev.urls.xmlSensorsQueryURL);

  //return fev.queryStrings.sensorsQueryString;

  //get geoJSON
  // $.each([ 'baro','met','rdg','stormTide','waveHeight'], function( index, type ) {
  //     displaySensorGeoJSON(type, fev.urls[type + 'GeoJSONViewURL'] + fev.queryStrings.sensorsQueryString, window[type + 'MarkerIcon']);
  // });

  //}
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  //HWMs
  //if ($('#hwmRad')[0].checked) {
  //console.log('in HWM Radio listener function');

  //check if any of the hwm filters have value, if so show the hwmGroupDiv
  if (
    $("#hwmTypeSelect").val() !== null ||
    $("#hwmQualitySelect").val() !== null ||
    $("#coastal")[0].checked ||
    $("#riverine")[0].checked ||
    $("#surveyCompleteYes")[0].checked ||
    $("#surveyCompleteNo")[0].checked ||
    $("#stillWaterYes")[0].checked ||
    $("#stillWaterNo")[0].checked
  ) {
    $("#hwmGroupDiv").show();
  }
  //HWM types
  var hwmTypeSelections = "";
  if ($("#hwmTypeSelect").val() !== null) {
    var hwmTypeSelectionArray = $("#hwmTypeSelect").val();
    hwmTypeSelections = hwmTypeSelectionArray.toString();
    //var hwmTypeSelectionsTextArray = [];
    if ($("#hwmTypeSelect").select2("data").length > 0) {
      for (var i = 0; i < $("#hwmTypeSelect").select2("data").length; i++) {
        //hwmTypeSelectionsTextArray.push($('#hwmTypeSelect').select2('data')[i].text)
        $("#hwmTypeDisplay").append(
          '<span class="label label-default">' +
            $("#hwmTypeSelect").select2("data")[i].text +
            "</span>"
        );
      }
    }
    $("#hwmTypeDisplay_li").show();
    //$('#hwmTypeDisplay').html(hwmTypeSelectionsTextArray.toString());
  }
  //HWM quality
  var hwmQualitySelections = "";
  if ($("#hwmQualitySelect").val() !== null) {
    var hwmQualitySelectionArray = $("#hwmQualitySelect").val();
    hwmQualitySelections = hwmQualitySelectionArray.toString();
    //var hwmQualitySelectionsTextArray = [];
    if ($("#hwmQualitySelect").select2("data").length > 0) {
      for (var i = 0; i < $("#hwmQualitySelect").select2("data").length; i++) {
        //hwmQualitySelectionsTextArray.push($('#hwmQualitySelect').select2('data')[i].text)
        $("#hwmQualityDisplay").append(
          '<span class="label label-default">' +
            $("#hwmQualitySelect").select2("data")[i].text +
            "</span>"
        );
      }
    }
    $("#hwmQualityDisplay_li").show();
    //$('#hwmQualityDisplay').html(hwmQualitySelectionsTextArray.toString());
  }
  ////HWM environment
  var hwmEnvSelectionArray = [];
  //HWM environment: coastal
  if ($("#coastal")[0].checked && !$("#riverine")[0].checked) {
    hwmEnvSelectionArray.push("Coastal");
    $("#hwmEnvDisplay_li").show();
    //$('#hwmEnvDisplay').html('Coastal');
    $("#hwmEnvDisplay").html(
      '<span class="label label-default">Coastal</span>'
    );
  }
  //HWM environment: riverine
  if ($("#riverine")[0].checked && !$("#coastal")[0].checked) {
    hwmEnvSelectionArray.push("Riverine");
    $("#hwmEnvDisplay_li").show();
    //$('#hwmEnvDisplay').html('Riverine');
    $("#hwmEnvDisplay").html(
      '<span class="label label-default">Riverine</span>'
    );
  }
  var hwmEnvSelections = hwmEnvSelectionArray.toString();
  //HWM survey status
  var hwmSurveyStatusSelectionArray = [];
  ///HWM survey status: complete
  if (
    $("#surveyCompleteYes")[0].checked &&
    !$("#surveyCompleteNo")[0].checked
  ) {
    hwmSurveyStatusSelectionArray.push("true");
    $("#hwmSurveyCompDisplay_li").show();
    //$('#hwmSurveyCompDisplay').html('True');
    $("#hwmSurveyCompDisplay").html(
      '<span class="label label-default">True</span>'
    );
  }
  ///HWM survey status: not complete
  if (
    $("#surveyCompleteNo")[0].checked &&
    !$("#surveyCompleteYes")[0].checked
  ) {
    hwmSurveyStatusSelectionArray.push("false");
    $("#hwmSurveyCompDisplay_li").show();
    //$('#hwmSurveyCompDisplay').html('False');
    $("#hwmSurveyCompDisplay").html(
      '<span class="label label-default">False</span>'
    );
  }
  var hwmSurveyStatusSelections = hwmSurveyStatusSelectionArray.toString();
  //HWM stillwater status
  var hwmStillwaterStatusSelectionArray = [];
  ///HWM stillwater status: yes
  if ($("#stillWaterYes")[0].checked && !$("#stillWaterNo")[0].checked) {
    hwmStillwaterStatusSelectionArray.push("true");
    $("#hwmStillWaterDisplay_li").show();
    //$('#hwmStillWaterDisplay').html('True');
    $("#hwmStillWaterDisplay").html(
      '<span class="label label-default">True</span>'
    );
  }
  ///HWM stillwater status: no
  if ($("#stillWaterNo")[0].checked && !$("#stillWaterYes")[0].checked) {
    hwmStillwaterStatusSelectionArray.push("false");
    $("#hwmStillWaterDisplay_li").show();
    //$('#hwmStillWaterDisplay').html('False');
    $("#hwmStillWaterDisplay").html(
      '<span class="label label-default">False</span>'
    );
  }
  var hwmStillwaterStatusSelections = hwmStillwaterStatusSelectionArray.toString();

  //query string including event status and event type params
  //fev.queryStrings.hwmsQueryString = '?Event=' + eventSelections + '&EventType=' + eventTypeSelections + '&EventStatus=' + eventStatusSelection + '&States=' + stateSelections + '&County=' + countySelections + '&HWMType=' + hwmTypeSelections + '&HWMQuality=' + hwmQualitySelections + '&HWMEnvironment=' + hwmEnvSelections + '&SurveyComplete=' + hwmSurveyStatusSelections + '&StillWater=' + hwmStillwaterStatusSelections;
  //query string not including event status and event type params
  fev.queryStrings.hwmsQueryString =
    "?Event=" +
    eventSelections +
    "&States=" +
    stateSelections +
    "&County=" +
    countySelections +
    "&HWMType=" +
    hwmTypeSelections +
    "&HWMQuality=" +
    hwmQualitySelections +
    "&HWMEnvironment=" +
    hwmEnvSelections +
    "&SurveyComplete=" +
    hwmSurveyStatusSelections +
    "&StillWater=" +
    hwmStillwaterStatusSelections;
  //var resultIsEmpty = false;

  fev.urls.csvHWMsQueryURL =
    fev.urls.csvHWMsURLRoot + fev.queryStrings.hwmsQueryString;
  fev.urls.jsonHWMsQueryURL =
    fev.urls.jsonHWMsURLRoot + fev.queryStrings.hwmsQueryString;
  fev.urls.xmlHWMsQueryURL =
    fev.urls.xmlHWMsURLRoot + fev.queryStrings.hwmsQueryString;

  //add download buttons
  $("#hwmDownloadButtonCSV").attr("href", fev.urls.csvHWMsQueryURL);
  $("#hwmDownloadButtonJSON").attr("href", fev.urls.jsonHWMsQueryURL);
  $("#hwmDownloadButtonXML").attr("href", fev.urls.xmlHWMsQueryURL);

  //get geoJSON
  //displayHWMGeoJSON(fev.urls.hwmFilteredGeoJSONViewURL + fev.queryStrings.hwmsQueryString, hwmMarkerIcon);

  //}
  //PEAKS
  //if ($('#peakRad')[0].checked) {
  if (
    $("#peakStartDate")[0].value !== "" ||
    $("#peakEndDate")[0].value !== ""
  ) {
    $("#peaksGroupDiv").show();
  }

  var peakStartDate;
  if ($("#peakStartDate")[0].value !== "") {
    $("#peakStartDisplay_li").show();
    peakStartDate = $("#peakStartDate")[0].value;
    $("#peakStartDisplay").html(moment(peakStartDate).format("D MMM YYYY"));
  }
  var peakEndDate;
  if ($("#peakEndDate")[0].value !== "") {
    $("#peakEndDisplay_li").show();
    peakEndDate = $("#peakEndDate")[0].value;
    $("#peakEndDisplay").html(moment(peakEndDate).format("D MMM YYYY"));
  }

  //query string including event status and event type params
  //fev.queryStrings.peaksQueryString = '?Event=' + eventSelections + '&EventType=' + eventTypeSelections + '&EventStatus=' + eventStatusSelection + '&States=' + stateSelections + '&County=' + countySelections + '&StartDate='  + peakStartDate + '&EndDate=' + peakEndDate;
  //query string not including event status and event type params
  fev.queryStrings.peaksQueryString =
    "?Event=" +
    eventSelections +
    "&States=" +
    stateSelections +
    "&County=" +
    countySelections +
    "&StartDate=" +
    peakStartDate +
    "&EndDate=" +
    peakEndDate;

  //var resultIsEmpty = false;

  fev.urls.csvPeaksQueryURL =
    fev.urls.csvPeaksURLRoot + fev.queryStrings.peaksQueryString;
  fev.urls.jsonPeaksQueryURL =
    fev.urls.jsonPeaksURLRoot + fev.queryStrings.peaksQueryString;
  fev.urls.xmlPeaksQueryURL =
    fev.urls.xmlPeaksURLRoot + fev.queryStrings.peaksQueryString;

  //add download buttons
  $("#peaksDownloadButtonCSV").attr("href", fev.urls.csvPeaksQueryURL);
  $("#peaksDownloadButtonJSON").attr("href", fev.urls.jsonPeaksQueryURL);
  $("#peaksDownloadButtonXML").attr("href", fev.urls.xmlPeaksQueryURL);

  //get geoJSON
  //displayPeaksGeoJSON(fev.urls.peaksFilteredGeoJSONViewURL + fev.queryStrings.peaksQueryString, peaksMarkerIcon);

  //}

  //main loop over layers
  $.each(fev.layerList, function (index, layer) {
    if (layer.Type == "sensor")
      displaySensorGeoJSON(
        layer.ID,
        layer.Name,
        fev.urls[layer.ID + "GeoJSONViewURL"] +
          fev.queryStrings.sensorsQueryString,
        window[layer.ID + "MarkerIcon"],
        true,
        ""
      );
    if (layer.ID == "hwm")
      displayHWMGeoJSON(
        layer.ID,
        layer.Name,
        fev.urls.hwmFilteredGeoJSONViewURL + fev.queryStrings.hwmsQueryString,
        hwmMarkerIcon
      );
    if (layer.ID == "peak")
      displayPeaksGeoJSON(
        layer.ID,
        layer.Name,
        fev.urls.peaksFilteredGeoJSONViewURL +
          fev.queryStrings.peaksQueryString,
        peakMarkerIcon,
        true,
        ""
      );
    setTimeout(() => {
      if (layer.ID == "tides")
        displayTidesGeoJSON(
          layer.ID,
          layer.Name,
          "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json",
          tidesMarkerIcon
        );
    }, 600);
  });
} //end filterMapData function
function queryNWISRainGages(bbox) {
  var NWISRainmarkers = {};

  var siteStatus = "active";
  //var state = ['DE', 'FL', 'GA', 'MD', 'MA', 'NJ', 'NC', 'ND', 'PA', 'RI', 'SC', 'VA', 'WV', 'GU', 'PR'];
  //var state = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'GU', 'PR', 'VI'];
  //for (i = 0; i < state.length; i++) {

  var parameterCodeList2 = "00045,46529,72192";
  var siteTypeList = "OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS,AT,WE,SP";
  var siteStatus = "active";
  var url =
    "https://waterservices.usgs.gov/nwis/site/?format=mapper&bBox=" +
    bbox +
    "&parameterCd=" +
    parameterCodeList2 +
    "&siteType=" +
    siteTypeList +
    "&siteStatus=" +
    siteStatus;

  //var url = 'https://waterdata.usgs.gov/' + state[i] + '/nwis/current?type=precip&group_key=county_cd&format=sitefile_output&sitefile_output_format=xml&column_name=agency_cd&column_name=site_no&column_name=station_nm&column_name=site_tp_cd&column_name=dec_lat_va&column_name=dec_long_va&column_name=agency_use_cd';
  //var url = 'https://waterdata.usgs.gov/nwis/current?type=precip&group_key=county_cd&format=sitefile_output&sitefile_output_format=xml&column_name=agency_cd&column_name=site_no&column_name=station_nm&column_name=site_tp_cd&column_name=dec_lat_va&column_name=dec_long_va&column_name=agency_use_cd';

  $.ajax({
    url: url,
    dataType: "xml",
    data: NWISRainmarkers,
    success: function (xml) {
      $(xml)
        .find("site")
        .each(function () {
          var siteID = $(this).attr("sno");
          var siteName = $(this).attr("sna");
          var lat = $(this).attr("lat");
          var lng = $(this).attr("lng");
          /* NWISmarkers[siteID] = L.marker([lat, lng], { icon: nwisMarkerIcon });
                NWISmarkers[siteID].data = { siteName: siteName, siteCode: siteID };
                NWISmarkers[siteID].data.parameters = {};

                    var siteID = this.children[1].innerHTML;
                    var siteName = this.children[2].innerHTML;
                    if (this.children[4].innerHTML == "") {
                        var lat = "36.378769";
                        var lng = "97.470630";
                    } else {
                        var lat = this.children[4].innerHTML;
                        var lng = this.children[5].innerHTML;
                    } */
          NWISRainmarkers[siteID] = L.marker([lat, lng], {
            icon: nwisRainMarkerIcon,
          });
          NWISRainmarkers[siteID].data = {
            siteName: siteName,
            siteCode: siteID,
          };
          NWISRainmarkers[siteID].data.parameters = {};

          //add point to featureGroup
          USGSRainGages.addLayer(NWISRainmarkers[siteID]);

          $("#nwisLoadingAlert").fadeOut(2000);
        });
    },
    error: function (xml) {
      $("#nwisLoadingAlert").fadeOut(2000);
    },
  });
  //}
}

function queryNWISTideGages(bbox) {
  var NWISTidemarkers = {};

  var siteStatus = "active";
  //var state = ['DE', 'FL', 'GA', 'MD', 'MA', 'NJ', 'NC', 'ND', 'PA', 'RI', 'SC', 'VA', 'WV', 'GU', 'PR'];
  //var state = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'GU', 'PR', 'VI'];
  //for (i = 0; i < state.length; i++) {

  var parameterCodeList2 = "62619,62620";
  var siteTypeList = "OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS";
  var siteStatus = "active";
  var url =
    "https://waterservices.usgs.gov/nwis/site/?format=mapper&bBox=" +
    bbox +
    "&parameterCd=" +
    parameterCodeList2 +
    "&siteType=" +
    siteTypeList +
    "&siteStatus=" +
    siteStatus;

  //var url = 'https://waterdata.usgs.gov/' + state[i] + '/nwis/current?type=precip&group_key=county_cd&format=sitefile_output&sitefile_output_format=xml&column_name=agency_cd&column_name=site_no&column_name=station_nm&column_name=site_tp_cd&column_name=dec_lat_va&column_name=dec_long_va&column_name=agency_use_cd';
  //var url = 'https://waterdata.usgs.gov/nwis/current?type=precip&group_key=county_cd&format=sitefile_output&sitefile_output_format=xml&column_name=agency_cd&column_name=site_no&column_name=station_nm&column_name=site_tp_cd&column_name=dec_lat_va&column_name=dec_long_va&column_name=agency_use_cd';

  $.ajax({
    url: url,
    dataType: "xml",
    data: NWISTidemarkers,
    success: function (xml) {
      $(xml)
        .find("site")
        .each(function () {
          var siteID = $(this).attr("sno");
          var siteName = $(this).attr("sna");
          var lat = $(this).attr("lat");
          var lng = $(this).attr("lng");
          /* NWISmarkers[siteID] = L.marker([lat, lng], { icon: nwisMarkerIcon });
                NWISmarkers[siteID].data = { siteName: siteName, siteCode: siteID };
                NWISmarkers[siteID].data.parameters = {};

                    var siteID = this.children[1].innerHTML;
                    var siteName = this.children[2].innerHTML;
                    if (this.children[4].innerHTML == "") {
                        var lat = "36.378769";
                        var lng = "97.470630";
                    } else {
                        var lat = this.children[4].innerHTML;
                        var lng = this.children[5].innerHTML;
                    } */
          NWISTidemarkers[siteID] = L.marker([lat, lng], {
            icon: nwisTidalMarkerIcon,
          });
          NWISTidemarkers[siteID].data = {
            siteName: siteName,
            siteCode: siteID,
          };
          NWISTidemarkers[siteID].data.parameters = {};

          //add point to featureGroup
          USGSTideGages.addLayer(NWISTidemarkers[siteID]);

          $("#nwisLoadingAlert").fadeOut(2000);
        });
    },
    error: function (xml) {
      $("#nwisLoadingAlert").fadeOut(2000);
    },
  });
  //}
}
//use extent to get NWIS rt gages based on bounding box, display on map
function queryNWISrtGages(bbox) {
  var NWISmarkers = {};

  //NWIS query options from http://waterservices.usgs.gov/rest/IV-Test-Tool.html
  var parameterCodeList = "00065,63160,72214"; // 62619,62620 moved to seperate layer
  var siteTypeList = "OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS";
  var siteStatus = "active";
  var url =
    "https://waterservices.usgs.gov/nwis/site/?format=mapper&bBox=" +
    bbox +
    "&parameterCd=" +
    parameterCodeList +
    "&siteType=" +
    siteTypeList +
    "&siteStatus=" +
    siteStatus;

  $.ajax({
    url: url,
    dataType: "xml",
    success: function (xml) {
      $(xml)
        .find("site")
        .each(function () {
          var siteID = $(this).attr("sno");
          var siteName = $(this).attr("sna");
          var lat = $(this).attr("lat");
          var lng = $(this).attr("lng");
          NWISmarkers[siteID] = L.marker([lat, lng], { icon: nwisMarkerIcon });
          NWISmarkers[siteID].data = { siteName: siteName, siteCode: siteID };
          NWISmarkers[siteID].data.parameters = {};

          //add point to featureGroup
          USGSrtGages.addLayer(NWISmarkers[siteID]);

          $("#nwisLoadingAlert").fadeOut(2000);
        });
    },
    error: function (xml) {
      $("#nwisLoadingAlert").fadeOut(2000);
    },
  });
}

//use extent to get NWIS Rain gages based on bounding box, display on map

//get data and generate graph of RDG water level time-series data
function queryNWISgraphRDG(e) {
  var usgsSiteID;

  var currentEvent = fev.vars.currentEventName;
  var siteInstrumentArray = [
    e.layer.feature.properties.site_id,
    e.layer.feature.properties.instrument_id,
  ];
  var popupContent =
    '<table class="table table-hover table-striped table-condensed">' +
    '<caption class="popup-title">Rapid Deployment Gage | ' +
    currentEvent +
    "</caption>" +
    '<tr><td><strong>STN Site Number: </strong></td><td><span id="siteName">' +
    e.layer.feature.properties.site_no +
    "</span></td></tr>" +
    '<tr><td><strong>Status: </strong></td><td><span id="status">' +
    e.layer.feature.properties.status +
    "</span></td></tr>" +
    '<tr><td><strong>City: </strong></td><td><span id="city">' +
    (e.layer.feature.properties.city == "" ||
    e.layer.feature.properties.city == null ||
    e.layer.feature.properties.city == undefined
      ? "<i>No city recorded</i>"
      : e.layer.feature.properties.city) +
    "</span></td></tr>" +
    '<tr><td><strong>County: </strong></td><td><span id="county">' +
    e.layer.feature.properties.county +
    "</span></td></tr>" +
    '<tr><td><strong>State: </strong></td><td><span id="state">' +
    e.layer.feature.properties.state +
    "</span></td></tr>" +
    '<tr><td><strong>Latitude, Longitude (DD): </strong></td><td><span class="latLng">' +
    e.layer.feature.properties.latitude_dd.toFixed(4) +
    ", " +
    e.layer.feature.properties.longitude_dd.toFixed(4) +
    "</span></td></tr>" +
    // '<tr><td><strong>STN data page: </strong></td><td><span id="sensorDataLink"><b><a target="blank" href=' + sensorPageURLRoot + e.layer.feature.properties.site_id + '&Sensor=' + e.layer.feature.properties.instrument_id + '\>Sensor data page</a></b></span></td></tr>' +
    '<tr><td><strong>Site and Sensor Detail: </strong></td><td><span id="sensorData"><button type="button" class="btn btn-sm sensor-data-btn" title="Click to view site and sensor details" value="' +
    siteInstrumentArray +
    '">View Details</button></span></td></tr>' +
    "</table>" +
    '<div id="RDGgraphContainer" style="width:100%; height:250px;display:none;"></div>' +
    '<div id="RDGdataLink" style="width:100%;display:none;"><b><span class="rdg-nwis-info" style="color:red;"> - Provisional Data Subject to Revision -</span><br><span class="rdg-nwis-info">Additional parameters available at NWISWeb</span><br><a class="nwis-link" id="rdgNWISLink" target="_blank" href="https://usgs.gov"></a></b></div>' +
    '<div id="noDataMessage" style="width:100%;display:none;"><b><span>No NWIS Data Available for Graph</span></b></div>';

  e.layer.bindPopup(popupContent).openPopup();

  $.getJSON(
    stnServicesURL + "/Sites/" + e.layer.feature.properties.site_id + ".json",
    function (data) {
      //USGS UD must be minimum 8 characters long, max 15
      if (data.usgs_sid.length >= 8 && data.usgs_sid.length <= 15) {
        //sensor type is RDG, and there is a usgs id. proceed with retrieving and displaying graph.
        usgsSiteID = data.usgs_sid;
        //hardcode usgsid that does have RDG data, for testing
        //usgsSiteID = '365423076051300';

        var timeQueryRange = "";
        //check if event has a blank end date - in that case set end of time query to current date
        if (fev.vars.currentEventEndDate_str == "") {
          //use moment.js lib to get current system date string, properly formatted
          fev.vars.currentEventEndDate_str = moment().format("YYYY-MM-DD");
          console.log(
            "Selected event is active, so end date is today, " +
              fev.vars.currentEventEndDate_str
          );
        }

        //if there is no valid date string for start or end, there is no way to retrieve data - display NA message. Otherwise proceed.
        if (
          fev.vars.currentEventStartDate_str == "" ||
          fev.vars.currentEventEndDate_str == ""
        ) {
          $("#noDataMessage").show();
        } else {
          //set timeQueryRange to the event start date and end date
          timeQueryRange =
            "&startDT=" +
            fev.vars.currentEventStartDate_str +
            "&endDT=" +
            fev.vars.currentEventEndDate_str;
          //set the URL for the NWIS RDG page, with time period specified
          var rdgNWIS_URL =
            "https://waterdata.usgs.gov/nwis/uv?site_no=" +
            usgsSiteID +
            "&begin_date=" +
            fev.vars.currentEventStartDate_str +
            "&end_date=" +
            fev.vars.currentEventEndDate_str;
          $("#rdgNWISLink").prop("href", rdgNWIS_URL);
          $("#rdgNWISLink").html(
            "Site " +
              usgsSiteID +
              ' on NWISWeb <i class="fa fa-external-link" aria-hidden="true"></i>'
          );

          ///now have valid start and end date strings, so proceed with getting the graph (for water level, generically defined, PCs 62620,00065,00067
          //may need to account for cases where multiple time-series sets returns, 1 for each of multiple params hint: data.parameter_cd should show PC before drilling down to time series object
          //idea below for prioritizing 00065
          ///var gageHeightCode = 00065
          //$each(sites) function(site) {
          //    if (site.parameter_cd =='62620') gageheightCode == site.parameter_cd
          //}
          $.getJSON(
            "https://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=" +
              usgsSiteID +
              "&parameterCd=62620,00065,00067" +
              timeQueryRange,
            function (data) {
              if (data.data == undefined) {
                console.log("No NWIS RDG data available for this time period");
                $("#noDataMessage").show();
                //if no time series data, display data NA message
                //if (data.data[0].time_series_data.length <= 0 ){}
              } else {
                //if there is some data, show the div
                $("#RDGdataLink").show();
                $("#RDGgraphContainer").show();

                //create chart
                Highcharts.setOptions({ global: { useUTC: false } });
                $("#RDGgraphContainer").highcharts({
                  chart: {
                    type: "line",
                  },
                  title: {
                    text: "RDG water level, NWIS site " + usgsSiteID,
                    align: "left",
                    style: {
                      color: "rgba(0,0,0,0.6)",
                      fontSize: "small",
                      fontWeight: "bold",
                      fontFamily: "Open Sans, sans-serif",
                    },
                    //text: null
                  },
                  exporting: {
                    filename: "FEV_RDG_NWISSite" + usgsSiteID,
                  },
                  credits: {
                    enabled: true,
                    text: "USGS NWIS",
                    href: "https://waterdata.usgs.gov/nwis",
                  },
                  xAxis: {
                    type: "datetime",
                    labels: {
                      formatter: function () {
                        return Highcharts.dateFormat("%m/%d/%y", this.value);
                      },
                      //rotation: -90,
                      align: "center",
                    },
                  },
                  yAxis: {
                    title: { text: "Gage Height, feet" },
                  },
                  series: [
                    {
                      showInLegend: false,
                      data: data.data[0].time_series_data,
                      tooltip: {
                        pointFormat: "Gage height: {point.y} feet",
                      },
                    },
                  ],
                });
              }
            }
          );
        }
      } else {
        //no valid usgs id, so no RDG data available - show message saying that
        $("#noDataMessage").show();
      }
    }
  );
}

//get data and generate graph of real-time gage water level time-series data
function queryNWISgraph(e) {
  var popupContent = "";
  //$.each(e.layer.data.parameters, function( index, parameter ) {
  //create table, converting timestamp to friendly format using moment.js library
  //popupContent += '<tr><td>' + index + '</td><td>' + parameter.Value + '</td><td>' + moment(parameter.Time).format("dddd, MMMM Do YYYY, h:mm:ss a") + '</td></tr>'
  //});

  var parameterCodeList = "00065,63160,72279";
  //var parameterCodeList = '00065';

  var timeQueryRange = "";
  //if event has no end date
  if (fev.vars.currentEventEndDate_str == "") {
    //use moment.js lib to get current system date string, properly formatted, set currentEventEndDate var to current date
    fev.vars.currentEventEndDate_str = moment().format("YYYY-MM-DD");
  }
  //if no start date and
  if (
    fev.vars.currentEventStartDate_str == "" ||
    fev.vars.currentEventEndDate_str == ""
  ) {
    timeQueryRange = "&period=P7D";
  } else {
    timeQueryRange =
      "&startDT=" +
      fev.vars.currentEventStartDate_str +
      "&endDT=" +
      fev.vars.currentEventEndDate_str;
  }

  //popup markup with site name number and name - moved into chart title
  //e.layer.bindPopup('<label class="popup-title">Site ' + e.layer.data.siteCode + '</br>' + e.layer.data.siteName + '</span></label></br><p id="graphLoadMessage"><span><i class="fa fa-lg fa-cog fa-spin fa-fw"></i> NWIS data graph loading...</span></p><div id="graphContainer" style="width:100%; height:200px;display:none;"></div> <a target="_blank" href="https://nwis.waterdata.usgs.gov/nwis/uv?site_no=' + e.layer.data.siteCode + '">NWIS data page for site ' + e.layer.data.siteCode + ' <i class="fa fa-external-link" aria-hidden="true"></i></a><div id="noDataMessage" style="width:100%;display:none;"><b><span>NWIS water level data not available to graph</span></b></div>', {minWidth: 350}).openPopup();
  e.layer
    .bindPopup(
      '<label class="popup-title">NWIS Site ' +
        e.layer.data.siteCode +
        "</br>" +
        e.layer.data.siteName +
        '</span></label></br><p id="graphLoadMessage"><span><i class="fa fa-lg fa-cog fa-spin fa-fw"></i> NWIS data graph loading...</span></p><div id="graphContainer" style="width:100%; height:200px;display:none;"></div> <div>Gage Height data courtesy of the U.S. Geological Survey</div><a class="nwis-link" target="_blank" href="https://nwis.waterdata.usgs.gov/nwis/uv?site_no=' +
        e.layer.data.siteCode +
        '"><b>Site ' +
        e.layer.data.siteCode +
        ' on NWISWeb <i class="fa fa-external-link" aria-hidden="true"></i></b></a><div id="noDataMessage" style="width:100%;display:none;"><b><span>NWIS water level data not available to graph</span></b></div>',
      { minWidth: 350 }
    )
    .openPopup();

  $.getJSON(
    "https://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=" +
      e.layer.data.siteCode +
      "&parameterCd=" +
      parameterCodeList +
      timeQueryRange,
    function (data) {
      //if (data.data[0].time_series_data.length <= 0) console.log("No NWIS graph data available for this time period");

      if (data.data == undefined) {
        console.log("No NWIS data available for this time period");
        $("#graphLoadMessage").hide();
        $("#noDataMessage").show();
        //if no time series data, display data NA message
        //if (data.data[0].time_series_data.length <= 0 ){}
      } else {
        //if there is some data, show the div
        $("#graphLoadMessage").hide();
        $(".popup-title").hide();
        $("#graphContainer").show();

        //create chart
        Highcharts.setOptions({ global: { useUTC: false } });
        $("#graphContainer").highcharts({
          chart: {
            type: "line",
          },
          title: {
            text:
              "NWIS Site " +
              e.layer.data.siteCode +
              "<br> " +
              e.layer.data.siteName,
            align: "left",
            style: {
              color: "rgba(0,0,0,0.6)",
              fontSize: "small",
              fontWeight: "bold",
              fontFamily: "Open Sans, sans-serif",
            },
            //text: null
          },
          exporting: {
            filename: "FEV_NWIS_Site" + e.layer.data.siteCode,
          },
          credits: {
            enabled: false,
          },
          xAxis: {
            type: "datetime",
            labels: {
              formatter: function () {
                return Highcharts.dateFormat("%d %b %y", this.value);
              },
              //rotation: -90,
              align: "center",
            },
          },
          yAxis: {
            title: { text: "Gage Height, feet" },
          },
          series: [
            {
              showInLegend: false,
              data: data.data[0].time_series_data,
              tooltip: {
                pointFormat: "Gage height: {point.y} feet",
              },
            },
          ],
        });
      }
    }
  );
}

function queryNWISgraphTides(e) {
  var popupContent = "";
  //$.each(e.layer.data.parameters, function( index, parameter ) {
  //create table, converting timestamp to friendly format using moment.js library
  //popupContent += '<tr><td>' + index + '</td><td>' + parameter.Value + '</td><td>' + moment(parameter.Time).format("dddd, MMMM Do YYYY, h:mm:ss a") + '</td></tr>'
  //});

  var parameterCodeList = "62619,62620";
  //var parameterCodeList = '00065';

  var timeQueryRange = "";
  //if event has no end date
  if (fev.vars.currentEventEndDate_str == "") {
    //use moment.js lib to get current system date string, properly formatted, set currentEventEndDate var to current date
    fev.vars.currentEventEndDate_str = moment().format("YYYY-MM-DD");
  }
  //if no start date and
  if (
    fev.vars.currentEventStartDate_str == "" ||
    fev.vars.currentEventEndDate_str == ""
  ) {
    timeQueryRange = "&period=P7D";
  } else {
    timeQueryRange =
      "&startDT=" +
      fev.vars.currentEventStartDate_str +
      "&endDT=" +
      fev.vars.currentEventEndDate_str;
  }

  //popup markup with site name number and name - moved into chart title
  //e.layer.bindPopup('<label class="popup-title">Site ' + e.layer.data.siteCode + '</br>' + e.layer.data.siteName + '</span></label></br><p id="graphLoadMessage"><span><i class="fa fa-lg fa-cog fa-spin fa-fw"></i> NWIS data graph loading...</span></p><div id="graphContainer" style="width:100%; height:200px;display:none;"></div> <a target="_blank" href="https://nwis.waterdata.usgs.gov/nwis/uv?site_no=' + e.layer.data.siteCode + '">NWIS data page for site ' + e.layer.data.siteCode + ' <i class="fa fa-external-link" aria-hidden="true"></i></a><div id="noDataMessage" style="width:100%;display:none;"><b><span>NWIS water level data not available to graph</span></b></div>', {minWidth: 350}).openPopup();
  e.layer
    .bindPopup(
      '<label class="popup-title">NWIS Site ' +
        e.layer.data.siteCode +
        "</br>" +
        e.layer.data.siteName +
        '</span></label></br><p id="graphLoadMessage"><span><i class="fa fa-lg fa-cog fa-spin fa-fw"></i> NWIS data graph loading...</span></p><div id="graphContainer" style="width:100%; height:200px;display:none;"></div> <div>Gage Height data courtesy of the U.S. Geological Survey</div><a class="nwis-link" target="_blank" href="https://nwis.waterdata.usgs.gov/nwis/uv?site_no=' +
        e.layer.data.siteCode +
        '"><b>Site ' +
        e.layer.data.siteCode +
        ' on NWISWeb <i class="fa fa-external-link" aria-hidden="true"></i></b></a><div id="noDataMessage" style="width:100%;display:none;"><b><span>NWIS water level data not available to graph</span></b></div>',
      { minWidth: 350 }
    )
    .openPopup();

  $.getJSON(
    "https://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=" +
      e.layer.data.siteCode +
      "&parameterCd=" +
      parameterCodeList +
      timeQueryRange,
    function (data) {
      //if (data.data[0].time_series_data.length <= 0) console.log("No NWIS graph data available for this time period");

      if (data.data == undefined) {
        console.log("No NWIS data available for this time period");
        $("#graphLoadMessage").hide();
        $("#noDataMessage").show();
        //if no time series data, display data NA message
        //if (data.data[0].time_series_data.length <= 0 ){}
      } else {
        //if there is some data, show the div
        $("#graphLoadMessage").hide();
        $(".popup-title").hide();
        $("#graphContainer").show();

        //create chart
        Highcharts.setOptions({ global: { useUTC: false } });
        $("#graphContainer").highcharts({
          chart: {
            type: "line",
            //marginTop: 10
          },
          title: {
            text:
              "NWIS Site " +
              e.layer.data.siteCode +
              "<br> " +
              e.layer.data.siteName +
              "<br> " +
              data.data[0].parameter_name,
            align: "left",
            style: {
              color: "rgba(0,0,0,0.6)",
              fontSize: "small",
              fontWeight: "bold",
              fontFamily: "Open Sans, sans-serif",
            },
            //text: null
          },
          exporting: {
            filename: "FEV_NWIS_Site" + e.layer.data.siteCode,
          },
          credits: {
            enabled: false,
          },
          xAxis: {
            type: "datetime",
            labels: {
              formatter: function () {
                return Highcharts.dateFormat("%d %b %y", this.value);
              },
              //rotation: -90,
              align: "center",
            },
          },
          yAxis: {
            title: { text: "Gage Height, feet" },
          },
          series: [
            {
              showInLegend: false,
              data: data.data[0].time_series_data,
              tooltip: {
                pointFormat: "Gage height: {point.y} feet",
              },
            },
          ],
        });
      }
    }
  );
}

function queryNWISRaingraph(e) {
  var popupContent = "";
  //$.each(e.layer.data.parameters, function( index, parameter ) {
  //create table, converting timestamp to friendly format using moment.js library
  //popupContent += '<tr><td>' + index + '</td><td>' + parameter.Value + '</td><td>' + moment(parameter.Time).format("dddd, MMMM Do YYYY, h:mm:ss a") + '</td></tr>'
  //});

  var parameterCodeList = "00045,89363,46529,72192";
  //var parameterCodeList = '00065';

  var timeQueryRange = "";
  //if event has no end date
  if (fev.vars.currentEventEndDate_str == "") {
    //use moment.js lib to get current system date string, properly formatted, set currentEventEndDate var to current date
    fev.vars.currentEventEndDate_str = moment().format("YYYY-MM-DD");
  }
  //if no start date and
  if (
    fev.vars.currentEventStartDate_str == "" ||
    fev.vars.currentEventEndDate_str == ""
  ) {
    timeQueryRange = "&period=P7D";
  } else {
    timeQueryRange =
      "&startDT=" +
      fev.vars.currentEventStartDate_str +
      "&endDT=" +
      fev.vars.currentEventEndDate_str;
  }

  //popup markup with site name number and name - moved into chart title
  //e.layer.bindPopup('<label class="popup-title">Site ' + e.layer.data.siteCode + '</br>' + e.layer.data.siteName + '</span></label></br><p id="graphLoadMessage"><span><i class="fa fa-lg fa-cog fa-spin fa-fw"></i> NWIS data graph loading...</span></p><div id="graphContainer" style="width:100%; height:200px;display:none;"></div> <a target="_blank" href="https://nwis.waterdata.usgs.gov/nwis/uv?site_no=' + e.layer.data.siteCode + '">NWIS data page for site ' + e.layer.data.siteCode + ' <i class="fa fa-external-link" aria-hidden="true"></i></a><div id="noDataMessage" style="width:100%;display:none;"><b><span>NWIS water level data not available to graph</span></b></div>', {minWidth: 350}).openPopup();
  e.layer
    .bindPopup(
      '<label class="popup-title">NWIS Site ' +
        e.layer.data.siteCode +
        "</br>" +
        e.layer.data.siteName +
        '</span></label></br><p id="graphLoadMessage"><span><i class="fa fa-lg fa-cog fa-spin fa-fw"></i> NWIS data graph loading...</span></p><div id="graphContainer" style="width:100%; height:200px;display:none;"></div> <div>Gage Height data courtesy of the U.S. Geological Survey</div><a class="nwis-link" target="_blank" href="https://nwis.waterdata.usgs.gov/nwis/uv?site_no=' +
        e.layer.data.siteCode +
        '"><b>Site ' +
        e.layer.data.siteCode +
        ' on NWISWeb <i class="fa fa-external-link" aria-hidden="true"></i></b></a><div id="noDataMessage" style="width:100%;display:none;"><b><span>NWIS water level data not available to graph</span></b></div>',
      { minWidth: 350 }
    )
    .openPopup();

  $.getJSON(
    "https://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=" +
      e.layer.data.siteCode +
      "&parameterCd=" +
      parameterCodeList +
      timeQueryRange,
    function (data) {
      //if (data.data[0].time_series_data.length <= 0) console.log("No NWIS graph data available for this time period");

      if (data.data == undefined) {
        console.log("No NWIS data available for this time period");
        $("#graphLoadMessage").hide();
        $("#noDataMessage").show();
        //if no time series data, display data NA message
        //if (data.data[0].time_series_data.length <= 0 ){}
      } else {
        var data;
        if (data.data.length == 2) {
          data = data.data[1].time_series_data;
        } else {
          data = data.data[0].time_series_data;
        }

        var newList = [];
        var sum = 0;

        data.forEach(function (item, idx) {
          //sum is the cumulative count of the value (second element of [time,data] item)
          sum = sum + item[1];
          //push new item with the original date, and latest sum value
          newList.push([item[0], sum]);
        });

        //if there is some data, show the div
        $("#graphLoadMessage").hide();
        $(".popup-title").hide();
        $("#graphContainer").show();

        //create chart
        Highcharts.setOptions({ global: { useUTC: false } });
        $("#graphContainer").highcharts({
          chart: {
            type: "line",
          },
          title: {
            text:
              "NWIS Site " +
              e.layer.data.siteCode +
              "<br> " +
              e.layer.data.siteName,
            align: "left",
            style: {
              color: "rgba(0,0,0,0.6)",
              fontSize: "small",
              fontWeight: "bold",
              fontFamily: "Open Sans, sans-serif",
            },
            //text: null
          },
          exporting: {
            filename: "FEV_NWIS_Station" + e.layer.data.siteCode,
          },
          credits: {
            enabled: false,
          },
          xAxis: {
            type: "datetime",
            labels: {
              formatter: function () {
                return Highcharts.dateFormat("%d %b %y", this.value);
              },
              //rotation: -90,
              align: "center",
            },
          },
          yAxis: {
            title: { text: "Precipitation total, inches" },
          },
          tooltip: {
            formatter: function () {
              return (
                "Precipitation total: " +
                Highcharts.numberFormat(this.y, 2, ".") +
                " inches"
              );
            },
          },
          series: [
            {
              turboThreshold: 3000,
              showInLegend: false,
              data: newList,
              /* tooltip: {
                    pointFormat: "precip height: {point.y} inches"
                    } */
            },
          ],
        });
      }
    }
  );
}

// function retrieveSTNSiteData(siteID) {
//     var url = 'https://stn.wim.usgs.gov/STNServices/Sites/' + siteID + '.json';
//     $.ajax({
//         url: url,
//         dataType: 'json',
//         headers: { 'Accept': '*/*' },
//         success: function (data) {
//            return data;
//         },
//         error: function (error) {
//             console.log('Error processing the JSON. The error is:' + error);
//             return error;
//         }
//     });
// }

// function retrieveSTNInstrumentData(instrumentID) {
//     var url = 'https://stn.wim.usgs.gov/STNServices/Instruments/' + instrumentID + '.json';
//     $.ajax({
//         url: url,
//         dataType: 'json',
//         headers: { 'Accept': '*/*' },
//         success: function (data) {
//            return data;
//         },
//         error: function (error) {
//             console.log('Error processing the JSON. The error is:' + error);
//             return error;
//         }
//     });
// }

//out of use
// function getLayerName(type) {
//     switch(type) {
//         case "baro": return "Barometric Pressure Sensor";
//         case "stormTide": return "Storm Tide Sensor";
//         case "met" : return "Meteorological Sensor";
//         case 'waveHeight': return "Wave Height Sensor";
//         case "rdg" : return "Rapid Deployment Gage";
//         case "hwm": return  "High Water Mark";
//         case "peak": return  "Peak Summary";
//     }
// }
