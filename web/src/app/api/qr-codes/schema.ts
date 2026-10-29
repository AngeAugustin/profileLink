import { z } from "zod";
import { qrStyleSchema } from "@/lib/qr-style";
import { isHttpUrl } from "@/lib/qr-codes";

const destination = z.string().trim().min(1).max(2048).refine(isHttpUrl);

export const createQrSchema = z.object({
  name: z.string().trim().min(1).max(80),
  destination,
  dynamic: z.boolean(),
  style: qrStyleSchema,
});

export const updateQrSchema = createQrSchema.partial();
