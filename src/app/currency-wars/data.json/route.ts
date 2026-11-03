import { CURRENCY_WARS } from "@/db/seed-data";

export const dynamic = "force-static";

export function GET() {
  return Response.json(CURRENCY_WARS);
}
