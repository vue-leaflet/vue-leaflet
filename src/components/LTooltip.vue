<script>
import { onMounted, ref, inject } from "vue";
import { propsBinder, remapEvents } from "../utils.js";
import { setup as tooltipSetup, props } from "../functions/tooltip";
import { render } from "../functions/popper";

/**
 * Display a tooltip on the map
 */
export default {
  name: "LTooltip",
  props,
  setup(props, context) {
    const leafletRef = ref({});
    const root = ref(null);

    const bindTooltip = inject("bindTooltip");
    const { options, methods } = tooltipSetup(props, leafletRef, context);

    onMounted(async () => {
      const { tooltip, DomEvent, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      leafletRef.value = tooltip(options);

      propsBinder(methods, leafletRef.value, props, setOptions);
      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);
      leafletRef.value.setContent(props.content || root.value);
      bindTooltip({ leafletObject: leafletRef.value });
    });
    return render(root, context);
  },
};
</script>
