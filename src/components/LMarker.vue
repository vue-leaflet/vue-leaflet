<script>
import { onMounted, ref, reactive, inject } from "vue";
import { remapEvents, propsBinder, debounce } from "../utils.js";
import { props, setup as markerSetup } from "../functions/marker";

/**
 * Marker component, lets you add and personalize markers on the map
 */
export default {
  name: "LMarker",
  props,
  setup(props, context) {
    const mapRef = ref({});
    const ready = ref(false);

    const schematics = reactive({
      latLng() {},
    });

    const lMethods = inject("leafLetMethods");
    const { options, methods } = markerSetup(
      props,
      mapRef,
      context,
      schematics
    );

    onMounted(async () => {
      const { marker, DomEvent, latLng, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      schematics.latLng = latLng;

      mapRef.value = marker(props.latLng, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(mapRef.value, listeners);

      mapRef.value.on("move", debounce(methods.latLngSync, 100));
      propsBinder(methods, mapRef.value, props, setOptions);
      lMethods.addLayer({ ...props, ...methods, mapObject: mapRef.value });
      ready.value = true;
    });
    return { ready };
  },
  render: function (h) {
    if (this.ready && this.$slots.default) {
      return h("div", { style: { display: "none" } }, this.$slots.default);
    }
    return null;
  },
};
</script>
