import { popperProps, setupPopper } from "./popper";

export const popupProps = {
  ...popperProps,
  latLng: {
    type: [Object, Array],
    default: () => [],
  },
} as const;

export const setupPopup = (props, leafletRef) => {
  const { options, methods } = setupPopper(props, leafletRef);

  return { options, methods };
};
