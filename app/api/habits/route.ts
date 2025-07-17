import { type NextRequest, NextResponse } from "next/server"
import { getActiveHabits } from "@/lib/storage"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userName = searchParams.get("user")

  if (!userName) {
    return NextResponse.json({ error: "User parameter required" }, { status: 400 })
  }

  try {
    const habits = await getActiveHabits(userName)
    return NextResponse.json({ habits })
  } catch (error) {
    return NextResponse.json({ error: "Storage error" }, { status: 500 })
  }
}
