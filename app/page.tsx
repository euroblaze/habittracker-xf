"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HabitEntry {
  habit_name: string
  date: string
  completed: boolean
}

interface HabitTotal {
  user_name: string
  habit_name: string
  total: number
}

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-8">Habit Tracker</h1>

        <p className="text-lg mb-8 text-gray-600">Track your habits together! Each person has their own URL.</p>

        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Access Your Tracker:</h2>

            <Link href="/doro">
              <Button className="w-full h-16 text-xl bg-white border-2 border-black text-black hover:bg-gray-100">
                Doro's Habits
                <div className="text-sm font-mono text-gray-500">/doro</div>
              </Button>
            </Link>

            <Link href="/ashant">
              <Button className="w-full h-16 text-xl bg-white border-2 border-black text-black hover:bg-gray-100">
                Ashant's Habits
                <div className="text-sm font-mono text-gray-500">/ashant</div>
              </Button>
            </Link>
          </div>

          <div className="text-sm text-gray-500 space-y-2">
            <p>
              <strong>Bookmark your URL:</strong>
            </p>
            <p className="font-mono bg-gray-100 p-2 rounded">yoursite.com/doro</p>
            <p className="font-mono bg-gray-100 p-2 rounded">yoursite.com/ashant</p>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          <p>Each person tracks their own habits</p>
          <p>View both totals at the bottom</p>
          <p>Updates sync when you reload</p>
        </div>
      </div>
    </div>
  )
}

const HabitTracker = () => {
  const [currentPartner, setCurrentPartner] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([])
  const [habitTotals, setHabitTotals] = useState<HabitTotal[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [activeHabits, setActiveHabits] = useState<string[]>([])
  const [allHabits, setAllHabits] = useState<{ name: string; is_active: boolean; is_custom: boolean }[]>([])
  const [newHabitName, setNewHabitName] = useState("")

  // Get current month key
  const getMonthKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}`
  }

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // Format date for database
  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
  }

  // Load habit data
  const loadHabitData = async () => {
    if (!currentPartner) return

    try {
      // Load active habits
      const habitsResponse = await fetch(`/api/habits?user=${currentPartner}`)
      const habitsData = await habitsResponse.json()
      setActiveHabits(habitsData.habits || [])

      // Load habit entries for current month
      const entriesResponse = await fetch(
        `/api/habit-entries?user=${currentPartner}&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`,
      )
      const entriesData = await entriesResponse.json()
      setHabitEntries(entriesData.entries || [])

      // Load totals for both users
      const totalsResponse = await fetch(
        `/api/habit-totals?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`,
      )
      const totalsData = await totalsResponse.json()
      setHabitTotals(totalsData.totals || [])
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  // Load settings data
  const loadSettingsData = async () => {
    if (!currentPartner) return

    try {
      const response = await fetch(`/api/manage-habits?user=${currentPartner}`)
      const data = await response.json()
      setAllHabits(data.habits || [])
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  useEffect(() => {
    if (currentPartner) {
      loadHabitData()
    }
  }, [currentPartner, currentDate])

  useEffect(() => {
    if (showSettings && currentPartner) {
      loadSettingsData()
    }
  }, [showSettings, currentPartner])

  // Toggle habit for a specific day
  const toggleHabit = async (day: number, habit: string) => {
    const date = formatDate(currentDate.getFullYear(), currentDate.getMonth() + 1, day)
    const currentStatus = getHabitStatus(day, habit)

    try {
      await fetch("/api/habit-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: currentPartner,
          habitName: habit,
          date,
          completed: !currentStatus,
        }),
      })

      // Reload data to get updated totals
      loadHabitData()
    } catch (error) {
      console.error("Error updating habit:", error)
    }
  }

  // Get habit status for a specific day
  const getHabitStatus = (day: number, habit: string) => {
    const date = formatDate(currentDate.getFullYear(), currentDate.getMonth() + 1, day)
    const entry = habitEntries.find((e) => e.habit_name === habit && e.date === date)
    return entry?.completed || false
  }

  // Get total for specific habit and user
  const getTotal = (habit: string, userName: string) => {
    const total = habitTotals.find((t) => t.habit_name === habit && t.user_name === userName)
    return total?.total || 0
  }

  // Add new habit
  const addNewHabit = async () => {
    if (!newHabitName.trim()) return

    try {
      await fetch("/api/manage-habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: currentPartner,
          action: "add",
          habitName: newHabitName.trim(),
        }),
      })

      setNewHabitName("")
      loadSettingsData()
      loadHabitData()
    } catch (error) {
      console.error("Error adding habit:", error)
    }
  }

  // Toggle habit activation
  const toggleHabitActivation = async (habit: string, isActive: boolean) => {
    try {
      await fetch("/api/manage-habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: currentPartner,
          action: "toggle",
          habitName: habit,
          isActive: !isActive,
        }),
      })

      loadSettingsData()
      loadHabitData()
    } catch (error) {
      console.error("Error toggling habit:", error)
    }
  }

  // Delete custom habit
  const deleteCustomHabit = async (habit: string) => {
    try {
      await fetch("/api/manage-habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: currentPartner,
          action: "delete",
          habitName: habit,
        }),
      })

      loadSettingsData()
      loadHabitData()
    } catch (error) {
      console.error("Error deleting habit:", error)
    }
  }

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }

    // Limit to 12 months in each direction
    const now = new Date()
    const monthsDiff = (newDate.getFullYear() - now.getFullYear()) * 12 + (newDate.getMonth() - now.getMonth())

    if (monthsDiff >= -12 && monthsDiff <= 12) {
      setCurrentDate(newDate)
    }
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysInMonth = getDaysInMonth(currentDate)

  // Partner selection screen
  if (!currentPartner) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Habit Tracker</h1>
          <p className="text-lg mb-8">Who are you?</p>
          <div className="space-y-4">
            <Button
              onClick={() => setCurrentPartner("Doro")}
              className="w-48 h-16 text-xl bg-white border-2 border-black text-black hover:bg-gray-100"
            >
              Doro
            </Button>
            <br />
            <Button
              onClick={() => setCurrentPartner("Ashant")}
              className="w-48 h-16 text-xl bg-white border-2 border-black text-black hover:bg-gray-100"
            >
              Ashant
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="border-black hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-normal">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            <p className="text-lg text-gray-600">{currentPartner}'s Habits</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="border-black hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="border-black hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Switch User Button */}
        <div className="text-center mb-6">
          <Button variant="outline" onClick={() => setCurrentPartner(null)} className="border-black hover:bg-gray-100">
            Switch User
          </Button>
        </div>

        {/* Habit Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header Row */}
            <div
              className={`grid gap-1 mb-2`}
              style={{ gridTemplateColumns: `60px repeat(${activeHabits.length}, 140px)` }}
            >
              <div className="font-medium text-center py-2 border-b border-black">Day</div>
              {activeHabits.map((habit) => (
                <div key={habit} className="font-medium text-center py-2 border-b border-black">
                  {habit}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <div
                key={day}
                className={`grid gap-1 border-t border-gray-200`}
                style={{ gridTemplateColumns: `60px repeat(${activeHabits.length}, 140px)` }}
              >
                <div className="text-center py-4 font-medium border-r border-gray-200">{day}</div>
                {activeHabits.map((habit) => (
                  <div key={habit} className="flex justify-center items-center py-4">
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={getHabitStatus(day, habit)}
                        onChange={() => toggleHabit(day, habit)}
                        className="w-6 h-6 accent-black"
                      />
                    </label>
                  </div>
                ))}
              </div>
            ))}

            {/* Totals Row - Both Users */}
            <div
              className={`grid gap-1 border-t-2 border-black mt-4`}
              style={{ gridTemplateColumns: `60px repeat(${activeHabits.length}, 140px)` }}
            >
              <div className="text-center py-4 font-bold border-r border-black">
                <div>Doro</div>
                <div>Ashant</div>
              </div>
              {activeHabits.map((habit) => (
                <div key={habit} className="text-center py-4 font-bold">
                  <div className="text-lg">{getTotal(habit, "Doro")}</div>
                  <div className="text-lg">{getTotal(habit, "Ashant")}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Tap checkboxes to mark habits as completed</p>
          <p>Totals show both Doro and Ashant's progress</p>
          <p>Reload to see updates from your partner</p>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Habit Settings</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="border-black hover:bg-gray-100"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Add New Habit</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      placeholder="Enter habit name..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      onKeyPress={(e) => e.key === "Enter" && addNewHabit()}
                    />
                    <Button
                      onClick={addNewHabit}
                      disabled={!newHabitName.trim()}
                      className="bg-black text-white hover:bg-gray-800 px-4"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Select Active Habits</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {allHabits.map((habit) => (
                      <div key={habit.name} className="flex items-center justify-between">
                        <label className="flex items-center space-x-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={habit.is_active}
                            onChange={() => toggleHabitActivation(habit.name, habit.is_active)}
                            className="w-5 h-5 accent-black"
                          />
                          <span className="text-lg">{habit.name}</span>
                        </label>
                        {habit.is_custom && (
                          <Button
                            onClick={() => deleteCustomHabit(habit.name)}
                            variant="outline"
                            size="sm"
                            className="ml-2 text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button onClick={() => setShowSettings(false)} className="bg-black text-white hover:bg-gray-800 px-6">
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
