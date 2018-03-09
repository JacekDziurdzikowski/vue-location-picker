/*!
 * vue-location-picker v1.0.1
 * (c) 2016-present Pantelis Peslis <pespantelis@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var InfoWindow = {
  render: function render() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c('div', [_c('strong', [_vm._v(_vm._s(_vm.title))]), _vm._v(" "), _vm._l(_vm.body, function (item) {
      return _c('p', [_vm._v(_vm._s(item))]);
    })], 2);
  },
  staticRenderFns: [],
  _scopeId: 'data-v-3dd7c812',
  data: function data() {
    return {
      title: 'Instructions',
      body: ['Click and drag this marker to pick your location.']
    };
  },
  methods: {
    showAddress: function showAddress(place) {
      this.title = 'My address';
      this.body = place.formatted_address.split(',').map(function (item) {
        return item.trim();
      });
    },
    showError: function showError() {
      this.title = 'Oups';
      this.body = ['Google Maps could not determine the approximate postal address of this location.'];
    }
  }
};

module.exports = function (app, config, options) {
  if (!config.key) {
    console.error('[Vue Location Picker warn]: You should give a Google Maps API key');
    return;
  }

  config.libraries = 'places';
  config.callback = 'initLocationPicker'; // set the callback function

  global.initLocationPicker = function () {
    app.$broadcast('location-picker-init', options || {});
  }; // construct the url


  var apiUrl = 'https://maps.googleapis.com/maps/api/js';
  var params = Object.keys(config).map(function (key) {
    return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(config[key]));
  });
  var url = "".concat(apiUrl, "?").concat(params.join('&')); // create and append the script to body

  var script = document.createElement('script');
  script.src = url;
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
};

var LocationPicker = {
  render: function render() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c('div', {
      staticClass: "LocationPicker"
    }, [_c('div', {
      ref: "map",
      staticClass: "LocationPicker__map"
    }), _vm._v(" "), _c('input', {
      ref: "input",
      staticClass: "LocationPicker__autocomplete",
      attrs: {
        "type": "text"
      }
    }), _vm._v(" "), _c('info-window', {
      ref: "info",
      staticClass: "LocationPicker__info-window"
    })], 1);
  },
  staticRenderFns: [],
  _scopeId: 'data-v-9fada148',
  props: ['value', 'config', 'options'],
  data: function data() {
    return {
      geocoder: null,
      map: null,
      marker: null,
      infoWindow: null,
      autocomplete: null
    };
  },
  components: {
    InfoWindow: InfoWindow
  },
  mounted: function mounted() {
    var _this = this;

    if (!this.config.key) {
      console.error('[Vue Location Picker warn]: You should give a Google Maps API key');
      return;
    }

    this.config.libraries = 'places';
    this.config.callback = 'initLocationPicker'; // set the callback function

    global.initLocationPicker = function () {
      _this.bootstrap(_this.options || {});
    }; // construct the url


    var apiUrl = 'https://maps.googleapis.com/maps/api/js';
    var params = Object.keys(this.config).map(function (key) {
      return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(_this.config[key]));
    });
    var url = "".concat(apiUrl, "?").concat(params.join('&')); // create and append the script to body

    var script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  },
  methods: {
    bootstrap: function bootstrap() {
      this.geocoder = new google.maps.Geocoder();
      this.map = new google.maps.Map(this.$refs.map, Object.assign({
        center: {
          lat: 0,
          lng: 0
        },
        zoom: 3,
        disableDefaultUI: true
      }, options.map));
      this.marker = new google.maps.Marker(Object.assign({
        map: this.map,
        position: this.map.getCenter(),
        draggable: true
      }, options.marker));
      this.infoWindow = new google.maps.InfoWindow(Object.assign({
        content: this.$refs.info.$el
      }, options.infoWindow));
      this.autocomplete = new google.maps.places.Autocomplete(this.$refs.input, Object.assign({
        types: ['geocode']
      }, options.autocomplete));
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.$refs.input); // events

      google.maps.event.addListenerOnce(this.map, 'idle', this.openInfoWindow);
      this.marker.addListener('dragstart', this.closeInfoWindow);
      this.marker.addListener('dragend', this.geocodeLocation);
      this.autocomplete.addListener('place_changed', this.moveMarker);
    },
    openInfoWindow: function openInfoWindow() {
      this.infoWindow.open(this.map, this.marker);
    },
    closeInfoWindow: function closeInfoWindow() {
      this.infoWindow.close();
    },
    geocodeLocation: function geocodeLocation(e) {
      var _this2 = this;

      this.map.panTo(e.latLng);
      this.$els.input.value = '';
      this.geocoder.geocode({
        'latLng': e.latLng
      }, function (response) {
        if (response && response.length > 0) {
          _this2.place = response[0];

          _this2.$refs.info.showAddress(_this2.place);
        } else {
          _this2.place = null;

          _this2.$refs.info.showError();
        }

        _this2.openInfoWindow();
      });
    },
    moveMarker: function moveMarker() {
      var place = this.autocomplete.getPlace();
      var location = place.geometry && place.geometry.location;

      if (location) {
        this.place = place;
        this.map.panTo(location);
        this.marker.setPosition(location);
        this.$refs.info.showAddress(place);
      }
    }
  }
};

module.exports = LocationPicker;
