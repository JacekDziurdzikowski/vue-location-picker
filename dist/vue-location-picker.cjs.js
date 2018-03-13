/*!
 * vue-location-picker v1.0.1
 * (c) 2018-present Pantelis Peslis <pespantelis@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var InfoWindow = {
  render: function render() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c('div', _vm._l(_vm.body, function (item) {
      return _c('p', [_vm._v(_vm._s(item))]);
    }));
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
      this.body = place.formatted_address.split(',').map(function (item) {
        return item.trim();
      });
    },
    showError: function showError() {
      this.body = ['Google Maps could not determine the approximate postal address of this location.'];
    }
  }
};

var LocationPicker = {
  render: function render() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _vm.isOpen ? _c('div', {
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
    })], 1) : _vm._e();
  },
  staticRenderFns: [],
  props: ['value', 'config', 'options', 'isOpen'],
  data: function data() {
    return {
      geocoder: null,
      map: null,
      marker: null,
      infoWindow: null,
      autocomplete: null,
      input: ''
    };
  },
  components: {
    InfoWindow: InfoWindow
  },
  mounted: function mounted() {
    if (typeof google !== 'undefined') this.bootstrap(this.options);else this.importGoogle();
  },
  methods: {
    importGoogle: function importGoogle() {
      var _this = this;

      if (!this.config.key) {
        console.error('[Vue Location Picker warn]: You should give a Google Maps API key');
        return;
      }

      this.config.libraries = 'places';
      this.config.callback = 'initLocationPicker'; // set the callback function

      global.initLocationPicker = function () {
        return _this.bootstrap(_this.options);
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
    bootstrap: function bootstrap() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.geocoder = new google.maps.Geocoder();
      this.map = new google.maps.Map(this.$refs.map, Object.assign({
        center: {
          lat: this.value.latitude || 0,
          lng: this.value.longitude || 0
        },
        zoom: 6
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
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.$refs.input);
      google.maps.event.addListenerOnce(this.map, 'idle', this.openInfoWindow);
      this.marker.addListener('dragstart', this.closeInfoWindow);
      this.marker.addListener('dragend', this.geocodeLocation);
      this.autocomplete.addListener('place_changed', this.moveMarker);
      this.syncAddress();
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
      console.log(e.latLng);
      this.geocoder.geocode({
        latLng: e.latLng
      }, function (response) {
        if (response && response.length > 0) _this2.goTo(response[0]);else {
          _this2.goTo(null);

          if (_this2.$refs.info) _this2.$refs.info.showError();
        }

        _this2.openInfoWindow();
      });
    },
    moveMarker: function moveMarker() {
      var place = this.autocomplete.getPlace();
      var location = place.geometry && place.geometry.location;
      if (location) this.goTo(place);
    },
    syncAddress: function syncAddress() {
      var _this3 = this;

      if (!this.value || !this.value.longitude || !this.value.latitude) return;
      this.geocoder.geocode({
        latLng: {
          lat: this.value.latitude || 0,
          lng: this.value.longitude || 0
        }
      }, function (response) {
        if (response && response.length > 0) _this3.goTo(response[0]);else {
          _this3.goTo(null);

          if (_this3.$refs.info) _this3.$refs.info.showError();
        }

        _this3.openInfoWindow();
      });
    },
    goTo: function goTo(location) {
      if (!location) {
        this.$emit('input', {
          address: null,
          longitude: null,
          latitude: null
        });
      } else {
        this.$emit('input', {
          address: location.formatted_address,
          longitude: location.geometry.location.lng(),
          latitude: location.geometry.location.lat()
        });
        if (this.$refs.info) this.$refs.info.showAddress(location);
        this.map.panTo(location.geometry.location);
        this.marker.setPosition(location.geometry.location);
      }
    }
  },
  watch: {
    isOpen: function isOpen() {
      if (this.isOpen) this.syncAddress();
    }
  }
};

module.exports = LocationPicker;
