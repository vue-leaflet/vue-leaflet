<script>
import { onMounted, ref, inject } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import { props, setup as polygonSetup } from "../functions/polygon";
import { render } from "../functions/layer";

/**
 * Polygon component, lets you add and customize polygon regions on the map
 */
export default {
  name: "LPolygon",
  props,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);
    const addLayer = inject("addLayer");

    const { options, methods } = polygonSetup(props, leafletRef, context);

    onMounted(async () => {
      const { polygon, DomEvent, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      leafletRef.value = polygon(props.latLngs, options);

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
