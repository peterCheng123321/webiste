import { createHttpClient } from "edgedb"

// Simple environment detection
const isServer = typeof window === "undefined"

// Get the appropriate EdgeDB client based on the environment
export function getEdgeDBClient() {
  try {
    const instance = process.env.EDGEDB_INSTANCE
    const secretKey = process.env.EDGEDB_SECRET_KEY

    if (!instance || !secretKey) {
      console.warn("EdgeDB credentials not available")
      return null
    }

    // Always use HTTP client for simplicity and consistency
    return createHttpClient({
      instanceName: instance,
      secretKey: secretKey,
    })
  } catch (error) {
    console.error("Error creating EdgeDB client:", error)
    return null
  }
}

// Check if EdgeDB is properly configured
export function isEdgeDBConfigured() {
  return Boolean(process.env.EDGEDB_INSTANCE && process.env.EDGEDB_SECRET_KEY)
}

// Test the EdgeDB connection
export async function testConnection() {
  try {
    const client = getEdgeDBClient()
    if (!client) return false

    // Simple query to test connection
    const result = await client.querySingle(`SELECT 1 + 1;`)
    return result === 2
  } catch (error) {
    console.error("EdgeDB connection test failed:", error)
    return false
  }
}

// Initialize EdgeDB schema
export async function initializeEdgeDBSchema() {
  try {
    const client = getEdgeDBClient()
    if (!client) return false

    // Create the WebsiteData type if it doesn't exist
    const schemaQuery = `
      CREATE TYPE WebsiteData {
        CREATE REQUIRED PROPERTY id -> uuid;
        CREATE REQUIRED PROPERTY data -> str;
        CREATE CONSTRAINT exclusive ON (.id);
      }
      UNLESS EXISTS;
    `

    await client.execute(schemaQuery)
    return true
  } catch (error) {
    console.error("Error initializing EdgeDB schema:", error)
    return false
  }
}

// Get website data from EdgeDB
export async function getDataFromEdgeDB() {
  try {
    const client = getEdgeDBClient()
    if (!client) return null

    // First, check if the type exists
    const typeExists = await client.querySingle(`
      SELECT EXISTS (
        SELECT schema::ObjectType 
        FILTER .name = 'default::WebsiteData'
      );
    `)

    // If type doesn't exist, try to create it
    if (!typeExists) {
      const initialized = await initializeEdgeDBSchema()
      if (!initialized) return null
    }

    // Query to get the website data
    const query = `
      SELECT WebsiteData {
        id,
        data
      } 
      FILTER .id = <uuid>'00000000-0000-0000-0000-000000000001'
      LIMIT 1
    `

    const result = await client.querySingle(query)

    if (result && result.data) {
      return JSON.parse(result.data)
    }

    return null
  } catch (error) {
    console.error("Error fetching data from EdgeDB:", error)
    return null
  }
}

// Save website data to EdgeDB
export async function saveDataToEdgeDB(data) {
  try {
    const client = getEdgeDBClient()
    if (!client) return false

    // First, check if the type exists
    const typeExists = await client.querySingle(`
      SELECT EXISTS (
        SELECT schema::ObjectType 
        FILTER .name = 'default::WebsiteData'
      );
    `)

    // If type doesn't exist, try to create it
    if (!typeExists) {
      const initialized = await initializeEdgeDBSchema()
      if (!initialized) return false
    }

    // Query to upsert the website data
    const query = `
      INSERT WebsiteData {
        id := <uuid>'00000000-0000-0000-0000-000000000001',
        data := <str>$data
      }
      UNLESS CONFLICT ON .id
      ELSE (
        UPDATE WebsiteData
        SET { data := <str>$data }
      )
    `

    await client.querySingle(query, { data: JSON.stringify(data) })
    return true
  } catch (error) {
    console.error("Error saving data to EdgeDB:", error)
    return false
  }
}
