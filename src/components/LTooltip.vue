<script>
import { onMounted, ref, inject, h } from "vue";
import { propsBinder, remapEvents } from "../utils.js";
import { setup as tooltipSetup, props } from "../functions/tooltip";

/**
 * Display a tooltip on the map
 */
export default {
  name: "LTooltip",
  props,
  setup(props, context) {
    const mapRef = ref({});
    const root = ref(null);

    const lMethods = inject("leafLetMethods");
    const { options, methods } = tooltipSetup(props, mapRef, context, lMethods);

    onMounted(async () => {
      const { tooltip, DomEvent, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      mapRef.value = tooltip(options);

      propsBinder(methods, mapRef.value, props, setOptions);
      const listeners = remapEvents(context.attrs);
      DomEvent.on(mapRef.value, listeners);
      mapRef.value.setContent(props.content || root.value);
      lMethods.bindTooltip({ mapObject: mapRef.value });
    });
    return { root };
  },
  render() {
    if (this.$slots.default) {
      return h("div", { ref: "root" }, this.$slots.default());
    }
    return null;
  },
};
</script>
