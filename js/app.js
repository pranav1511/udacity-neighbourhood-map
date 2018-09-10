const InitialPlaces = [
    {
        "name": "Koramangala Social",
        "position": { "lat": 12.935742, "lng": 77.614095 },
        "foursquare_id": "57fe668e498ea64ba5a539e4"
    },
    {
        "name": "Gilly's Rest-O-Bar",
        "position": { "lat": 12.933205, "lng": 77.614752 },
        "foursquare_id": "53a5aa42498e7989b0b0bb3d"
    },
    {
        "name": "House of Commons",
        "position": { "lat": 12.935167, "lng": 77.616183 },
        "foursquare_id": "579e125f498e975fa8ccc70a"
    },
    {
        "name": "Fenny's Lounge & Kitchen",
        "position": { "lat": 12.935421, "lng": 77.613518 },
        "foursquare_id": "512dd16dd86cdfb81d74a7fc"
    },
    {
        "name": "Elongo's",
        "position": { "lat": 12.936623, "lng": 77.615018 },
        "foursquare_id": "4ee5beb6f790897ed19e4208"
    }
];


const Place = function (data) {
    this.name = ko.observable(data.name);
    this.position = ko.observable(data.position);
    this.foursquare_id = ko.observable(data.foursquare_id);
}


var initMap = function () {

    const ViewModel = function () {
        const self = this;

        this.filter = ko.observable();
        this.placeList = ko.observableArray([]);

        InitialPlaces.forEach(function (initialPlace) {
            const place = new Place(initialPlace);
            self.placeList.push(place);
        });

        this.filteredPlaceList = ko.computed(function () {
            if (!self.filter()) {
                return self.placeList();
            }
            else {
                return ko.utils.arrayFilter(self.placeList(), function (item) {
                    return item.name().toLowerCase().startsWith(self.filter());
                });
            }
        });
    };

    ko.applyBindings(new ViewModel());
}