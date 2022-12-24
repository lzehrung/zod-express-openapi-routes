import { z } from "zod";

/** Ensure string value is numeric. */
export const numericString = (): z.ZodNumber => z.coerce.number();

