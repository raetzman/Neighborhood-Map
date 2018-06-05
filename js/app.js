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

    var bounds = new google.maps.LatLngBounds();
    
    initialPlaces.forEach(function (placeLocation) {
        var venue = "";

        var marker = new google.maps.Marker({
            position: placeLocation.position,
            title: placeLocation.name,
            animation: google.maps.Animation.DROP,
            comment: placeLocation.comment,
            //icon: icon // the world is not ready for cat
            id: placeLocation.id
        });
        var url = 'https://api.foursquare.com/v2/venues/' + placeLocation.id + '?client_id=' + FOURSQRE_CLIENT_ID + '&client_secret=' + FOURSQRE_CLIENT_SECRET + '&v=20180504';
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            async: true,
            success: function (data) {
                marker.venue = data.response.venue;
            },
            error: function (data) {
                console.log(data);
                marker.venue = undefined;
            }
        });
        placeLocation.marker = marker;
        marker.placeLocation = placeLocation;
        marker.setMap(map);

        marker.addListener('click', function () {

            populateInfoWindow(marker, largeInfowindow);
        });

        markers.push(marker);

        bounds.extend(placeLocation.position);

    });


    map.fitBounds(bounds);

    ko.applyBindings(octopus);
}



var octopus = function () {
    var self = this;
    self.placeList = ko.observableArray();
    self.query = ko.observable('');

    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        self.placeList.push(marker);

    }
    // everytime query/placeList changes, this gets computed again
    self.filterPlaces = function () {
        console.log("Hallo");
        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];

            if (marker.title.toLowerCase().indexOf(self.query().toLowerCase()) > -1) {
                if (self.placeList.indexOf(marker) < 0) {
                    self.placeList.push(marker);
                    marker.setMap(map);
                }
            } else {
                marker.setMap(null);
                self.placeList.remove(marker);
            }
        }
    };

    self.showInfoWindow = function (data, event) {
        populateInfoWindow(data, largeInfowindow);
    };

    self.doFourSqareLate = function () {
        console.log("go");
        self.markers.forEach(function (marker) {

            var url = 'https://api.foursquare.com/v2/venues/' + marker.id + '?client_id=' + FOURSQRE_CLIENT_ID + '&client_secret=' + FOURSQRE_CLIENT_SECRET + '&v=20180504';
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
                    console.log(marker.rating);

                    marker = data.response.venue;
                },
                error: function () {
                    marker = undefined; // "No FourSquare Rating available!";
                },
                async: false
            });

        });
    };
}


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow, rating) {
    // Check to make sure the infowindow is not already opened on this marker.    
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });

        var content_part_1 = "";
        var content_part_url = "";
        var content_part_photo = "";

        console.log(marker.venue);
        if (marker.venue) {
            content_part_1 = '<h1>' + marker.venue.name + '</h1><hr><div>Mauntzi says: ' + marker.comment
                + '</div><hr><div>Rating by Foursqare: ' + marker.venue.rating+ '</div>';

                if (marker.venue.url) {
                    content_part_url = '<hr><a href='+ marker.venue.url + '>' + marker.venue.name + '</a>';
                }
                
                if (marker.venue.bestPhoto) {
                    content_part_photo = '<hr><img alt="Image of the restaurant from Foursquare" height="42" width="42" src="' 
                    + marker.venue.bestPhoto.suffix + marker.venue.bestPhoto.suffix + '">';
                }
            } else {
            content_part_1 = '<h1>' + marker.title + '</h1><hr><div>' + marker.comment + '</div><hr><div>no foursqare-data available</div>';
        }
       

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

                infowindow.setContent(content_part_1 +
                    '<hr><div id="pano"></div>');
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
                infowindow.setContent(content_part_1 + '<hr><div>No Street View Found</div>');
            }
        }

        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        if (marker.position) {
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        } else {
            streetViewService.getPanoramaByLocation(marker.marker.position, radius, getStreetView);
        }


        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);

    }
}