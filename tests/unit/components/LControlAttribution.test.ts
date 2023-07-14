import { flushPromises, shallowMount } from "@vue/test-utils";
import "leaflet";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LControlAttribution from "@src/components/LControlAttribution.vue";
import { RegisterControlInjection } from "@src/types/injectionKeys";

describe.each([true, false])("LControlAttribution", () => {
  const mockRegisterControl = vi.fn();
  const getWrapper = async () => {
    const wrapper = shallowMount(LControlAttribution, {
      propsData: {
        position: "topright",
        prefix: "Hello there",
      },
      global: {
        provide: {
          [RegisterControlInjection as symbol]: mockRegisterControl,
        },
      },
    });
    await flushPromises();

    return wrapper;
  };

  beforeEach(() => {
    mockRegisterControl.mockReset();
  });

  it(`emits a ready event with the Leaflet object`, async () => {
    const wrapper = await getWrapper();

    expect(wrapper.emitted()).to.have.property("ready");
    const readyEvent = wrapper.emitted("ready");
    expect(readyEvent).to.have.length(1);
    expect(readyEvent![0]).to.deep.equal([wrapper.vm.leafletObject]);
  });

  it(`creates a Leaflet object with expected properties`, async () => {
    const wrapper = await getWrapper();

    expect(wrapper.vm.leafletObject).to.exist;
    const leafletObject = wrapper.vm.leafletObject!;
    expect(leafletObject!.options.prefix).to.equal("Hello there");
    expect(leafletObject?.options.position).to.equal("topright");
  });

  it(`registers its Leaflet object`, async () => {
    const wrapper = await getWrapper();

    expect(mockRegisterControl).toHaveBeenCalledTimes(1);
    expect(mockRegisterControl).toHaveBeenCalledWith({
      leafletObject: wrapper.vm.leafletObject,
    });
  });

  it(`updates the prefix`, async () => {
    const wrapper = await getWrapper();
    expect(wrapper.vm.leafletObject?.options.prefix);

    wrapper.setProps({ prefix: "new prefix" });

    await flushPromises();
    expect(wrapper.vm.leafletObject?.options.prefix).to.equal("new prefix");
  });

  it(`updates the position`, async () => {
    const wrapper = await getWrapper();

    wrapper.setProps({ position: "bottomleft" });

    await flushPromises();
    expect(wrapper.vm.leafletObject?.options.position).to.equal("bottomleft");
  });

  it(`removes itself from the map on unmount`, async () => {
    const wrapper = await getWrapper();
    const removeSpy = vi.spyOn(wrapper.vm.leafletObject!, "remove");

    wrapper.unmount();

    expect(removeSpy).toBeCalledTimes(1);
  });
});
