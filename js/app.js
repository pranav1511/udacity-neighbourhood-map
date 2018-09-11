// Model for the app which will be used to show the markers to the users.
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


// Creating place object
const Place = function (data) {
    this.name = ko.observable(data.name);
    this.position = ko.observable(data.position);
    this.foursquare_id = ko.observable(data.foursquare_id);
    this.marker = ko.observable();
    this.photo = ko.observable();
    this.shortURI = ko.observable();
}


// Foursquare API details
const foursquareAPI = {
    "base_uri": "https://api.foursquare.com/v2/",
    "secrets": "client_id=4GBAZD3JKK2CFWLUDCNHSU04GGEJQPRG3XXK2KBVBGO5E22Q"
        + "&client_secret=5WHGV1CI0UEWKUWVVORSBIORFM5WRRGXVDGC2JYRTDJY4L14"
        + "&v=20180323"
};


let map;
let infoWindow;
let bounds;

// Callback function for Google Maps API
var initMap = function () {
    // Initialize map with a center and zoom
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 48.8676305, lng: 2.349539600000071 },
        zoom: 13,
        clickableIcons: false,
        fullscreenControl: false,
        mapTypeControl: false
    });

    // Initialize info window
    infoWindow = new google.maps.InfoWindow({
        maxWidth: 150
    });

    // Initialize bounds for the map
    bounds = new google.maps.LatLngBounds();

    // Create the info winow for every marker with the content
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

    //Create the info window for every marker with error message
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


    // ViewModel for KnockoutJS
    const ViewModel = function () {
        const self = this;

        this.filter = ko.observable();
        this.sidebar = ko.observable(false);
        this.placeList = ko.observableArray([]);

        // Push the places in placeList
        InitialPlaces.forEach(function (initialPlace) {
            const place = new Place(initialPlace);

            // Initialize marker
            place.marker(new google.maps.Marker({
                position: place.position(),
                map: map,
                visible: false,
                title: place.name(),
                animation: google.maps.Animation.DROP
            }));

            // Add animation to the marker
            place.marker().addListener("click", function () {
                place.marker().setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    place.marker().setAnimation(null);
                }, 700);
            });

            // Foursquare API GET request
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

        // Sort the list in the placeList lexicographically
        this.placeList.sort(function (left, right) {
            return left.name() == right.name() ? 0 : (left.name() < right.name() ? -1 : 1);
        });

        // Filter the placeList
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

        // Show markers for the filteredPlaceList
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

        // Trigger marker click when a list element is clicked
        this.itemClicked = function (place) {
            google.maps.event.trigger(place.marker(), "click");
        }

        // Toggle sidebar view
        this.toggleClicked = function () {
            self.sidebar(!self.sidebar());
        }

        this.toggleSidebar = ko.computed(function () {
            if (self.sidebar()) {
                document.getElementById("sidebar-content").style.width = "200px";
                document.getElementById("main-content").style.marginLeft = "200px";
            }
            else {
                document.getElementById("sidebar-content").style.width = "0";
                document.getElementById("main-content").style.marginLeft = "0";
            }
        });

    };

    // Bind ViewModel to KnockoutJS
    ko.applyBindings(new ViewModel());
}