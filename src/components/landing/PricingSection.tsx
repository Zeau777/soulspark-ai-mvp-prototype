import React from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
interface PricingSectionProps {
  id?: string;
  showHeader?: boolean;
  selectedPlan?: 'starter' | 'growth' | 'enterprise';
}
const features = {
  starter: ["Personalized SoulDrops", "24/7 AI well-being support", "Mobile, Slack, and Teams access", "Engagement tracking"],
  growth: ["Everything in Starter", "Priority onboarding", "Advanced engagement insights"],
  enterprise: ["Everything in Growth", "White-label branding", "Advanced analytics", "API integration"]
};
const item = (text: string) => <li key={text} className="flex items-start gap-3">
    <Check className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
    <span>{text}</span>
  </li>;
const PricingSection: React.FC<PricingSectionProps> = ({
  id,
  showHeader = true,
  selectedPlan
}) => {
  return <section id={id} className="w-full pt-8 md:pt-16 pb-16 md:pb-24 bg-background">
      <div className="container">
        {showHeader && <header className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Pricing Plans
            </h2>
            <p className="mt-4 text-muted-foreground">Choose the plan that fits your organization and unlock 60-second-a-day purpose-driven well-being for your people.</p>
          </header>}

        {/* Primary 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Starter */}
          <article className="relative">
            <Card className={`h-full ${selectedPlan === 'starter' ? 'border-accent ring-2 ring-accent/40 shadow-spiritual' : 'border-border/60'}`}>
              <CardHeader>
                <CardTitle className="text-xl">Starter</CardTitle>
                <p className="text-sm text-muted-foreground">Small to mid-size companies</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">$6</span>
                  <span className="text-muted-foreground">/ seat / month</span>
                </div>
                <p className="text-xs text-muted-foreground">2–250 seats</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-sm">
                  {features.starter.map(item)}
                </ul>
                <Button asChild className="w-full" variant="spiritual">
                  <a href="/partners?plan=starter#partner-plans">Choose Starter</a>
                </Button>
              </CardContent>
            </Card>
          </article>

          {/* Growth - highlighted */}
          <article className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="rounded-full bg-accent/20 text-accent-foreground border border-accent/30 px-3 py-1 text-xs font-semibold shadow-sm">
                Most Popular
              </span>
            </div>
            <Card className={`h-full ${selectedPlan === 'growth' ? 'border-accent ring-2 ring-accent/40 shadow-spiritual' : 'border-accent shadow-spiritual'}`}>
              <CardHeader>
                <CardTitle className="text-xl">Growth</CardTitle>
                <p className="text-sm text-muted-foreground">Growing organizations</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">$8</span>
                  <span className="text-muted-foreground">/ seat / month</span>
                </div>
                <p className="text-xs text-muted-foreground">251–1,000 seats</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-sm">
                  {features.growth.map(item)}
                </ul>
                <Button asChild className="w-full" variant="default">
                  <a href="/partners?plan=growth#partner-plans">Choose Growth</a>
                </Button>
              </CardContent>
            </Card>
          </article>

          {/* Enterprise */}
          <article className="relative">
            <Card className={`h-full ${selectedPlan === 'enterprise' ? 'border-accent ring-2 ring-accent/40 shadow-spiritual' : 'border-border/60'}`}>
              <CardHeader>
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <p className="text-sm text-muted-foreground">Large companies & global teams</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">$12</span>
                  <span className="text-muted-foreground">/ seat / month</span>
                </div>
                <p className="text-xs text-muted-foreground">1,001+ seats</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-sm">
                  {features.enterprise.map(item)}
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <a href="/partners?plan=enterprise#partner-plans">Choose Enterprise</a>
                </Button>
              </CardContent>
            </Card>
          </article>
        </div>

        {/* Industry plans */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <article className="relative">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Colleges</CardTitle>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold">$5</span>
                  <span className="text-muted-foreground">/ student / month</span>
                </div>
                <p className="text-xs text-muted-foreground">Minimum 1,000 students</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  {["Campus-wide well-being programs", "Engagement analytics", "Student community features"].map(item)}
                </ul>
                <Button className="w-full" variant="default" onClick={() => {
                window.location.href = 'mailto:partners@mysoulsparkai.com?subject=College%20Partnership%20Inquiry';
              }}>
                  Contact Campus Team
                </Button>
              </CardContent>
            </Card>
          </article>

          <article className="relative">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Sports Teams</CardTitle>
                <p className="text-sm text-muted-foreground">College & Pro</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div><span className="font-semibold">College Teams</span> – $4 / athlete / month</div>
                  <div><span className="font-semibold">Pro Teams</span> – $10 / athlete / month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  {["Team-specific motivation tracks", "Performance mindset modules", "Engagement analytics"].map(item)}
                </ul>
                <Button className="w-full" variant="outline" onClick={() => {
                window.location.href = 'mailto:partners@mysoulsparkai.com?subject=Sports%20Partnership%20Inquiry';
              }}>
                  Talk to Sports Team
                </Button>
              </CardContent>
            </Card>
          </article>
        </div>

        {/* Add-ons */}
        <div className="mt-12 md:mt-16">
          <h3 className="text-xl font-semibold mb-4">Premium Add-Ons (Any Plan)</h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {["Advanced AI coaching & emotional intelligence modules", "Custom cultural and faith-aligned content", "API integrations with HR/wellness systems"].map(t => <li key={t} className="flex items-start gap-3 p-4 rounded-lg border bg-card text-card-foreground">
                <Check className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                <span>{t}</span>
              </li>)}
          </ul>
        </div>

        {/* Included in all plans */}
        <aside className="mt-12 md:mt-16">
          <div className="rounded-xl border bg-popover p-6 md:p-8">
            <h4 className="text-lg font-semibold mb-3">All plans include</h4>
            <p className="text-sm text-muted-foreground">
              Daily 60-second "SoulDrops" • 24/7 AI-powered support • Mobile, Slack, and Teams access • Impact dashboard to track real-world change
            </p>
          </div>
        </aside>
      </div>
    </section>;
};
export default PricingSection;