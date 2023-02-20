import { describe, it, expect } from "vitest";
import { capitalizeFirstLetter } from "@src/utils";

describe("capitalizeFirstLetter", () => {
  it("returns empty string given empty string", () => {
    const result = capitalizeFirstLetter("");

    expect(result).to.be.empty;
  });

  it("capitalizes the first letter of a string starting with a letter, and changes nothing else", () => {
    const result = capitalizeFirstLetter("this IS a String!");

    expect(result).to.equal("This IS a String!");
  });

  it("returns a string unchanged when not starting with a letter", () => {
    const result = capitalizeFirstLetter("42 is the answer");

    expect(result).to.equal("42 is the answer");
  });
});
