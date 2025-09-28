"use client";

import { useEffect, useMemo, useState } from "react";
import { hasEmailProvider } from "@/lib/email/providers";
import { getBrandLogo } from "@/lib/brandLogo";
import { useRouter } from "next/navigation";
import { isToolEnabled } from '@/lib/launch';
import { ComingSoon } from '@/components/ComingSoon';
import PageShell from '@/components/PageShell';

type Thread = {
  id: string;
  brand?: { name?: string; domain?: string };
  subject: string;
  snippet: string;
  dealId?: string;
  updatedAt?: string; // ISO
  messages?: Array<{ id: string; from: string; at: string; text: string }>;
};

export default function OutreachInboxPage() {
  const enabled = isToolEnabled("inbox")
  
  if (!enabled) {
    return (
      <PageShell title="Outreach Inbox" subtitle="Review replies and keep the conversation moving.">
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="Outreach Inbox"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      </PageShell>
    )
  }

  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const providerAvailable = hasEmailProvider();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        // If you have a real endpoint, keep it.
        // Soft fallback to mock when provider is missing or fetch fails.
        const r = await fetch("/api/outreach/threads", { cache: "no-store" });
        if (!r.ok) throw new Error(`threads_non_ok_${r.status}`);
        const data = (await r.json()) as { items?: Thread[] };
        if (alive) setThreads(data.items ?? []);
      } catch {
        if (alive) {
          // Lightweight mock so the UI always feels alive
          setThreads([
            {
              id: "t_mock_1",
              brand: { name: "Acme Co", domain: "acme.com" },
              subject: "Re: Collab idea for Q4",
              snippet:
                "Hey! Loved your latest TikTok—could we explore a Q4 collab? Budget is flexible…",
              updatedAt: new Date().toISOString(),
              dealId: "deal_mock_1",
              messages: [
                {
                  id: "m1",
                  from: "brand@acme.com",
                  at: new Date().toISOString(),
                  text:
                    "Hey! Loved your latest TikTok—could we explore a Q4 collab? Budget is flexible…",
                },
              ],
            },
          ]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const banner = useMemo(() => {
    if (providerAvailable) return null;
    return (
      <div className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--tint-warn)] p-3">
        <div className="text-sm font-medium">Email not connected</div>
        <div className="mt-1 text-sm">
          Connect your email (coming soon) to send from your domain. Replies you
          write here will be saved to your CRM as notes for now.
        </div>
      </div>
    );
  }, [providerAvailable]);

  async function handleReply(threadId: string, dealId?: string) {
    const text = (replyText[threadId] ?? "").trim();
    if (!text) return;

    // Optimistic append
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [
                ...(t.messages ?? []),
                {
                  id: "local-" + Date.now(),
                  from: "me",
                  at: new Date().toISOString(),
                  text,
                },
              ],
            }
          : t
      )
    );
    setReplyText((p) => ({ ...p, [threadId]: "" }));

    try {
      const r = await fetch("/api/outreach/inbox/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          dealId,
          text,
          providerAvailable,
        }),
      });
      // Don't crash on errors; the UI already staged the message.
      // Optionally toast on failure:
      if (!r.ok) {
        // eslint-disable-next-line no-console
        console.warn("reply_non_ok", r.status);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("reply_failed", e);
    }
  }

  return (
    <PageShell title="Outreach Inbox" subtitle="Review replies and keep the conversation moving.">
      <div className="container-page py-6 lg:py-8">

      {banner}

      {loading ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          Loading threads…
        </div>
      ) : threads.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <div className="text-sm text-[var(--muted-fg)]">
            No threads yet. They'll show up here after your first outreach.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <img
                    src={getBrandLogo(t.brand?.domain)}
                    alt={t.brand?.name ?? "Brand"}
                    width={32}
                    height={32}
                    className="rounded border border-[var(--border)] object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium leading-5">
                        {t.brand?.name ?? "Unknown Brand"}
                      </span>
                      <span className="rounded bg-[var(--tint-accent)] px-1.5 py-0.5 text-[10px]">
                        Thread
                      </span>
                    </div>
                    <div className="truncate text-[13px] leading-5">
                      {t.subject}
                    </div>
                    <div className="truncate text-xs text-[var(--muted-fg)]">
                      {t.snippet}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-[11px] leading-4 text-[var(--muted-fg)]">
                    Updated
                  </div>
                  <div className="text-[13px] leading-5">
                    {t.updatedAt
                      ? new Date(t.updatedAt).toLocaleString()
                      : "—"}
                  </div>
                </div>
              </div>

              {/* Messages */}
              {t.messages?.length ? (
                <div className="mt-3 space-y-2">
                  {t.messages.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-[12px] font-medium">{m.from}</div>
                        <div className="text-[11px] text-[var(--muted-fg)]">
                          {new Date(m.at).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-1 text-sm leading-5">{m.text}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Inline reply */}
              <div className="mt-3 border-t border-[var(--border)] pt-3">
                {!providerAvailable && (
                  <div className="mb-2 text-xs text-[var(--muted-fg)]">
                    Reply will be saved to CRM as a note (email sending
                    disabled).
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <textarea
                    value={replyText[t.id] ?? ""}
                    onChange={(e) =>
                      setReplyText((p) => ({ ...p, [t.id]: e.target.value }))
                    }
                    placeholder="Write a quick reply…"
                    className="min-h-[72px] w-full rounded-md border border-[var(--border)] bg-[var(--card)] p-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleReply(t.id, t.dealId)}
                    className="h-9 shrink-0 rounded-md border border-[var(--border)] bg-[var(--brand-600)] px-3 text-sm font-medium text-white hover:opacity-90"
                  >
                    {providerAvailable ? "Send" : "Save note"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </PageShell>
  );
}
