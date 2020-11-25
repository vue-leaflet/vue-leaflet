<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
  props as controlProps,
  setup as controlSetup,
  render,
} from "../functions/control";
import { propsBinder } from "../utils.js";

export default {
  name: "LControl",
  props: {
    ...controlProps,
    disableClickPropagation: {
      type: Boolean,
      custom: true,
      default: true,
    },
    disableScrollPropagation: {
      type: Boolean,
      custom: true,
      default: false,
    },
  },
  setup(props, context) {
    const leafletRef = ref({});
    const root = ref(null);

    const registerControl = inject("registerControl");
    const { options, methods } = controlSetup(props, leafletRef);
    onMounted(async () => {
      const { Control, DomEvent } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      const LControl = Control.extend({
        onAdd() {
          return root.value;
        },
      });

      leafletRef.value = new LControl(options);
      propsBinder(methods, leafletRef.value, props);
      registerControl({ leafletObject: leafletRef.value });

      if (props.disableClickPropagation) {
        DomEvent.disableClickPropagation(root.value);
      }
      if (props.disableScrollPropagation) {
        DomEvent.disableScrollPropagation(root.value);
      }
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { root, leafletObject: leafletRef };
  },
  render() {
    return render(this.$slots);
  },
};
</script>
