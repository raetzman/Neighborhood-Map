// we need the map, the markers array an the google maps largeInfowindow
var map;
var markers = [];
var largeInfowindow;





var ViewModelOctopus = function () {
    var self = this;
    self.placeList = ko.observableArray();
    self.query = ko.observable('');

    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        self.placeList.push(marker);

    }
    // everytime query/placeList changes, this gets computed again
    self.filterPlaces = function () {

        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            // this is the result--> https://stackoverflow.com/questions/45250518/error-parsing-in-knockout-js
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
}


