import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase.from("bookings").select(`
        *,
        stadiums:stadium_id (name, sport_id),
        time_slots:time_slot_id (time, period)
      `)

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, stadiumId, date, timeSlotId } = await request.json()

    // Check if booking already exists
    const { data: existingBooking, error: checkError } = await supabase
      .from("bookings")
      .select("*")
      .eq("stadium_id", stadiumId)
      .eq("date", date)
      .eq("time_slot_id", timeSlotId)
      .maybeSingle()

    if (checkError) {
      throw checkError
    }

    if (existingBooking) {
      return NextResponse.json({ error: "This time slot is already booked for this stadium" }, { status: 400 })
    }

    // Create new booking
    const { data, error } = await supabase
      .from("bookings")
      .insert([{ user_id: userId, stadium_id: stadiumId, date, time_slot_id: timeSlotId }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
