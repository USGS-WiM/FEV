$(document).ready(function () {
  document.getElementById("hwmCompare").onclick(createMiniMap());
  function createMiniMap() {
    regionalMap = L.map("regionalMap", {
      maxZoom: 15,
      zoomControl: false,
    }).setView([39.833333, -98.583333], 3);
    L.esri.basemapLayer("Topographic").addTo(regionalMap);
  }
});
