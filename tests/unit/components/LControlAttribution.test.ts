import { flushPromises, shallowMount } from "@vue/test-utils";
import "leaflet";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LControlAttribution from "@src/components/LControlAttribution.vue";
import {
  RegisterControlInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

describe("LControlAttribution", () => {
  const mockRegisterControl = vi.fn();
  const getWrapper = async () => {
    const wrapper = shallowMount(LControlAttribution, {
      propsData: {
        position: "topright",
        prefix: "Hello there",
      },
      global: {
        provide: {
          [UseGlobalLeafletInjection as symbol]: true,
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

  it("emits a ready event", async () => {
    const wrapper = await getWrapper();

    expect(wrapper.emitted("ready")).to.have.length(1);
  });

  it("creates a Leaflet object with expected properties", async () => {
    const wrapper = await getWrapper();

    expect(wrapper.vm.leafletObject).to.exist;
    const leafletObject = wrapper.vm.leafletObject!;
    expect(leafletObject!.options.prefix).to.equal("Hello there");
    expect(leafletObject?.options.position).to.equal("topright");
  });

  it("registers its Leaflet object", async () => {
    const wrapper = await getWrapper();

    expect(mockRegisterControl).toHaveBeenCalledTimes(1);
    expect(mockRegisterControl).toHaveBeenCalledWith({
      leafletObject: wrapper.vm.leafletObject,
    });
  });

  it("sets the prefix value", async () => {
    const wrapper = await getWrapper();
    expect(wrapper.vm.leafletObject?.options.prefix);

    wrapper.setProps({ prefix: "new prefix" });

    await flushPromises();
    expect(wrapper.vm.leafletObject?.options.prefix).to.equal("new prefix");
  });

  it("sets a new position value", async () => {
    const wrapper = await getWrapper();

    wrapper.setProps({ position: "bottomleft" });

    await flushPromises();
    expect(wrapper.vm.leafletObject?.options.position).to.equal("bottomleft");
  });

  it("removes itself from the map on unmount", async () => {
    const wrapper = await getWrapper();
    const removeSpy = vi.spyOn(wrapper.vm.leafletObject!, "remove");

    wrapper.unmount();

    expect(removeSpy).toBeCalledTimes(1);
  });
});
