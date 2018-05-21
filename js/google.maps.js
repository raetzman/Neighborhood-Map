var map;
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 48.7758459, lng: 9.182932100000016 },
    zoom: 13
  });

  console.log("not yet done");
  ko.applyBindings(octopus);
  console.log("done");
}



