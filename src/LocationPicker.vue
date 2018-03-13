<template>
  <div class="LocationPicker" v-if="isOpen">
    <div class="LocationPicker__map" ref="map"/>
    <input type="text" class="LocationPicker__autocomplete" ref="input"/>
    <info-window class="LocationPicker__info-window" ref="info"/>
  </div>
</template>

<script>
  import InfoWindow from './InfoWindow.vue';

  export default {
    props: ['value', 'config', 'options', 'isOpen'],

    data() {
      return {
        geocoder: null,
        map: null,
        marker: null,
        infoWindow: null,
        autocomplete: null,
        input: ''
      };
    },

    components: { InfoWindow },

    mounted() {
      if (typeof google !== 'undefined') this.bootstrap(this.options);
      else this.importGoogle();
    },

    methods: {
      importGoogle() {
        if (!this.config.key) {
          console.error('[Vue Location Picker warn]: You should give a Google Maps API key');
          return;
        }

        this.config.libraries = 'places';
        this.config.callback = 'initLocationPicker';

        // set the callback function
        global.initLocationPicker = () => this.bootstrap(this.options);

        // construct the url
        const apiUrl = 'https://maps.googleapis.com/maps/api/js';
        const params = Object.keys(this.config).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.config[key])}`);
        const url = `${apiUrl}?${params.join('&')}`;

        // create and append the script to body
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      },

      bootstrap(options = {}) {
        this.geocoder = new google.maps.Geocoder();

        this.map = new google.maps.Map(this.$refs.map, Object.assign({
          center: { lat: this.value.latitude || 0, lng: this.value.longitude || 0 },
          zoom: 6
        }, options.map));

        this.marker = new google.maps.Marker(Object.assign({
          map: this.map,
          position: this.map.getCenter(),
          draggable: true
        }, options.marker));

        this.infoWindow = new google.maps.InfoWindow(Object.assign({ content: this.$refs.info.$el }, options.infoWindow));

        this.autocomplete = new google.maps.places.Autocomplete(this.$refs.input, Object.assign({ types: ['geocode'] }, options.autocomplete));
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.$refs.input);

        google.maps.event.addListenerOnce(this.map, 'idle', this.openInfoWindow);
        this.marker.addListener('dragstart', this.closeInfoWindow);
        this.marker.addListener('dragend', this.geocodeLocation);
        this.autocomplete.addListener('place_changed', this.moveMarker);

        this.syncAddress();
      },

      openInfoWindow() {
        this.infoWindow.open(this.map, this.marker);
      },

      closeInfoWindow() {
        this.infoWindow.close();
      },

      geocodeLocation(e) {
        this.map.panTo(e.latLng);

        this.geocoder.geocode({ latLng: e.latLng }, (response) => {
          if (response && response.length > 0) this.goTo(response[0]);
          else {
            this.goTo(null);
            this.$refs.info.showError();
          }

          this.openInfoWindow();
        });
      },

      moveMarker() {
        const place = this.autocomplete.getPlace();
        const location = place.geometry && place.geometry.location;
        if (location) this.goTo(place);
      },

      syncAddress() {
        if (!this.value || !this.value.address);
        this.geocoder.geocode({ latLng: { lng: this.value.longitude, lat: this.value.latitude } }, (response) => {
          if (response && response.length > 0) this.goTo(response[0]);
          else {
            this.goTo(null);
            if (this.$refs.info) this.$refs.info.showError();
          }

          this.openInfoWindow();
        });
      },

      goTo(location) {
        if (!location) {
          this.$emit('input', {
            address: null,
            longitude: null,
            latitude: null
          });
        }
        else {
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
      value(newV, oldV) {
        if (this.isOpen && newV !== oldV) this.syncAddress();
      },
      isOpen() {
        if (this.isOpen) this.syncAddress();
      }
    }
  };
</script>


<style>
  .LocationPicker,
  .LocationPicker__map {
    height: 100%;
  }

  .LocationPicker__autocomplete {
    padding: 7px 14px;
    margin: 10px;
    width: 30%;
    min-width: 300px;
    font-family: Roboto;
    font-size: 15px;
    font-weight: 300;
    text-overflow: ellipsis;
    border: 0;
    border-radius: 2px 0 0 2px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, .3);
  }

  .LocationPicker > .LocationPicker__autocomplete,
  .LocationPicker > .LocationPicker__info-window {
    display: none;
  }
</style>
