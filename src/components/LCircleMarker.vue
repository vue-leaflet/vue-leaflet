<script>
import { onMounted, ref, inject } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import { props, setup as circleMarkerSetup } from "../functions/circleMarker";
import { render } from "../functions/layer";

/**
 * Circle Marker component, lets you add and personalize circle markers on the map
 */
export default {
  name: "LCircleMarker",
  props,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const addLayer = inject("addLayer");

    const { options, methods } = circleMarkerSetup(props, leafletRef, context);

    onMounted(async () => {
      const { circleMarker, DomEvent, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      leafletRef.value = circleMarker(props.latLng, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props, setOptions);

      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
    });
    return render(ready, context);
  },
};
</script>
