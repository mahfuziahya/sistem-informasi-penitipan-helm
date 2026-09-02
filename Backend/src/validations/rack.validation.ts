import { z } from "zod";

export const createRackSchema = z.object({
  code: z.string().trim().min(2, "Kode rak minimal 2 karakter").max(20, "Kode rak maksimal 20 karakter"),
});

export const updateRackStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "INACTIVE"]),
});
