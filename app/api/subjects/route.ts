import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Subject from "@/models/Subject";

export async function GET() {
  try {
    await dbConnect();
    const subjects = await Subject.find({ enabled: true }).sort({ name: 1 }).lean();
    return NextResponse.json(subjects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}