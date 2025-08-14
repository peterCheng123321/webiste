import fs from "fs"
import path from "path"
import type { WebsiteData } from "./default-data"

// Use a try-catch block for the path resolution to handle environments where process.cwd() might not be available
let DATA_FILE_PATH: string
try {
  DATA_FILE_PATH = path.join(process.cwd(), "data", "website-data.json")
} catch (error) {
  console.error("Error resolving file path:", error)
  // Fallback to a relative path if process.cwd() is not available
  DATA_FILE_PATH = "./data/website-data.json"
}

// Ensure the data directory exists
try {
  const dataDir = path.dirname(DATA_FILE_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
} catch (error) {
  console.error("Error creating data directory:", error)
  // Continue execution - we'll handle file read/write errors separately
}

export async function readDataFromFile(): Promise<WebsiteData | null> {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, "utf8")
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error("Error reading from file:", error)
    return null
  }
}

export async function writeDataToFile(data: WebsiteData): Promise<boolean> {
  try {
    // Ensure directory exists before writing
    const dataDir = path.dirname(DATA_FILE_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Error writing to file:", error)
    return false
  }
}
