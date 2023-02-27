<script lang="ts">
import type L from "leaflet";
import {
  onMounted,
  ref,
  inject,
  nextTick,
  markRaw,
  defineComponent,
} from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  assertInject,
} from "@src/utils.js";
import { rectangleProps, setupRectangle } from "@src/functions/rectangle";
import { render } from "@src/functions/layer";
import {
  AddLayerInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

/**
 * Rectangle component, lets you add and customize rectangular regions on the map
 */
export default defineComponent({
  name: "LRectangle",
  props: rectangleProps,
  setup(props, context) {
    const leafletObject = ref<L.Rectangle>();
    const ready = ref(false);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupRectangle(props, leafletObject, context);

    onMounted(async () => {
      const { rectangle, latLngBounds, DomEvent }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      const bounds =
        props.bounds && props.bounds.length
          ? latLngBounds(props.bounds)
          : latLngBounds(props.latLngs);
      leafletObject.value = markRaw<L.Rectangle>(rectangle(bounds, options));

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletObject.value, listeners);

      propsBinder(methods, leafletObject.value, props);

      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { ready, leafletObject };
  },
  render() {
    return render(this.ready, this.$slots);
  },
});
</script>
