"use client";
import { useEffect, useRef } from "react";
import { browserClient } from "@/lib/supabase-browser";

export default function Home() {
  const app = useRef<HTMLDivElement>(null);
  const fab = useRef<HTMLDivElement>(null);
  const toast = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unmount: (() => void) | undefined;
    let cancelled = false;
    import("@/lib/aloiz-app").then(({ mount }) => {
      if (cancelled || !app.current || !fab.current || !toast.current) return;
      unmount = mount({
        supabase: browserClient(),
        inboundAddress: process.env.NEXT_PUBLIC_INBOUND_ADDRESS || "",
        appEl: app.current, fabEl: fab.current, toastEl: toast.current,
      });
    });
    return () => { cancelled = true; unmount?.(); };
  }, []);

  return (
    <>
      <div className="app" ref={app} />
      <div className="fab" ref={fab} />
      <div className="toast" ref={toast} role="status" hidden />
    </>
  );
}
