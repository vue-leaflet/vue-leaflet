import { onUnmounted } from "vue";

export const props = {
  position: {
    type: String,
    default: "topright",
  },
};
export const setup = (props, leafletRef) => {
  const options = {
    position: props.position,
  };

  const methods = {
    setPosition(position) {
      if (leafletRef.value) {
        leafletRef.value.setPosition(position);
      }
    },
  };

  onUnmounted(() => {
    if (leafletRef.value) {
      leafletRef.value.remove();
    }
  });

  return { options, methods };
};
