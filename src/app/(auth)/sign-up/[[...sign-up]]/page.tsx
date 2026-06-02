import { SignUp } from "@clerk/nextjs";
import { safeRedirectPath } from "@/lib/safe-redirect";

type Props = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  const { redirect_url } = await searchParams;
  const afterSignUp = safeRedirectPath(redirect_url);

  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      fallbackRedirectUrl={afterSignUp}
      signInFallbackRedirectUrl="/dashboard"
    />
  );
}
