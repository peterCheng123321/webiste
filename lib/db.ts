import { readDataFromFile, writeDataToFile } from "./file-storage"
import { loadFromLocalStorage, saveToLocalStorage } from "./browser-storage"
import { defaultData } from "./default-data"
import { isEdgeDBConfigured, getDataFromEdgeDB, saveDataToEdgeDB, testConnection } from "./edgedb"

// Simple environment detection
const isServer = typeof window === "undefined"

// Fallback in-memory storage
let inMemoryData = null

// Get website data with fallbacks
export async function getWebsiteData() {
  // Try EdgeDB if configured
  if (isEdgeDBConfigured()) {
    try {
      // Test connection first
      const connected = await testConnection()
      if (connected) {
        const edgeDBData = await getDataFromEdgeDB()
        if (edgeDBData) return edgeDBData
      }
    } catch (error) {
      console.error("EdgeDB error:", error)
    }
  }

  // Try file storage (server-side only)
  if (isServer) {
    try {
      const fileData = await readDataFromFile()
      if (fileData) return fileData
    } catch (error) {
      console.error("File storage error:", error)
    }
  }

  // Try browser storage (client-side only)
  if (!isServer) {
    try {
      const browserData = loadFromLocalStorage()
      if (browserData) return browserData
    } catch (error) {
      console.error("Browser storage error:", error)
    }
  }

  // Use in-memory data or default data
  return inMemoryData || defaultData
}

// Save website data with fallbacks
export async function setWebsiteData(data) {
  // Always update in-memory data
  inMemoryData = data

  let edgeDBSuccess = false
  let fileSuccess = false
  let browserSuccess = false

  // Try EdgeDB if configured
  if (isEdgeDBConfigured()) {
    try {
      // Test connection first
      const connected = await testConnection()
      if (connected) {
        edgeDBSuccess = await saveDataToEdgeDB(data)
      }
    } catch (error) {
      console.error("EdgeDB save error:", error)
    }
  }

  // Try file storage (server-side only)
  if (isServer) {
    try {
      fileSuccess = await writeDataToFile(data)
    } catch (error) {
      console.error("File save error:", error)
    }
  }

  // Try browser storage (client-side only)
  if (!isServer) {
    try {
      browserSuccess = saveToLocalStorage(data)
    } catch (error) {
      console.error("Browser storage error:", error)
    }
  }

  return edgeDBSuccess || fileSuccess || browserSuccess
}
