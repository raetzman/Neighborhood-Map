
var initialPlaces = [
    { name: 'Cafe Kraft', position: { lat: 48.719280, lng: 9.128380 }, comment: "a sport place to got boulder, which also sells coffee" },
    { name: 'Schwoabe Töpfle', position: { lat: 48.717440, lng: 9.144160 }, comment: "playing Soccer or eat al kinds of swabian delicatess" },

    { name: 'Udo Snack', position: { lat: 48.7761642, lng: 9.1740999 }, comment: "traditional street food style burger since 1849" },
    { name: 'Fluxus', position: { lat: 48.77543, lng: 9.1728 }, comment: "probably a tax fraud, but nice atmosphere" },
    { name: 'I LOVE SUSHI', position: { lat: 48.7784709, lng: 9.1564214 }, comment: "I know people how love Sushi so much" },

    { name: 'Bella Napoli Feuerbach', position: { lat: 48.810060, lng: 9.163198 }, comment: "the italian restaurant to visit in stuttgart" }
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
    /*
    icon = {
        url: "img/cat.jpg", // url
        scaledSize: new google.maps.Size(50, 50), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };*/
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
            populateInfoWindow(this, largeInfowindow);
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
        populateInfoWindow(data.marker, largeInfowindow);
    }
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


        requestFourSquare(marker);

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
                infowindow.setContent('<div><strong>' + marker.title + '</strong></div><hr><div>' + marker.comment + '</div><hr><div id="pano"></div>');
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

    
    function requestFourSquare(marker) {
        var fsObj = [];
        
        var url = 'https://api.foursquare.com/v2/venues/search?ll=' + marker.placeLocation.position.lat + "," +
        marker.placeLocation.position.lng + '&query=' + marker.title + '&radius=' + 300 + 
        '&intent=browse&client_id=' + FOURSQRE_CLIENT_ID + '&client_secret=' + FOURSQRE_CLIENT_SECRET + '&v=20120609';
        console.log(url);
        $.getJSON(url, {}, function (data) {
            console.log(data);
            venues = data['response']['groups'][0]['items'];
            for (var i = 0; i < venues.length; i++) {
                var fsRes = {
                    'Id': venues[i]['venue']['id'],
                    'Name': venues[i]['venue']['name'],
                    'Latitude': venues[i]['venue']['location']['lat'],
                    'Longitude': venues[i]['venue']['location']['lng'],
                    'Type': type,
                    'Vicinity': venues[i]['venue']['location']['address'],
                    'Reference': "Foursquare"
                };
                fsObj.push(fsRes);
            }
            console.log(fsObj);
        });
    }
}