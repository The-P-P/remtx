/** Verifica se as chaves do Clerk foram configuradas (não são placeholders). */
export function isClerkConfigured(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!publishableKey || !secretKey) return false;

  const invalidPatterns = ["placeholder", "xxx", "your_", "pk_test_xxx", "sk_test_xxx"];
  const combined = `${publishableKey}${secretKey}`.toLowerCase();

  if (invalidPatterns.some((p) => combined.includes(p))) return false;

  const validPublishable =
    publishableKey.startsWith("pk_test_") || publishableKey.startsWith("pk_live_");
  const validSecret =
    secretKey.startsWith("sk_test_") || secretKey.startsWith("sk_live_");

  return validPublishable && validSecret && publishableKey.length > 20;
}
