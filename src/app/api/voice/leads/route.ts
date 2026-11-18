// -----------------------------------------------------------------------------
// GET /api/voice/leads
// Lead list for the on-page panel.
//
// Phone numbers are masked unless the request carries the admin token, so the
// public page never exposes customer contact details.
// -----------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { listLeads, maskPhone } from "@/lib/voice/leadStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const adminToken = process.env.VOICE_ADMIN_TOKEN || "";
  const provided =
    req.headers.get("x-voice-admin") ?? req.nextUrl.searchParams.get("token") ?? "";
  const authorised = !adminToken || provided === adminToken;

  const leads = await listLeads(25);

  return NextResponse.json({
    locked: Boolean(adminToken) && !authorised,
    maskByDefault: true,
    count: leads.length,
    leads: leads.map((lead) => ({
      id: lead.id,
      callSid: lead.callSid,
      name: authorised ? lead.name : lead.name.slice(0, 1) + "••",
      phone: authorised ? lead.phone : maskPhone(lead.phone),
      language: lead.language,
      createdAt: lead.createdAt,
      customerType: lead.customerType,
      loanType: lead.loanType,
      amountRequired: lead.amountRequired,
      monthlyIncome: lead.monthlyIncome,
      existingObligations: lead.existingObligations,
      employmentDetails: lead.employmentDetails,
      city: lead.city,
      cibil: lead.cibil,
      foir: lead.foir,
      intent: lead.intent,
      score: lead.score,
      summary: lead.summary,
      recommendedProducts: lead.recommendedProducts,
      nextAction: lead.nextAction,
    })),
  });
}
