export const props = {
  options: {
    type: Object,
    default: () => ({}),
  },
};

export const setup = (props) => {
  return { options: props.options, methods: {} };
};
