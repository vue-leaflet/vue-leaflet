<script lang="ts">
import {
  onMounted,
  ref,
  provide,
  inject,
  nextTick,
  defineComponent,
} from "vue";
import { remapEvents, propsBinder, debounce } from "../utils";
import {
  props as markerProps,
  setup as markerSetup,
} from "../functions/marker";
import { render } from "../functions/layer";
import {
  DivIcon,
  DomEvent as DomEventLeaflet,
  Icon,
  LatLngExpression,
  marker as markerLeaflet,
  Marker,
} from "leaflet";

/**
 * Marker component, lets you add and personalize markers on the map
 */
export default defineComponent({
  name: "LMarker",
  props: markerProps,
  setup(props, context) {
    const leafletRef = ref<Marker | null>(null);
    const ready = ref(false);

    // FIXME: Type of addLayer
    const addLayer = inject<any>("addLayer");

    provide(
      "canSetParentHtml",
      () => leafletRef.value && !!leafletRef.value.getElement()
    );
    provide("setParentHtml", (html: string) => {
      if (leafletRef.value) {
        const element = leafletRef.value.getElement();
        if (element) {
          element.innerHTML = html;
        }
      }
    });

    provide(
      "setIcon",
      (newIcon: Icon | DivIcon) =>
        leafletRef.value &&
        leafletRef.value.setIcon &&
        leafletRef.value.setIcon(newIcon)
    );
    const { options, methods } = markerSetup(props, leafletRef, context);

    onMounted(async () => {
      // FIXME: Importing from "leaflet" results in error when loading markerImg, but works when importing from "leaflet/dist/leaflet-src.esm"
      const {
        marker,
        DomEvent,
      }: {
        marker: typeof markerLeaflet;
        DomEvent: typeof DomEventLeaflet;
      } = await import("leaflet/dist/leaflet-src.esm");
      // FIXME: props.latlng should not be needed to be casted
      leafletRef.value = marker(props.latLng as LatLngExpression, options);

      const listeners = remapEvents(context.attrs);

      // FIXME: Types seems to not match, might be an issue in @types/leaflet
      DomEvent.on((leafletRef.value as unknown) as HTMLElement, listeners);

      leafletRef.value.on("move", debounce(methods.latLngSync, 100));
      propsBinder(methods, (leafletRef.value as unknown) as HTMLElement, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render(this.ready, this.$slots);
  },
});
</script>
