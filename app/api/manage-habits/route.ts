import { type NextRequest, NextResponse } from "next/server"
import { getAllHabits, addHabit, toggleHabitActivation, deleteCustomHabit } from "@/lib/storage"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userName = searchParams.get("user")

  if (!userName) {
    return NextResponse.json({ error: "User parameter required" }, { status: 400 })
  }

  try {
    const habits = await getAllHabits(userName)
    return NextResponse.json({ habits })
  } catch (error) {
    return NextResponse.json({ error: "Storage error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userName, action, habitName, isActive } = await request.json()

    if (action === "toggle") {
      await toggleHabitActivation(userName, habitName, isActive)
    } else if (action === "add") {
      await addHabit(userName, habitName)
    } else if (action === "delete") {
      await deleteCustomHabit(userName, habitName)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Storage error" }, { status: 500 })
  }
}
