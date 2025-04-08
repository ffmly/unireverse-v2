import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { enabled } = await request.json()
    const { id } = params

    const { data, error } = await supabase.from("time_slots").update({ enabled }).eq("id", id).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating time slot:", error)
    return NextResponse.json({ error: "Failed to update time slot" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { error } = await supabase.from("time_slots").delete().eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting time slot:", error)
    return NextResponse.json({ error: "Failed to delete time slot" }, { status: 500 })
  }
}
