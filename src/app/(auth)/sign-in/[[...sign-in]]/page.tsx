import { SignIn } from "@clerk/nextjs";
import { safeRedirectPath } from "@/lib/safe-redirect";

type Props = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const { redirect_url } = await searchParams;
  const afterSignIn = safeRedirectPath(redirect_url);

  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      fallbackRedirectUrl={afterSignIn}
      signUpFallbackRedirectUrl="/dashboard"
    />
  );
}
