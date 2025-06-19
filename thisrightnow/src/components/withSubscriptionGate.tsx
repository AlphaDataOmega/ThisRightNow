import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";

export function withSubscriptionGate(Component: any) {
  return function GatedComponent(props: any) {
    const { hasAccess, isLoading } = useSubscriptionAccess();

    if (isLoading) return <div>Loading subscription status...</div>;
    if (!hasAccess) return <div>This content is for subscribers only.</div>;

    return <Component {...props} />;
  };
}
