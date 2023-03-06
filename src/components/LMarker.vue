<script lang="ts">
import type L from "leaflet";
import { debounce } from "ts-debounce";
import {
  defineComponent,
  inject,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
} from "vue";

import { render } from "@src/functions/layer";
import {
  markerProps,
  setupMarker,
  shouldBlankIcon,
} from "@src/functions/marker";
import {
  AddLayerInjection,
  CanSetParentHtmlInjection,
  SetIconInjection,
  SetParentHtmlInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";
import {
  WINDOW_OR_GLOBAL,
  assertInject,
  cancelDebounces,
  isFunction,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

/**
 * Marker component, lets you add and personalize markers on the map
 */
export default defineComponent({
  name: "LMarker",
  props: markerProps,
  setup(props, context) {
    const leafletObject = ref<L.Marker>();
    const ready = ref(false);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    provide(
      CanSetParentHtmlInjection,
      () => !!leafletObject.value?.getElement()
    );
    provide(SetParentHtmlInjection, (html: string) => {
      const el =
        isFunction(leafletObject.value?.getElement) &&
        leafletObject.value?.getElement();
      if (!el) return;
      el.innerHTML = html;
    });
    provide(
      SetIconInjection,
      (newIcon: L.DivIcon | L.Icon) =>
        leafletObject.value?.setIcon && leafletObject.value.setIcon(newIcon)
    );
    const { options, methods } = setupMarker(props, leafletObject, context);

    const eventHandlers = {
      moveHandler: debounce(methods.latLngSync),
    };

    onMounted(async () => {
      const { marker, divIcon }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      if (shouldBlankIcon(options, context)) {
        options.icon = divIcon({ className: "" });
      }
      leafletObject.value = markRaw<L.Marker>(marker(props.latLng, options));

      const listeners = remapEvents(context.attrs);
      leafletObject.value.on(listeners);

      leafletObject.value.on("move", eventHandlers.moveHandler);
      propsBinder(methods, leafletObject.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    onBeforeUnmount(() => cancelDebounces(eventHandlers));

    return { ready, leafletObject };
  },
  render() {
    return render(this.ready, this.$slots);
  },
});
</script>
