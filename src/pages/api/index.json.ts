import { db, Users } from "astro:db";

export async function GET() {
  const data = await db.select().from(Users);
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
