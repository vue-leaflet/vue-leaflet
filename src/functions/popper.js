export const props = {
  content: {
    type: String,
    default: null,
  },
};

export const setup = (props, mapRef) => {
  const options = {};
  const methods = {
    setContent(newVal) {
      if (mapRef.value && newVal !== null && newVal !== undefined) {
        mapRef.value.setContent(newVal);
      }
    },
  };
  return { options, methods };
};
