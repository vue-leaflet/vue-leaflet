<template>
  <div class="main-wrapper">
    <div class="menu">
      <router-link to="/">Home</router-link>
      <router-link to="/marker">Marker</router-link>
      <router-link to="/circle">Circle</router-link>
      <router-link to="/control-scale">Scale</router-link>
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
