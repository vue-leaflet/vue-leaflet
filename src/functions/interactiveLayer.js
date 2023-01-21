import { componentProps, setupComponent } from "./component";

export const interactiveLayerProps = {
  ...componentProps,
  interactive: {
    type: Boolean,
  },
  bubblingMouseEvents: {
    type: Boolean,
  },
};

export const setupInteractiveLayer = (props) => {
  const { options: componentOptions, methods } = setupComponent(props);
  const options = {
    ...componentOptions,
    interactive: props.interactive,
    bubblingMouseEvents: props.bubblingMouseEvents,
  };

  return { options, methods };
};
