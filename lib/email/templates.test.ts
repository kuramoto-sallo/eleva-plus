import { describe, expect, it } from "vitest";
import { confirmationEmail } from "./templates";

describe("confirmationEmail", () => {
  it("escapa HTML do nome", () => {
    const e = confirmationEmail("<b>Maria</b>");
    expect(e.html).toContain("&lt;b&gt;Maria&lt;/b&gt;");
    expect(e.html).not.toContain("<b>Maria</b>");
    expect(e.text).toContain("<b>Maria</b>");
  });
});
