<script>
import { onMounted, reactive, ref, inject } from "vue";
import { props, setup as iconSetup } from "../functions/icon";
import { generatePlaceholderMethods } from "../utils";

/**
 * Icon component, lets you add and custom icons to the map
 */
export default {
  name: "LIcon",
  props,
  setup(props, context) {
    const leafletRef = ref({});
    const schematics = generatePlaceholderMethods([
      "DomEvent",
      "divIcon",
      "icon",
    ]);

    const setIcon = inject("setIcon");
    const canSetParentHtml = inject("canSetParentHtml");
    const setParentHtml = inject("setParentHtml");

    onMounted(async () => {
      const { DomEvent, divIcon, icon } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      schematics.DomEvent = DomEvent;
      schematics.divIcon = divIcon;
      schematics.icon = icon;

      leafletRef.value = 
    });
  },
};
</script>
