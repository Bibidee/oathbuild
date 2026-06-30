"use client";

import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getOath, getEvidence, getVerdict, getAppeals, requestAppealVerdict } from "@/lib/genlayer/client";
import { useWallet } from "@/lib/context/WalletContext";
import { Loader2 } from "lucide-react";
import PromiseChamber from "@/components/oath/PromiseChamber";
import OathTimeline from "@/components/oath/OathTimeline";
import EvidenceWall from "@/components/evidence/EvidenceWall";
import VerdictReceiptCard from "@/components/verdict/VerdictReceipt";
import ActionDock from "@/components/oath/ActionDock";
import AppealDrawer from "@/components/oath/AppealDrawer";
import EvidenceSubmitModal from "@/components/evidence/EvidenceSubmitModal";

interface Props {
  params: Promise<{ id: string }>;
}

export default function OathDetailPage({ params }: Props) {
  const { id } = use(params);
  const oathId = parseInt(id);
  const queryClient = useQueryClient();
  const { account, isConnected, connect } = useWallet();
  const [showReceipt, setShowReceipt] = useState(false);
  const [showAppeal, setShowAppeal] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [appealVerdictLoading, setAppealVerdictLoading] = useState<number | null>(null);

  const { data: oath, isLoading } = useQuery({
    queryKey: ["oath", oathId],
    queryFn: () => getOath(oathId),
    enabled: !isNaN(oathId),
    refetchInterval: (q) => q.state.data?.settled ? false : 6000,
  });

  const { data: evidence = [] } = useQuery({
    queryKey: ["evidence", oathId],
    queryFn: () => getEvidence(oathId),
    enabled: !isNaN(oathId),
    refetchInterval: (q) => q.state.data && (oath?.settled) ? false : 6000,
  });

  const { data: verdict } = useQuery({
    queryKey: ["verdict", oathId],
    queryFn: () => getVerdict(oathId),
    enabled: !isNaN(oathId),
    refetchInterval: (q) => q.state.data?.status && oath?.settled ? false : 6000,
  });

  const { data: appeals = [] } = useQuery({
    queryKey: ["appeals", oathId],
    queryFn: () => getAppeals(oathId),
    enabled: !isNaN(oathId),
    refetchInterval: oath?.settled ? false : 6000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="animate-spin text-signal-cyan" />
      </div>
    );
  }

  if (!oath) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-ink-grey">Oath #{oathId} not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen ledger-grid">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[220px_1fr_320px] gap-6">
          {/* Left: Timeline */}
          <div className="hidden lg:block">
            <div className="glass rounded-xl p-5 sticky top-20">
              <OathTimeline oath={oath} />
            </div>
          </div>

          {/* Centre: Promise Chamber + Verdict */}
          <div className="space-y-4">
            <PromiseChamber oath={oath} />

            {(showReceipt || oath.settled) && verdict && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <VerdictReceiptCard verdict={verdict} oath={oath} />
              </motion.div>
            )}

            {appeals.length > 0 && (
              <div className="glass rounded-xl p-5">
                <p className="font-mono text-xs text-ink-grey uppercase tracking-widest mb-3">
                  Appeals ({appeals.length})
                </p>
                <div className="space-y-3">
                  {appeals.map((ap) => (
                    <div key={ap.appeal_id} className="border border-glass-line rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-witness-gold capitalize">{ap.basis.replace(/_/g, " ")}</span>
                        <span className={`font-mono text-xs ${ap.resolved ? "text-verdict-green" : "text-partial-amber"}`}>
                          {ap.resolved ? "Resolved" : "Pending"}
                        </span>
                      </div>
                      <p className="text-sm text-ivory-record/80">{ap.argument}</p>
                      {!ap.resolved && (
                        <button
                          onClick={async () => {
                            if (!account) { connect(); return; }
                            setAppealVerdictLoading(ap.appeal_id);
                            try {
                              await requestAppealVerdict(oathId, ap.appeal_id, account);
                              await Promise.all([
                                queryClient.invalidateQueries({ queryKey: ["oath", oathId] }),
                                queryClient.invalidateQueries({ queryKey: ["verdict", oathId] }),
                                queryClient.invalidateQueries({ queryKey: ["appeals", oathId] }),
                                queryClient.invalidateQueries({ queryKey: ["all-oaths"] }),
                              ]);
                            } catch {
                              // error handled silently — polling will catch any state change
                            } finally {
                              setAppealVerdictLoading(null);
                            }
                          }}
                          disabled={appealVerdictLoading === ap.appeal_id}
                          className="flex items-center gap-2 px-3 py-1.5 border border-witness-gold/40 text-witness-gold hover:bg-witness-gold/10 transition-all font-mono text-xs rounded uppercase tracking-wider disabled:opacity-50"
                        >
                          {appealVerdictLoading === ap.appeal_id
                            ? <><Loader2 size={11} className="animate-spin" /> Requesting…</>
                            : isConnected ? "Request Appeal Verdict" : "Connect to Request"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Evidence Wall */}
          <div>
            <div className="glass rounded-xl p-5 sticky top-20">
              <p className="font-mono text-xs text-ink-grey uppercase tracking-widest mb-4">
                Evidence Wall ({evidence.length})
              </p>
              <EvidenceWall evidence={evidence} />
            </div>
          </div>
        </div>

        {/* Action Dock */}
        <div className="mt-6">
          <ActionDock
            oath={oath}
            evidenceCount={evidence.length}
            onSubmitEvidence={() => setShowEvidence(true)}
            onViewReceipt={() => setShowReceipt(true)}
            onAppeal={() => setShowAppeal(true)}
          />
        </div>
      </div>

      <EvidenceSubmitModal
        oathId={oathId}
        open={showEvidence}
        onClose={() => setShowEvidence(false)}
      />

      <AppealDrawer
        oathId={oathId}
        open={showAppeal}
        onClose={() => setShowAppeal(false)}
      />
    </div>
  );
}
