var initMap = function() {
    
    const ViewModel = function () {
        const self = this;
        console.log("ViewModel initialized");

    };

    ko.applyBindings(new ViewModel());
}