import { z } from "zod";

export const checkInSchema = z.object({
  plateNumber: z.string().trim().min(3, "Nomor plat minimal 3 karakter").max(15, "Nomor plat maksimal 15 karakter"),
});
