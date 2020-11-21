<template>
  <div style="display: flex;">
    <div style="height: 75vh; width: 50vw;">
      <l-map
        ref="map"
        v-model="zoom"
        v-model:zoom="zoom"
        :center="[47.41322, -1.219482]"
        @move="log('move')"
        @ready="onMapReady"
      >
        <l-tile-layer
          url="http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
          layer-type="base"
          name="Stamen Watercolor"
          attribution="Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>."
        />
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>

        <l-control-layers />

        <l-control-zoom
          position="bottomright"
          zoom-in-text="*"
          zoom-out-text="/"
        />
        <l-control-attribution
          position="topleft"
          :prefix="customAttributionPrefix"
        />
        <l-control-scale position="bottomleft" />

        <l-control class="leaflet-control leaflet-demo-control"
          >Hello, Map!</l-control
        >

        <l-marker :lat-lng="[0, 0]" draggable @moveend="log('moveend')">
          <l-tooltip>
            lol
          </l-tooltip>
        </l-marker>

        <l-layer-group>
          <l-marker :lat-lng="[0, 0]" draggable @moveend="log('moveend')">
            <l-tooltip>
              lol
            </l-tooltip>
          </l-marker>

          <l-marker :lat-lng="[47.41322, -1.219482]">
            <l-icon :icon-url="iconUrl" :icon-size="iconSize" />
          </l-marker>
        </l-layer-group>

        <l-marker :lat-lng="[50, 50]" draggable @moveend="log('moveend')">
          <l-popup>
            lol
          </l-popup>
        </l-marker>

        <l-polyline
          :lat-lngs="[
            [47.334852, -1.509485],
            [47.342596, -1.328731],
            [47.241487, -1.190568],
            [47.234787, -1.358337],
          ]"
          color="green"
        />

        <l-polygon
          :lat-lngs="[
            [46.334852, -1.509485],
            [46.342596, -1.328731],
            [46.241487, -1.190568],
            [46.234787, -1.358337],
          ]"
          color="#41b782"
          :fill="true"
          :fillOpacity="0.5"
          fillColor="#41b782"
        />
        <l-rectangle
          :lat-lngs="[
            [46.334852, -1.509485],
            [46.342596, -1.328731],
            [46.241487, -1.190568],
            [46.234787, -1.358337],
          ]"
          :fill="true"
          color="#35495d"
        />
        <l-rectangle
          :bounds="[
            [46.334852, -1.190568],
            [46.241487, -1.090357],
          ]"
        >
          <l-popup>
            lol
          </l-popup>
        </l-rectangle>

        <l-polyline
          :lat-lngs="[
            [47.334852, -1.509485],
            [47.342596, -1.328731],
            [47.241487, -1.190568],
            [47.234787, -1.358337],
          ]"
          color="green"
        ></l-polyline>
        <l-circle-marker :lat-lng="[35.865, 12.865]" :radius="10" />

        <l-circle :lat-lng="[35.865, 12.865]" :radius="10000" color="green" />
        <l-geo-json :geojson="geojson"></l-geo-json>
      </l-map>
      <button @click="changeIcon">New kitten icon</button>
      <label for="attributionPrefix">Attribution prefix:</label>
      <input name="attributionPrefix" v-model="customAttributionPrefix" />
    </div>
    <div style="height: 75vh; width: 50vw;">
      <l-map
        v-model="zoom"
        v-model:zoom="zoom"
        :center="[47.41322, -1.219482]"
        @move="log('move')"
      >
        <l-wms-tile-layer
          v-for="layer in wmsLayers"
          :key="layer.name"
          :base-url="baseUrl"
          :layers="layer.layers"
          :visible="layer.visible"
          :format="layer.format"
          :transparent="layer.transparent"
          :name="layer.name"
          layer-type="base"
        ></l-wms-tile-layer>
      </l-map>
    </div>
  </div>
</template>
<script>
import {
  LMap,
  LIcon,
  LTileLayer,
  LMarker,
  LCircle,
  LCircleMarker,
  LControlAttribution,
  LControlLayers,
  LControlScale,
  LControlZoom,
  LControl,
  LTooltip,
  LPopup,
  LPolyline,
  LPolygon,
  LRectangle,
  LWmsTileLayer,
  LGeoJson,
  LLayerGroup,
} from "./components";

export default {
  components: {
    LMap,
    LIcon,
    LTileLayer,
    LMarker,
    LCircle,
    LCircleMarker,
    LControlAttribution,
    LControlLayers,
    LControlScale,
    LControlZoom,
    LControl,
    LTooltip,
    LPopup,
    LPolyline,
    LPolygon,
    LRectangle,
    LWmsTileLayer,
    LLayerGroup,
    LGeoJson,
  },
  data() {
    return {
      zoom: 2,
      iconWidth: 25,
      iconHeight: 40,
      geojson: null,
      baseUrl: "http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi",
      wmsLayers: [
        {
          name: "Weather Data",
          visible: true,
          format: "image/png",
          layers: "nexrad-n0r-900913",
          transparent: true,
          attribution: "Weather data © 2012 IEM Nexrad",
        },
      ],
      customAttributionPrefix: "lol",
    };
  },
  computed: {
    iconUrl() {
      return `https://placekitten.com/${this.iconWidth}/${this.iconHeight}`;
    },
    iconSize() {
      return [this.iconWidth, this.iconHeight];
    },
  },
  async created() {
    const response = await fetch(
      "https://rawgit.com/gregoiredavid/france-geojson/master/regions/pays-de-la-loire/communes-pays-de-la-loire.geojson"
    );
    this.geojson = await response.json();
  },
  methods: {
    log(a) {
      console.log(a);
    },
    changeIcon() {
      this.iconWidth += 2;
      if (this.iconWidth > this.iconHeight) {
        this.iconWidth = Math.floor(this.iconHeight / 2);
      }
    },
    onMapReady() {
      this.log(this.$refs.map);
    },
  },
};
</script>

<style>
.leaflet-demo-control {
  background: white;
  border: 1px solid steelblue;
  border-radius: 0.6em;
  padding: 0.2em;
}
</style>
