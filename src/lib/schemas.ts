import { z } from "zod";

export const newDocumentSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be under 150 characters"),
  content: z
    .string()
    .min(20, "Paste in at least a few sentences so summarization has something to work with"),
});

export type NewDocumentInput = z.infer<typeof newDocumentSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const searchSchema = z.object({
  query: z.string().min(2, "Type at least 2 characters to search"),
});

export type SearchInput = z.infer<typeof searchSchema>;
