import { describe, expect, it } from "vitest"
import {
  DEFAULT_GLASS_MATERIAL,
  DEFAULT_TRANSLUCENT_MATERIAL,
  GLASS_MATERIALS,
} from "./index"

describe("glass materials", () => {
  it("defaults to the solid opaque path", () => {
    expect(DEFAULT_GLASS_MATERIAL).toBe("solid")
  })

  it("keeps Regular frost as the recommended translucent path", () => {
    expect(DEFAULT_TRANSLUCENT_MATERIAL).toBe("regular")
  })

  it("exposes all four undecided materials plus solid", () => {
    expect(GLASS_MATERIALS).toEqual([
      "solid",
      "regular",
      "thin",
      "clear",
      "chrome",
    ])
  })
})
