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
    this.marker = ko.observable();
}

let map;
let infoWindow;

var initMap = function () {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 48.8676305, lng: 2.349539600000071 },
        zoom: 13,
        clickableIcons: false,
        fullscreenControl: false,
        mapTypeControl: false
    });

    infoWindow = new google.maps.InfoWindow({
        maxWidth: 150
    });
    
    const populateInfoWindow = function(marker, place) {
        content = place.name();

        infoWindow.setContent(content);
        infoWindow.open(map, marker);

        infoWindow.addListener("closeclick", function () {
            infoWindow.setMarker = null;
        });
    }


    const ViewModel = function () {
        const self = this;

        this.filter = ko.observable();
        this.placeList = ko.observableArray([]);

        InitialPlaces.forEach(function (initialPlace) {
            const place = new Place(initialPlace);
            place.marker(new google.maps.Marker({
                position: place.position(),
                map: map,
                visible: false,
                title: place.name(),
                animation: google.maps.Animation.DROP
            }));

            place.marker().addListener("click", function () {
                const that = this;
                populateInfoWindow(this, place);
            });


            self.placeList.push(place);
        });

        this.placeList.sort(function (left, right) {
            return left.name() == right.name() ? 0 : (left.name() < right.name() ? -1 : 1);
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

        this.markers = ko.computed(function () {
            self.placeList().forEach(function (place) {
                if (self.filteredPlaceList().indexOf(place) != -1) {
                    place.marker().setVisible(true);
                }
                else {
                    place.marker().setVisible(false);
                }
            });
        });
    };

    ko.applyBindings(new ViewModel());
}