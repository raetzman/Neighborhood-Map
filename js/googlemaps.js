var defaultIcon, highlightedIcon;


// this is the first funciton to be triggered
function initMap() {
    var min_size = Math.min($(window).width(), $(document).height()) / 3;
    console.log(min_size);
    // Style the markers a bit. This will be our listing marker icon.
    defaultIcon = makeMarkerIcon('FFFFFF');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    highlightedIcon = makeMarkerIcon('888888');
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        // location of stuttgart
        center: { lat: 48.7758459, lng: 9.182932100000016 },
        zoom: 13
    });
    largeInfowindow = new google.maps.InfoWindow({maxWidth: min_size, maxHeight: min_size});

    var bounds = new google.maps.LatLngBounds();

    initialPlaces.forEach(function (placeLocation) {

        var marker = new google.maps.Marker({
            position: placeLocation.position,
            title: placeLocation.name,
            animation: google.maps.Animation.DROP,
            comment: placeLocation.comment,
            icon: defaultIcon,
            id: placeLocation.id
        });
        // getting foursqaure and safe to marker element into venue, will be undefined, after free linit of access will be reached or service not available
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
                marker.venue = undefined;
            }
        });
        placeLocation.marker = marker;
        marker.placeLocation = placeLocation;
        marker.setMap(map);

        marker.addListener('click', function () {
            populateInfoWindow(marker, largeInfowindow);
        });

        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        marker.addListener('mouseover', function () {
            enableHighlight(this);
            //this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function () {
            disableHighlight(this);
            // this.setIcon(defaultIcon);
        });

        markers.push(marker);

        bounds.extend(placeLocation.position);

    });


    map.fitBounds(bounds);

    ko.applyBindings(ViewModelOctopus);
}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // only chance I see is to deactivate all markers, because there is more then one way to get here and close the window again
    for(var i = 0; i < markers.length; i++) {
        markers[i].setAnimation(null);
    }
    // Check to make sure the infowindow is not already opened on this marker.    
    if (infowindow.marker != marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
            marker.setAnimation(null);
        });

        var content_part_1 = "";
        var content_part_url = "";
        var content_part_photo = "";

        if (marker.venue) {
            content_part_1 = '<h1 class="scale_h1">' + marker.venue.name + '</h1><div class="scale">Mauntzi says: ' + marker.comment  + '</div><hr><div>Rating by Foursqare: ' + marker.venue.rating + '</div>';

            if (marker.venue.url) {
                content_part_url = '<hr><a class="scale" href=' + marker.venue.url + '>' + marker.venue.name + '</a>';
            }

            if (marker.venue.bestPhoto) {
                content_part_photo = '<hr><img alt="Image of the restaurant from Foursquare" height="42" width="42" src="' + marker.venue.bestPhoto.suffix + marker.venue.bestPhoto.suffix + '">';
            }
        } else {
            content_part_1 = '<h1 class="scale_h1">' + marker.title + '</h1><div class="scale">' + marker.comment + '</div><hr><div class="scale">no foursqare-data available</div>';
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
                var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);

            } else {
                infowindow.setContent(content_part_1 + '<hr><div class="scale">No Street View Found</div>');
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

function changetoHighlightIcon(marker){
    marker.setIcon(highlightedIcon);
}

function changetoDefaultIcon(marker){
    marker.setIcon(defaultIcon);
}

function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}
// show a decent error message
function myMapsErrorFunction(data){
    console.log(data);
    $("#map")[0].innerHTML = "Google Maps could not be loaded";
}