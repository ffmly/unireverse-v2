import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase.from("time_slots").select("*")

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching time slots:", error)
    return NextResponse.json({ error: "Failed to fetch time slots" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { time, period } = await request.json()

    // Check if time slot already exists
    const { data: existingSlot, error: checkError } = await supabase
      .from("time_slots")
      .select("*")
      .eq("time", time)
      .eq("period", period)
      .maybeSingle()

    if (checkError) {
      throw checkError
    }

    if (existingSlot) {
      return NextResponse.json({ error: "Time slot already exists" }, { status: 400 })
    }

    // Insert new time slot
    const { data, error } = await supabase
      .from("time_slots")
      .insert([{ time, period, enabled: true }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating time slot:", error)
    return NextResponse.json({ error: "Failed to create time slot" }, { status: 500 })
  }
}
