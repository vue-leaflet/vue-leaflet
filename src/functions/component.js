export const props = {
  options: {
    type: Object,
    default: () => ({ useGlobalLeaflet: false }),
  },
};

export const setup = (props) => {
  return { options: props.options, methods: {} };
};
