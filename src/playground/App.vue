<template>
  <div class="main-wrapper">
    <div class="menu">
      <router-link to="/">Home</router-link>
      <router-link to="/grid-layer">GridLayer</router-link>
      <router-link to="/feature-group">Feature Group</router-link>
      <router-link to="/circle">Circle</router-link>
      <router-link to="/circle-marker">CircleMarker</router-link>
      <router-link to="/control-attribution">Attribution</router-link>
      <router-link to="/control-custom-message">Custom Message</router-link>
      <router-link to="/control-layers">Layers</router-link>
      <router-link to="/control-scale">Scale</router-link>
      <router-link to="/control-zoom">Zoom</router-link>
      <router-link to="/geo-json">GeoJSON</router-link>
      <router-link to="/icon">Icon</router-link>
      <router-link to="/marker">Marker</router-link>
      <router-link to="/polygon">Polygon</router-link>
      <router-link to="/polyline">Polyline</router-link>
      <router-link to="/popups">Popups</router-link>
      <router-link to="/rectangle">Rectangle</router-link>
      <router-link to="/tooltips">Tooltips</router-link>
    </div>
    <div class="map-wrapper">
      <router-view />
    </div>
  </div>
</template>
<script>
export default {
  components: {},
};
</script>

<style scoped>
.main-wrapper {
  display: flex;
}
.menu {
  display: flex;
  flex-direction: column;
}

.menu a {
  padding: 0.25rem 0.5rem;
  text-decoration: none;
  font-family: Arial, Helvetica, sans-serif;
}

.menu .router-link-exact-active {
  background-color: lightgray;
}
.map-wrapper {
  height: 75vh;
  width: 100%;
}
</style>
