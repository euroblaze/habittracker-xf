import { promises as fs } from "fs"
import path from "path"

interface User {
  id: number
  name: string
}

interface Habit {
  id: number
  name: string
  user_id: number
  is_active: boolean
  is_custom: boolean
}

interface HabitEntry {
  id: number
  user_id: number
  habit_name: string
  date: string
  completed: boolean
}

interface DatabaseData {
  users: User[]
  habits: Habit[]
  habit_entries: HabitEntry[]
}

const DB_FILE = path.join(process.cwd(), "data", "habits.json")

// Default data
const DEFAULT_DATA: DatabaseData = {
  users: [
    { id: 1, name: "Doro" },
    { id: 2, name: "Ashant" },
  ],
  habits: [
    { id: 1, name: "Gym", user_id: 1, is_active: true, is_custom: false },
    { id: 2, name: "Meditation (5+ min)", user_id: 1, is_active: true, is_custom: false },
    { id: 3, name: "Water (2+ liters)", user_id: 1, is_active: true, is_custom: false },
    { id: 4, name: "Reading", user_id: 1, is_active: true, is_custom: false },
    { id: 5, name: "Walk/Exercise", user_id: 1, is_active: true, is_custom: false },
    { id: 6, name: "Gym", user_id: 2, is_active: true, is_custom: false },
    { id: 7, name: "Meditation (5+ min)", user_id: 2, is_active: true, is_custom: false },
    { id: 8, name: "Water (2+ liters)", user_id: 2, is_active: true, is_custom: false },
    { id: 9, name: "Reading", user_id: 2, is_active: true, is_custom: false },
    { id: 10, name: "Walk/Exercise", user_id: 2, is_active: true, is_custom: false },
  ],
  habit_entries: [],
}

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DB_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Read data from file
export async function readData(): Promise<DatabaseData> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(DB_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    // File doesn't exist, create with default data
    await writeData(DEFAULT_DATA)
    return DEFAULT_DATA
  }
}

// Write data to file
export async function writeData(data: DatabaseData): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2))
}

// Get user by name
export async function getUserByName(name: string): Promise<User | null> {
  const data = await readData()
  return data.users.find((u) => u.name === name) || null
}

// Get active habits for user
export async function getActiveHabits(userName: string): Promise<string[]> {
  const data = await readData()
  const user = data.users.find((u) => u.name === userName)
  if (!user) return []

  return data.habits.filter((h) => h.user_id === user.id && h.is_active).map((h) => h.name)
}

// Get all habits for user (for settings)
export async function getAllHabits(
  userName: string,
): Promise<{ name: string; is_active: boolean; is_custom: boolean }[]> {
  const data = await readData()
  const user = data.users.find((u) => u.name === userName)
  if (!user) return []

  return data.habits
    .filter((h) => h.user_id === user.id)
    .map((h) => ({ name: h.name, is_active: h.is_active, is_custom: h.is_custom }))
}

// Get habit entries for user and month
export async function getHabitEntries(userName: string, month: number, year: number): Promise<HabitEntry[]> {
  const data = await readData()
  const user = data.users.find((u) => u.name === userName)
  if (!user) return []

  const monthStr = `${year}-${month.toString().padStart(2, "0")}`
  return data.habit_entries.filter((e) => e.user_id === user.id && e.date.startsWith(monthStr))
}

// Get habit totals for all users
export async function getHabitTotals(
  month: number,
  year: number,
): Promise<{ user_name: string; habit_name: string; total: number }[]> {
  const data = await readData()
  const monthStr = `${year}-${month.toString().padStart(2, "0")}`

  const totals: { [key: string]: number } = {}

  data.habit_entries
    .filter((e) => e.completed && e.date.startsWith(monthStr))
    .forEach((entry) => {
      const user = data.users.find((u) => u.id === entry.user_id)
      if (user) {
        const key = `${user.name}:${entry.habit_name}`
        totals[key] = (totals[key] || 0) + 1
      }
    })

  return Object.entries(totals).map(([key, total]) => {
    const [user_name, habit_name] = key.split(":")
    return { user_name, habit_name, total }
  })
}

// Update habit entry
export async function updateHabitEntry(
  userName: string,
  habitName: string,
  date: string,
  completed: boolean,
): Promise<void> {
  const data = await readData()
  const user = data.users.find((u) => u.name === userName)
  if (!user) return

  const existingIndex = data.habit_entries.findIndex(
    (e) => e.user_id === user.id && e.habit_name === habitName && e.date === date,
  )

  if (existingIndex >= 0) {
    data.habit_entries[existingIndex].completed = completed
  } else {
    const newId = Math.max(0, ...data.habit_entries.map((e) => e.id)) + 1
    data.habit_entries.push({
      id: newId,
      user_id: user.id,
      habit_name: habitName,
      date,
      completed,
    })
  }

  await writeData(data)
}

// Add new habit
export async function addHabit(userName: string, habitName: string): Promise<void> {
  const data = await readData()
  const user = data.users.find((u) => u.name === userName)
  if (!user) return

  // Check if habit already exists
  const exists = data.habits.some((h) => h.user_id === user.id && h.name === habitName)
  if (exists) return

  const newId = Math.max(0, ...data.habits.map((h) => h.id)) + 1
  data.habits.push({
    id: newId,
    name: habitName,
    user_id: user.id,
    is_active: true,
    is_custom: true,
  })

  await writeData(data)
}

// Toggle habit activation
export async function toggleHabitActivation(userName: string, habitName: string, isActive: boolean): Promise<void> {
  const data = await readData()
  const user = data.users.find((u) => u.name === userName)
  if (!user) return

  const habit = data.habits.find((h) => h.user_id === user.id && h.name === habitName)
  if (habit) {
    habit.is_active = isActive
    await writeData(data)
  }
}

// Delete custom habit
export async function deleteCustomHabit(userName: string, habitName: string): Promise<void> {
  const data = await readData()
  const user = data.users.find((u) => u.name === userName)
  if (!user) return

  // Remove habit
  data.habits = data.habits.filter((h) => !(h.user_id === user.id && h.name === habitName && h.is_custom))

  // Remove related entries
  data.habit_entries = data.habit_entries.filter((e) => !(e.user_id === user.id && e.habit_name === habitName))

  await writeData(data)
}
