import { type NextRequest, NextResponse } from "next/server"
import { getHabitTotals } from "@/lib/storage"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  if (!month || !year) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  try {
    const totals = await getHabitTotals(Number.parseInt(month), Number.parseInt(year))
    return NextResponse.json({ totals })
  } catch (error) {
    return NextResponse.json({ error: "Storage error" }, { status: 500 })
  }
}
