
// lng => Longitude => x
// lat => Latitude => y

var DM_Model = function (lngLatList) {
    this._lnglats = lngLatList
};

DM_Model.prototype.getLngLats = function () {
    return this._lnglats
};

DM_Model.prototype.getLngLatAt = function (index) {
    return this._lnglats[index]
};

DM_Model.prototype.getLength = function () {
    return this._lnglats.length
};

DM_Model.prototype.getDirection = function (index) {
    // The angel between the due north and the direction of movement

    // If the object is moving straight to north, the returned value is 0.
    // If moving towards south, the returned value is 180.

    // FIXME: deal with staying on the same point
    if (index === 0) {
        throw "NoDirectionForFirstElement"
    } else {
        var a = this.getLngLatAt(index - 1),
            b = this.getLngLatAt(index),
            angleDegE = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;

        // angleDegEast starts from east, and I need to make the result to starts from north
        // atan2 is anticlockwise, so I also need to reverse it
        return ( - angleDegE + 90 + 360) % 360
    }
};


// -----------------------------------------------------------------------------------------------------------------

var DM_View = function (model, element) {
    this._model = model;
    this._elem = element;
    this.state = {
        current: 0
    };

    this._zoomLevel = 16;

    this._cache = {}
};

DM_View.prototype.getPolyline = function (options) {
    var latlngs = _.map(this._model.getLngLats(), function (p) {
        return [p[1], p[0]]
    });

    return L.polyline(latlngs, options)
};

DM_View.prototype.init = function (options) {
    L.mapbox.accessToken = 'pk.eyJ1IjoiaGFuZmVpc3VuIiwiYSI6IngxeTR3aDAifQ.JVqDW0a7P5fgFHknSX3nOg';



    this._map = L.mapbox.map(this._elem, 'mapbox.high-contrast').setView(this._model.getLngLatAt(0), this._zoomLevel);
    this.getPolyline().addTo(this._map);

};

DM_View.prototype.destroy = function () {
    if (this._interval) {
        clearInterval(this._interval)
    }
    this._map.remove()
};


DM_View.prototype.update = function () {
    // This method should not be called explictly
    // The right way to update the view is using `setState` method
    var current = this.state.current,
        lnglat = this._model.getLngLatAt(current),
        latlng = [lnglat[1], lnglat[0]],
        direction = this._model.getDirection(current);


    if (!this._cache.marker) {
        this._cache.marker = L.circle(latlng, 20).addTo(this._map)
    } else {
        this._cache.marker.setLatLng(latlng)
    }

    this._map.setView(latlng, this._zoomLevel);
    this._elem.style.transform = "rotate(-" + direction + "deg)";

};


DM_View.prototype.tickInit = function () {
    var self = this;
    self._interval = setInterval(function () {

        if (self.state.current < self._model.getLength()) {
            self.setState({current: self.state.current + 1})
        }
    }, 33)
};


DM_View.prototype.setState = function (state) {
    this.state = state;
    this.update();
};



