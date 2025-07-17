import { type NextRequest, NextResponse } from "next/server"
import { getHabitEntries, updateHabitEntry } from "@/lib/storage"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userName = searchParams.get("user")
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  if (!userName || !month || !year) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  try {
    const entries = await getHabitEntries(userName, Number.parseInt(month), Number.parseInt(year))
    return NextResponse.json({ entries })
  } catch (error) {
    return NextResponse.json({ error: "Storage error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userName, habitName, date, completed } = await request.json()
    await updateHabitEntry(userName, habitName, date, completed)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Storage error" }, { status: 500 })
  }
}
