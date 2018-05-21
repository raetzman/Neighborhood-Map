
var initialPlaces = [
    { name: 'Cafe Kraft', position: { lat: 48.719280, lng: 9.128380 } },
    { name: 'Schwoabetöpfle', position: { lat: 48.717440, lng: 9.144160 } },
    { name: 'Bella Napoli Feuerbach', position: { lat: 48.810060, lng: 9.163198 } }
];

var octopus = function () {
    var self = this;
    self.placeList = ko.observableArray([]);
    self.query = ko.observable('');

    initialPlaces.forEach(function (placeLocation) {
        self.placeList.push(placeLocation);
    });
    self.mapmarkers=[];
    self.currentData;
    // This function will loop through the markers array and display them all
    // if they are not there yet.
    self.showListings = function () {


        var markers = self.currentData;// self.placeList().filter(place => place.name.toLowerCase().indexOf(self.query().toLowerCase()) > -1);;
        
        
        
        markers.forEach(candidate => {
            
            if (!candidate.marker) {
                // Extend the boundaries of the map for each marker and display the marker
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < markers.length; i++) {

                    var marker = new google.maps.Marker({
                        position: markers[i].position,
                        title: markers[i].name,
                        animation: google.maps.Animation.DROP,
                        id: i + 1
                    });
                    candidate.marker = marker;
                    mapmarkers.push(candidate);
                    marker.setMap(map);
                    marker.addListener('click', function () {
                        populateInfoWindow(this, new google.maps.InfoWindow());
                    });
                    bounds.extend(markers[i].position);
                }
                map.fitBounds(bounds);
            }
                
            
            
                
            
        });
        
    }
    // everytime query/placeList changes, this gets computed again
    self.filteredPlaces = ko.computed(function () {
        self.currentData = self.placeList().filter(place => place.name.toLowerCase().indexOf(self.query().toLowerCase()) > -1);
        self.showListings();
        return currentData;
    });
}


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.    
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' +
                    '<div>No Street View Found</div>');
            }
        }
        console.log(infowindow);
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}