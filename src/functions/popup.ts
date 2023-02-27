import { popperProps, setupPopper } from "./popper";

export const popupProps = {
  ...popperProps,
  latLng: {
    type: [Object, Array],
    default: () => [],
  },
};

export const setupPopup = (props, leafletRef) => {
  const { options, methods } = setupPopper(props, leafletRef);

  return { options, methods };
};
