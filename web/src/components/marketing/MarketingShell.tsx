import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";

type Props = {
  children: React.ReactNode;
  active?: string;
};

export function MarketingShell({ children, active }: Props) {
  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col">
      <MarketingHeader active={active} />
      <main className="w-full pt-16 bg-surface flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
