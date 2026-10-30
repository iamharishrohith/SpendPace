import { query } from "@/lib/db";
import { planCashflowChat } from "@/lib/ai";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";
import { getAuthenticatedUser } from "@/lib/auth";

async function getUserId(req) {
  const user = await getAuthenticatedUser(req);
  return user?.id || null;
}

/**
 * GET /api/ai/chat
 * Fetch all-time chat history for the user from PostgreSQL
 */
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ messages: [] });
    }

    const res = await query(
      `SELECT id, role, content, "actionData", "createdAt" 
       FROM "ChatMessage" 
       WHERE "userId" = $1 
       ORDER BY "createdAt" ASC`,
      [userId]
    );

    return NextResponse.json({ messages: res.rows });
  } catch (err) {
    console.error("AI Chat GET history error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/ai/chat
 * Clear all chat history for the user
 */
export async function DELETE(req) {
  try {
    const userId = await getUserId(req);
    if (userId) {
      await query(`DELETE FROM "ChatMessage" WHERE "userId" = $1`, [userId]);
    }
    return NextResponse.json({ success: true, message: "Chat history cleared" });
  } catch (err) {
    console.error("AI Chat DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/ai/chat
 * Autonomous chat & voice execution endpoint with memory and tool calling
 */
export async function POST(req) {
  try {
    const { messages = [], message = "" } = await req.json();

    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "User session not found" }, { status: 401 });
    }

    // Determine the latest user input
    let latestUserText = message;
    if (!latestUserText && messages.length > 0) {
      const lastItem = messages[messages.length - 1];
      if (lastItem.role === "user") {
        latestUserText = lastItem.content;
      }
    }

    if (!latestUserText) {
      return NextResponse.json({ error: "No user message provided" }, { status: 400 });
    }

    // 1. Persist the user message into PostgreSQL ChatMessage
    await query(
      `INSERT INTO "ChatMessage" (id, "userId", role, content, "createdAt")
       VALUES (gen_random_uuid(), $1, 'user', $2, NOW())`,
      [userId, latestUserText]
    );

    // 2. Fetch past conversation turns for memory continuity (last 20 turns)
    const historyRes = await query(
      `SELECT role, content 
       FROM "ChatMessage" 
       WHERE "userId" = $1 
       ORDER BY "createdAt" DESC 
       LIMIT 20`,
      [userId]
    );
    const conversationMemory = historyRes.rows.reverse();

    // 3. Fetch user live telemetry context
    const [uRes, liabRes, goalsRes] = await Promise.all([
      query(`SELECT "monthlyIncome"::float, COALESCE("partTimeIncome", 0)::float as "partTimeIncome" FROM "User" WHERE id = $1`, [userId]),
      query(`SELECT name, "monthlyPayment"::float FROM "Liability" WHERE "userId" = $1`, [userId]),
      query(`SELECT title, "targetAmount"::float, "currentAmount"::float FROM "Goal" WHERE "userId" = $1`, [userId]),
    ]);

    const u = uRes.rows[0] || {};
    let monthly = parseFloat(u.monthlyIncome) || 0;
    let partTime = parseFloat(u.partTimeIncome) || 0;
    let totalInflow = monthly + partTime;
    const liabilities = liabRes.rows || [];
    const totalDebt = liabilities.reduce((s, l) => s + (parseFloat(l.monthlyPayment) || 0), 0);
    let safeDaily = Math.round(Math.max(0, totalInflow - (totalDebt + 24000)) / 30);

    const context = {
      monthlyIncome: monthly,
      partTimeIncome: partTime,
      totalHouseholdInflow: totalInflow,
      safeDaily,
      liabilities,
      goals: goalsRes.rows || [],
    };

    // 4. Run Groq Planner Chat & Action Extraction
    const { text: cleanReply, action } = await planCashflowChat({
      messages: conversationMemory,
      context,
    });

    let actionExecuted = null;

    // 5. Execute Autonomous Actions in Database if requested
    if (action && action.type) {
      try {
        if (action.type === "LOG_EXPENSE" && action.amount) {
          const expenseAmount = parseFloat(action.amount);

          // Find or fallback category
          let catRes = await query(
            `SELECT id, name FROM "Category" WHERE "userId" = $1 AND LOWER(name) = LOWER($2) LIMIT 1`,
            [userId, action.category || "Dining & Food"]
          );
          if (!catRes.rows.length) {
            catRes = await query(`SELECT id, name FROM "Category" WHERE "userId" = $1 LIMIT 1`, [userId]);
          }
          const categoryId = catRes.rows[0]?.id;
          const categoryName = catRes.rows[0]?.name || action.category || "Expense";

          // Find default account
          let accRes = await query(`SELECT id FROM "Account" WHERE "userId" = $1 AND "isDefault" = true LIMIT 1`, [userId]);
          if (!accRes.rows.length) {
            accRes = await query(`SELECT id FROM "Account" WHERE "userId" = $1 LIMIT 1`, [userId]);
          }
          const accountId = accRes.rows[0]?.id;

          if (categoryId && accountId) {
            const txRes = await query(
              `INSERT INTO "Transaction" (id, "userId", "accountId", "categoryId", amount, type, description, "transactionDate", source)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, 'EXPENSE', $5, NOW(), 'RECEIPT_OCR')
               RETURNING id, description, amount::float, "transactionDate"`,
              [userId, accountId, categoryId, expenseAmount, action.description || "Voice Logged Expense"]
            );

            // Deduct from account balance
            await query(`UPDATE "Account" SET balance = balance - $1 WHERE id = $2`, [expenseAmount, accountId]);

            actionExecuted = {
              type: "LOG_EXPENSE",
              amount: expenseAmount,
              category: categoryName,
              description: action.description || "Expense",
              transactionId: txRes.rows[0]?.id,
            };
          }
        } else if (action.type === "LOG_PART_TIME_INCOME" && action.amount) {
          const gigAmount = parseFloat(action.amount);

          // Update User.partTimeIncome
          const updatedUserRes = await query(
            `UPDATE "User" 
             SET "partTimeIncome" = COALESCE("partTimeIncome", 0) + $1 
             WHERE id = $2 
             RETURNING "partTimeIncome"::float`,
            [gigAmount, userId]
          );
          partTime = updatedUserRes.rows[0]?.partTimeIncome || (partTime + gigAmount);
          totalInflow = monthly + partTime;
          safeDaily = Math.round(Math.max(0, totalInflow - (totalDebt + 24000)) / 30);

          // Also insert an INCOME transaction
          let catRes = await query(`SELECT id FROM "Category" WHERE "userId" = $1 LIMIT 1`, [userId]);
          let accRes = await query(`SELECT id FROM "Account" WHERE "userId" = $1 LIMIT 1`, [userId]);
          const categoryId = catRes.rows[0]?.id;
          const accountId = accRes.rows[0]?.id;

          if (accountId && categoryId) {
            await query(
              `INSERT INTO "Transaction" (id, "userId", "accountId", "categoryId", amount, type, description, "transactionDate", source)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, 'INCOME', $5, NOW(), 'MANUAL')`,
              [userId, accountId, categoryId, gigAmount, `Part-Time Gig: ${action.source || 'Earnings'}`]
            );
            await query(`UPDATE "Account" SET balance = balance + $1 WHERE id = $2`, [gigAmount, accountId]);
          }

          actionExecuted = {
            type: "LOG_PART_TIME_INCOME",
            amount: gigAmount,
            source: action.source || "Gig Delivery",
            newTotalPartTime: partTime,
          };
        } else if (action.type === "CREATE_PLANNER_TASK" && action.title) {
          const taskAmount = parseFloat(action.amount) || 0;
          const plannerRes = await query(
            `INSERT INTO "PlannerEvent" (id, "userId", title, category, "targetAmount", "allocatedAmount", "isCompleted", "createdAt")
             VALUES (gen_random_uuid(), $1, $2, $3, $4, 0, false, NOW())
             RETURNING id, title, "targetAmount"::float`,
            [userId, action.title, action.category || "GENERAL", taskAmount]
          );

          actionExecuted = {
            type: "CREATE_PLANNER_TASK",
            title: action.title,
            amount: taskAmount,
            eventId: plannerRes.rows[0]?.id,
          };
        }

        // Invalidate Redis dashboard and spending patterns cache
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        await invalidateCache(
          `spendpace:dashboard:${userId}`,
          `spendpace:patterns:${userId}:${currentMonthKey}`,
          `spendpace:diagnostics:${userId}`
        );
      } catch (actionErr) {
        console.error("Action execution error:", actionErr);
      }
    }

    // 6. Persist the assistant response into PostgreSQL ChatMessage
    await query(
      `INSERT INTO "ChatMessage" (id, "userId", role, content, "actionData", "createdAt")
       VALUES (gen_random_uuid(), $1, 'assistant', $2, $3, NOW())`,
      [userId, cleanReply, actionExecuted ? JSON.stringify(actionExecuted) : null]
    );

    return NextResponse.json({
      reply: cleanReply,
      actionExecuted,
      telemetry: {
        safeDaily,
        partTimeIncome: partTime,
        totalHouseholdInflow: totalInflow,
      },
    });
  } catch (err) {
    console.error("AI Chat API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

