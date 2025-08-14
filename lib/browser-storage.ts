import type { WebsiteData } from "./default-data"

const STORAGE_KEY = "website_data"

export function saveToLocalStorage(data: WebsiteData): boolean {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      return true
    }
    return false
  } catch (error) {
    console.error("Error saving to localStorage:", error)
    return false
  }
}

export function loadFromLocalStorage(): WebsiteData | null {
  try {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : null
    }
    return null
  } catch (error) {
    console.error("Error loading from localStorage:", error)
    return null
  }
}
