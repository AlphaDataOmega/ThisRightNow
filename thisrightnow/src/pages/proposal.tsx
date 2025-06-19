import { withSubscriptionGate } from "@/components/withSubscriptionGate";
import { ProposalCard } from "@/components/ProposalCard";
import { useProposalData } from "@/hooks/useProposalData";

function ProposalPage() {
  const { proposals, isLoading } = useProposalData();

  if (isLoading) return <div className="p-6">Loading proposals...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Active Proposals</h1>
      {proposals.length === 0 && <div>No proposals found.</div>}
      {proposals.map((p) => (
        <ProposalCard key={p.id} proposal={p} />
      ))}
    </div>
  );
}

export default withSubscriptionGate(ProposalPage);
