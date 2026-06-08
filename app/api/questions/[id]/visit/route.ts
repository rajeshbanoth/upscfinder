import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Question from "@/models/Question";

// ✅ New way (Next.js 15+)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;  // 👈 await the params Promise
  await dbConnect();
  await Question.findByIdAndUpdate(id, { $inc: { visitorCount: 1 } });
  return NextResponse.json({ success: true });
}