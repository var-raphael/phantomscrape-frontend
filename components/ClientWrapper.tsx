"use client";
import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import AuthModal from "@/components/AuthModal";
import { getKey } from "@/lib/auth";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const key = getKey();
    if (key) setAuthed(true);
    setChecking(false);
  }, []);

  if (checking) return null;

  return (
    <>
      {!authed && <AuthModal onAuth={() => setAuthed(true)} />}
      <Nav />
      <main className="pt-14">{children}</main>
    </>
  );
}