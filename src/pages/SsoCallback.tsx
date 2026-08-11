import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

const SsoCallback = () => (
  <main className="min-h-screen bg-background grid place-items-center px-6">
    <div className="text-center space-y-3">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Completing secure sign in…</p>
      <AuthenticateWithRedirectCallback />
    </div>
  </main>
);

export default SsoCallback;