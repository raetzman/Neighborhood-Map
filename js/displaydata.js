var initialPlaces = [
    { name: 'Cafe Kraft', location: { lat: 48.719280, lng: 9.128380 } },
    { name: 'Schwoabetöpfle', location: { lat: 48.717440, lng: 9.144160 } },
    { name: 'Bella Napoli Feuerbach', location: { lat: 48.810060, lng: 9.163198 } }
];

var Place = function (data) {
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
};

var octopus = function () {
    var self = this;
    self.placeList = ko.observableArray([]);
    self.query = ko.observable('');

    initialPlaces.forEach(function (placeLocation) {
        self.placeList.push(new Place(placeLocation));
        console.log(placeLocation);
    });

    // everytime query/placeList changes, this gets computed again
    self.filteredPlaces = ko.computed(function () {
        if (!self.query()) {
            return self.placeList();
        } else {
            return self.placeList()
                .filter(place => place.name().toLowerCase().indexOf(self.query().toLowerCase()) > -1);
        }
    });

}



console.log("not yet done");
ko.applyBindings(octopus);
console.log("done");