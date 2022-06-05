/**
 * Created by bdraper on 8/4/2016.
 */
// //displays map scale on map load
// map.on( "load", function() {
//     var mapScale =  scaleLookup(map.getZoom());
//     console.log('Initial Map scale registered as ' + mapScale, map.getZoom());
//
//     var initMapCenter = map.getCenter();
//     $('#latitude').html(initMapCenter.y.toFixed(4));
//     $('#longitude').html(initMapCenter.x.toFixed(4));
// });
//
// //displays map scale on scale change (i.e. zoom level)
// map.on( "zoom-end", function () {
//     var mapZoom = map.getZoom();
//     var mapScale = this.scaleLookup(mapZoom);
//     $('#scale')[0].innerHTML = mapScale;
// });
//
// //updates lat/lng indicator on mouse move. does not apply on devices w/out mouse. removes "map center" label
// map.on( "mouse-move", function (cursorPosition) {
//     $('#mapCenterLabel').css("display", "none");
//     if (cursorPosition.mapPoint !== null) {
//         var geographicMapPt = webMercatorUtils.webMercatorToGeographic(cursorPosition.mapPoint);
//         $('#latitude').html(geographicMapPt.y.toFixed(4));
//         $('#longitude').html(geographicMapPt.x.toFixed(4));
//     }
// });
// //updates lat/lng indicator to map center after pan and shows "map center" label.
// on(map, "pan-end", function () {
//     //displays latitude and longitude of map center
//     $('#mapCenterLabel').css("display", "inline");
//     var geographicMapCenter = webMercatorUtils.webMercatorToGeographic(map.extent.getCenter());
//     $('#latitude').html(geographicMapCenter.y.toFixed(4));
//     $('#longitude').html(geographicMapCenter.x.toFixed(4));
// });
//
//
// function scaleLookup(mapZoom) {
//     switch (mapZoom) {
//         case 19: return '1,128';
//         case 18: return '2,256';
//         case 17: return '4,513';
//         case 16: return '9,027';
//         case 15: return '18,055';
//         case 14: return '36,111';
//         case 13: return '72,223';
//         case 12: return '144,447';
//         case 11: return '288,895';
//         case 10: return '577,790';
//         case 9: return '1,155,581';
//         case 8: return '2,311,162';
//         case 7: return '4,622,324';
//         case 6: return '9,244,649';
//         case 5: return '18,489,298';
//         case 4: return '36,978,596';
//         case 3: return '73,957,193';
//         case 2: return '147,914,387';
//         case 1: return '295,828,775';
//         case 0: return '591,657,550';
//     }
// }
