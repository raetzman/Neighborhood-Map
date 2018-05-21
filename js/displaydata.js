
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
    
    self.currentData;
    // This function will loop through the markers array and display them all.
    self.showListings = function () {
        //var bounds = new google.maps.LatLngBounds();

        var markers = self.currentData;// self.placeList().filter(place => place.name.toLowerCase().indexOf(self.query().toLowerCase()) > -1);;

        // Extend the boundaries of the map for each marker and display the marker
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {

            var marker = new google.maps.Marker({
                position: markers[i].position,
                title: "test",// + markers[i].name,
                animation: google.maps.Animation.DROP,
                id: i + 1
            });
            marker.setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }
    // everytime query/placeList changes, this gets computed again
    self.filteredPlaces = ko.computed(function () {
        self.currentData = self.placeList().filter(place => place.name.toLowerCase().indexOf(self.query().toLowerCase()) > -1);
        self.showListings();
        return currentData;
    });
}