import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase.from("stadiums").select("*")

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching stadiums:", error)
    return NextResponse.json({ error: "Failed to fetch stadiums" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, sportId } = await request.json()

    const { data, error } = await supabase
      .from("stadiums")
      .insert([{ name, sport_id: sportId, enabled: true }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating stadium:", error)
    return NextResponse.json({ error: "Failed to create stadium" }, { status: 500 })
  }
}
