import { NextResponse } from "next/server"
import { isEdgeDBConfigured, testConnection, initializeEdgeDBSchema } from "@/lib/edgedb"

export async function GET() {
  try {
    const isConfigured = isEdgeDBConfigured()

    let connectionStatus = false
    let schemaStatus = false

    if (isConfigured) {
      connectionStatus = await testConnection()

      if (connectionStatus) {
        schemaStatus = await initializeEdgeDBSchema()
      }
    }

    return NextResponse.json({
      configured: isConfigured,
      connected: connectionStatus,
      schemaInitialized: schemaStatus,
      instance: process.env.EDGEDB_INSTANCE ? "Set" : "Not set",
      secretKey: process.env.EDGEDB_SECRET_KEY ? "Set" : "Not set",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check EdgeDB status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
