// apps/web/app/sites/error.tsx
"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur /sites", error);
  }, [error]);

  return (
    <main style={{ padding: 16 }}>
      <h1>Erreur sur /sites</h1>
      <p>Digest: {error?.digest ?? "n/a"}</p>
      <button onClick={() => reset()}>Réessayer</button>
    </main>
  );
}
