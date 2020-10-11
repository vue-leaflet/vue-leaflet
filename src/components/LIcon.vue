<script>
import { onMounted, reactive, ref } from "vue";
import { props, setup as iconSetup } from "../functions/icon";

/**
 * Icon component, lets you add and custom icons to the map
 */
export default {
  name: "LIcon",
  props,
  setup(props, context) {
    const leafletRef = ref({});
    const schematics = reactive({
      DomEvent: () => undefined,
      divIcon: () => undefined,
      icon: () => undefined,
    });

    onMounted(async () => {
      const { DomEvent, divIcon, icon } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      schematics.DomEvent = DomEvent;
      schematics.divIcon = divIcon;
      schematics.icon = icon;
    });
  },
};
</script>
