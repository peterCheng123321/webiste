import { type NextRequest, NextResponse } from "next/server"
import { getWebsiteData, setWebsiteData } from "@/lib/db"
import { defaultData } from "@/lib/default-data"

export async function GET() {
  try {
    const data = await getWebsiteData()
    return NextResponse.json({ data: data || defaultData })
  } catch (error) {
    console.error("Error fetching website data:", error)
    return NextResponse.json({ data: defaultData })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const success = await setWebsiteData(body.data)

    return NextResponse.json({
      success: true,
      warning: !success ? "Data saved to fallback storage only" : undefined,
    })
  } catch (error) {
    console.error("Error saving website data:", error)
    return NextResponse.json(
      {
        error: "Failed to save website data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
