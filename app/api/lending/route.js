import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    const res = await query(`
      SELECT 
        id, 
        "borrowerName", 
        phone, 
        amount::float, 
        "lentDate", 
        notes, 
        "isRecovered", 
        "recoveredAt", 
        "createdAt"
      FROM "MoneyLent"
      WHERE "userId" = $1
      ORDER BY "isRecovered" ASC, "lentDate" DESC
    `, [userId]);

    const now = new Date();
    let totalFrozen = 0;
    let totalRecovered = 0;

    const enriched = res.rows.map((loan) => {
      const amount = parseFloat(loan.amount) || 0;
      if (loan.isRecovered) {
        totalRecovered += amount;
      } else {
        totalFrozen += amount;
      }

      const lentDate = new Date(loan.lentDate || loan.createdAt);
      const daysAgo = Math.max(0, Math.floor((now.getTime() - lentDate.getTime()) / (1000 * 60 * 60 * 24)));

      // Generate a ready-to-use WhatsApp gentle nudge URL
      let whatsappUrl = null;
      if (loan.phone) {
        const cleanPhone = loan.phone.replace(/[^0-9]/g, "");
        const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const msg = encodeURIComponent(
          `Hi ${loan.borrowerName}, hope you're doing well! Just a gentle follow-up regarding the ₹${amount.toLocaleString("en-IN")} lent on ${lentDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}. Let me know whenever it's convenient for you. Thank you!`
        );
        whatsappUrl = `https://wa.me/${formattedPhone}?text=${msg}`;
      }

      return {
        ...loan,
        amount,
        daysAgo,
        whatsappUrl,
      };
    });

    return NextResponse.json({
      moneyLent: enriched,
      totalFrozen,
      totalRecovered,
    });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Lending GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    const body = await req.json();
    const { borrowerName, phone = null, amount, lentDate = null, notes = null } = body;

    if (!borrowerName || !amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Borrower name and valid amount are required" }, { status: 400 });
    }

    const cleanAmount = parseFloat(amount);
    const cleanLentDate = lentDate ? new Date(lentDate) : new Date();

    const insertRes = await query(`
      INSERT INTO "MoneyLent" (
        id, "userId", "borrowerName", phone, amount, "lentDate", notes, "isRecovered", "createdAt"
      )
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, false, NOW())
      RETURNING 
        id, "borrowerName", phone, amount::float, "lentDate", notes, "isRecovered", "createdAt"
    `, [
      userId,
      borrowerName.trim(),
      phone ? phone.trim() : null,
      cleanAmount,
      cleanLentDate,
      notes ? notes.trim() : null,
    ]);

    return NextResponse.json({
      success: true,
      loan: insertRes.rows[0],
    });
  } catch (err) {
    console.error("Lending POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    const body = await req.json();
    const { id, isRecovered, borrowerName, phone, amount, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Loan ID is required" }, { status: 400 });
    }

    if (isRecovered !== undefined) {
      const recoveredAt = isRecovered ? new Date() : null;
      const res = await query(`
        UPDATE "MoneyLent"
        SET 
          "isRecovered" = $1,
          "recoveredAt" = $2
        WHERE id = $3 AND "userId" = $4
        RETURNING *
      `, [Boolean(isRecovered), recoveredAt, id, userId]);

      return NextResponse.json({ success: true, loan: res.rows[0] });
    }

    // General field update
    const updateRes = await query(`
      UPDATE "MoneyLent"
      SET 
        "borrowerName" = COALESCE($1, "borrowerName"),
        phone = COALESCE($2, phone),
        amount = COALESCE($3, amount),
        notes = COALESCE($4, notes)
      WHERE id = $5 AND "userId" = $6
      RETURNING *
    `, [borrowerName, phone, amount ? parseFloat(amount) : null, notes, id, userId]);

    return NextResponse.json({ success: true, loan: updateRes.rows[0] });
  } catch (err) {
    console.error("Lending PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Loan ID required" }, { status: 400 });
    }

    await query(`DELETE FROM "MoneyLent" WHERE id = $1 AND "userId" = $2`, [id, userId]);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("Lending DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}