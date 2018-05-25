
var initialPlaces = [
    { name: 'Cafe Kraft', position: { lat: 48.719280, lng: 9.128380 }, comment: "a sporty place to go boulder, which also sells coffee", id: '4bcb01643740b71360a36165' },
    { name: 'Schwabengarten', position: { lat: 48.701376, lng: 9.141616 }, comment: "playing Soccer or eat al kinds of swabian delicatess", id: '4bcb01643740b71360a36165' },
    { name: 'Udo Snack', position: { lat: 48.7761642, lng: 9.1740999 }, comment: "traditional street food style burger since 1849", id: '4bab95d1f964a52064b63ae3' },
    { name: 'Fluxus', position: { lat: 48.77543, lng: 9.1728 }, comment: "probably a tax fraud, but nice atmosphere", id: '56bdde5e498e098e1294c594' },
    { name: 'I LOVE SUSHI', position: { lat: 48.7784709, lng: 9.1564214 }, comment: "I know people who love Sushi so much", id: '4b759cd6f964a5203d172ee3' },
    { name: 'Bella Napoli Feuerbach', position: { lat: 48.810060, lng: 9.163198 }, comment: "the italian restaurant to visit in stuttgart", id: '4b842c92f964a520832531e3' }
];
var FOURSQRE_CLIENT_ID = 'QTLWAELP5HATQ5S1P3OSVKXBXLJZ0UCGI1QXFN35GJFUUXLM';
var FOURSQRE_CLIENT_SECRET = 'UAMIKPK3GQO5KXGQBE5YIPKSZAKC5WOZN32WJMUZGYXJGRDU';
var map;
var markers = [];
var largeInfowindow;

// everything is better with cats
//var icon;

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 48.7758459, lng: 9.182932100000016 },
        zoom: 13
    });
    largeInfowindow = new google.maps.InfoWindow();
    ko.applyBindings(octopus);
}



var octopus = function () {
    var self = this;
    self.placeList = ko.observableArray([]);
    self.query = ko.observable('');

    var bounds = new google.maps.LatLngBounds();
    initialPlaces.forEach(function (placeLocation) {

        var marker = new google.maps.Marker({
            position: placeLocation.position,
            title: placeLocation.name,
            animation: google.maps.Animation.DROP,
            comment: placeLocation.comment
            //icon: icon // the world is not ready for cat
        });
        placeLocation.marker = marker;
        marker.placeLocation = placeLocation;
        marker.setMap(map);

        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow, placeLocation.id);
        });

        markers.push(placeLocation);
        self.placeList.push(placeLocation);

        bounds.extend(placeLocation.position);

    });
    map.fitBounds(bounds);
    // everytime query/placeList changes, this gets computed again
    self.filterPlaces = function () {

        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];

            if (marker.name.toLowerCase().indexOf(self.query().toLowerCase()) > -1) {
                if (self.placeList.indexOf(marker) < 0) {
                    self.placeList.push(marker);
                    marker.marker.setMap(map);
                }
            } else {
                marker.marker.setMap(null);
                self.placeList.remove(marker);
            }
        }
    };

    self.showInfoWindow = function (data, event) {
        populateInfoWindow(data.marker, largeInfowindow, data.id);
    }
}


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow, id) {
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
        async function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {


                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                // its undefined, when the following lines are calle, so its never displayed
                var rating = requestFourSquare(id);
                infowindow.setContent('<div><strong>' + marker.title + '</strong></div><hr><div>' + marker.comment +
                    '</div><hr><div></div><hr><div id="pano"></div>');
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

        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);

    }


    function requestFourSquare(id) {
        var url = 'https://api.foursquare.com/v2/venues/' + id + '?client_id=' + FOURSQRE_CLIENT_ID + '&client_secret=' + FOURSQRE_CLIENT_SECRET + '&v=20180504';
        //console.log(url);
        /* only works async*/
        /*
        $.getJSON(url, {}, function (data) {
            innerdoc.getElementById('frsqrerating').value = "FourSquare Rating: " + data.response.venue.rating;
        });
        */
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            success: function (data) { 
                console.log(data.response.venue.rating);

                return "FourSquare Rating: " + data.response.venue.rating;
            },
            error: function(){
                return "No FourSquare Rating available!";
            },
            async: false
        });    
    }
}