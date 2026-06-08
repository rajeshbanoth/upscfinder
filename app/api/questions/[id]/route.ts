import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Question from "@/models/Question";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }   // ✅ type as Promise
) {
  try {
    await dbConnect();
    const { id } = await params;                    // ✅ await the Promise
    const question = await Question.findById(id).lean();
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    return NextResponse.json(question);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}