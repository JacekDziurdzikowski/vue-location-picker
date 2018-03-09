<template>
  <section style="height: 100vh;">
    <location-picker v-model="place" :config="config" :options="options"/>
  </section>
</template>

<script>
  import LocationPicker from '../';

  export default {
    components: { LocationPicker },
    data () {
      return {
        place: null,
        config: { key: 'AIzaSyCmh0oOwBomDqOOXcJnCBNoiRVeqDwysn0' },
        options: {
          map: {
            center: { lat: 39.3622, lng: 22.9422 },
            zoom: 7,
            minZoom: 3
          },
          infoWindow: { maxWidth: 230 }
        }
      }
    }
  }
</script>

<style src="../dist/vue-location-picker.css"></style>
