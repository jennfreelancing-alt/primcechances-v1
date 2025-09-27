import { PricingCard } from "@/components/ui/pricing";

export default function PricingDemo() {
  return (
    <section className="py-16 md:py-32" id="pricing">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto flex max-w-3xl flex-col text-left md:text-center">
          <h2 className="mb-3 text-3xl font-semibold md:mb-4 lg:mb-6 lg:text-4xl">
            Plans made for every inbox
          </h2>
          <p className="text-muted-foreground lg:text-lg mb-6 md:mb-8 lg:mb-12">
            Start managing all your email accounts in one place. Upgrade anytime as your needs grow.
          </p>
        </div>

        <div className="rounded-xl flex flex-col justify-between border p-1">
          <div className="flex flex-col gap-4 md:flex-row">
            <PricingCard
              title="Free"
              price="$0 / mo"
              description="Ideal to test the unified inbox experience"
              buttonVariant="outline"
              features={[
                "Connect up to 2 email accounts",
                "Unified inbox interface",
                "Read & search emails",
                "Basic spam filtering",
                "Email support",
              ]}
            />

            <PricingCard
              title="Pro"
              price="$19 / mo"
              description="For professionals managing multiple accounts"
              buttonVariant="default"
              highlight
              features={[
                "Connect unlimited email accounts",
                "Send emails from any connected address",
                "Smart labels & filters",
                "Real-time sync with Gmail, Outlook, iCloud",
                "Advanced search & filters",
                "Mobile app access",
                "Priority email support",
                "Custom signatures per account",
                "Attachment previews",
                "Daily backup of inboxes",
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
} 