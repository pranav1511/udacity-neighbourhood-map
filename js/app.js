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
    this.photo = ko.observable();
    this.shortURI = ko.observable();
}


const foursquareAPI = {
    "base_uri": "https://api.foursquare.com/v2/",
    "secrets": "client_id=4GBAZD3JKK2CFWLUDCNHSU04GGEJQPRG3XXK2KBVBGO5E22Q"
        + "&client_secret=5WHGV1CI0UEWKUWVVORSBIORFM5WRRGXVDGC2JYRTDJY4L14"
        + "&v=20180323"
};


let map;
let infoWindow;
let bounds;

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

    bounds = new google.maps.LatLngBounds();

    const addInfoWindow = function (place) {
        place.marker().addListener("click", function () {

            content = "";
            content += "<div>";
            content += "<p>" + place.name() + "</p>";
            content += "<div><a target='_blank' href='" + place.shortURI() + "'>More on Foursquare</a></div>";
            content += "<div><img src='" + place.photo() + "'></div><br>";
            content += "<div><img style='width:150px;' src='./images/foursquare.png'></div>";
            content += "</div>";

            infoWindow.setContent(content);
            infoWindow.open(map, place.marker());

            infoWindow.addListener("closeclick", function () {
                infoWindow.setMarker = null;
            });
        });
    }

    const addInfoWindowWithError = function (place) {
        place.marker().addListener("click", function () {

            content = "Foursquare data could not be loaded.";

            infoWindow.setContent(content);
            infoWindow.open(map, place.marker());

            infoWindow.addListener("closeclick", function () {
                infoWindow.setMarker = null;
            });
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
                place.marker().setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    place.marker().setAnimation(null);
                }, 700);
            });

            const requestURI = foursquareAPI.base_uri + "venues/" + initialPlace.foursquare_id + "?" + foursquareAPI.secrets;
            $.getJSON(requestURI, function (response) {
                if (response.meta.code == 200) {
                    place.shortURI(response.response.venue.shortUrl);
                    place.photo(response.response.venue.bestPhoto.prefix + "150x150" + response.response.venue.bestPhoto.suffix);

                    addInfoWindow(place);
                }
                else {
                    addInfoWindowWithError(place);
                }
            }).fail(function () {
                addInfoWindowWithError(place);
            });

            bounds.extend(place.position());
            self.placeList.push(place);
        });

        map.fitBounds(bounds);

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

        this.itemClicked = function (place) {
            google.maps.event.trigger(place.marker(), "click");
        }

    };

    ko.applyBindings(new ViewModel());
}