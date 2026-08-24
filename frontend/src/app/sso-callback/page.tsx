import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary, #0a0a0a)",
      color: "var(--text-primary, #ffffff)"
    }}>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
