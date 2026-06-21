"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeBlock } from "@/components/ui/code-block";
import { InlineCode } from "@/components/ui/inline-code";
import { Callout } from "@/components/ui/callout";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="border-b border-hairline-soft pb-2">{title}</h2>
      {children}
    </section>
  );
}

function ColorSwatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="size-10 rounded-md border border-hairline shrink-0"
        style={{ backgroundColor: hex }}
      />
      <div>
        <div className="text-sm font-semibold text-ink">{name}</div>
        <div className="font-mono text-xs text-mute">{hex}</div>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center border-b border-hairline bg-canvas px-6">
        <h1 className="text-xl font-bold text-ink">
          LLM Flow Studio — Design System
        </h1>
      </header>

      <main className="mx-auto max-w-[1280px] space-y-20 px-6 py-10">
        {/* Colors */}
        <Section title="Colors">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            <ColorSwatch name="Canvas" hex="#eeefe9" />
            <ColorSwatch name="Surface Card" hex="#ffffff" />
            <ColorSwatch name="Surface Doc" hex="#fcfcfa" />
            <ColorSwatch name="Surface Soft" hex="#e5e7e0" />
            <ColorSwatch name="Surface Dark" hex="#23251d" />
            <ColorSwatch name="Ink" hex="#23251d" />
            <ColorSwatch name="Body" hex="#4d4f46" />
            <ColorSwatch name="Muted" hex="#6c6e63" />
            <ColorSwatch name="Ash" hex="#9b9c92" />
            <ColorSwatch name="Stone" hex="#b6b7af" />
            <ColorSwatch name="Hairline" hex="#bfc1b7" />
            <ColorSwatch name="Hairline Soft" hex="#dcdfd2" />
            <ColorSwatch name="Primary CTA" hex="#f7a501" />
            <ColorSwatch name="Primary Pressed" hex="#dd9001" />
            <ColorSwatch name="Accent Blue" hex="#2c84e0" />
            <ColorSwatch name="Accent Red" hex="#cd4239" />
            <ColorSwatch name="Accent Green" hex="#2c8c66" />
            <ColorSwatch name="Accent Purple" hex="#7c44a6" />
            <ColorSwatch name="Link Blue" hex="#1d4ed8" />
            <ColorSwatch name="Link Teal" hex="#1078a3" />
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div className="space-y-6">
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                display-xl — 36px / 700
              </div>
              <p className="text-[36px] font-bold leading-[1.5] text-ink">
                The new way to build AI workflows
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                display-lg — 24px / 800 / -0.6px
              </div>
              <p className="text-[24px] font-extrabold leading-[1.33] tracking-[-0.6px] text-ink">
                Chain LLMs and tools visually
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                heading-lg — 21px / 700 / -0.5px
              </div>
              <p className="text-[21px] font-bold leading-[1.4] tracking-[-0.5px] text-ink">
                Workflow Builder
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                heading-md — 20px / 700
              </div>
              <p className="text-[20px] font-bold leading-[1.4] text-ink">
                Node Configuration
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                heading-sm-mixed — 18px / 600
              </div>
              <p className="text-[18px] font-semibold leading-[1.56] text-ink">
                Model Providers
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                body-md — 16px / 400 / 1.5
              </div>
              <p className="text-[16px] font-normal leading-[1.5] text-body">
                LLM Flow Studio lets you build complex AI workflows by
                connecting language models and tools on a visual canvas.
                Configure prompts, chain outputs, and inspect results — all
                without writing integration code.
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                body-strong — 16px / 600
              </div>
              <p className="text-[16px] font-semibold leading-[1.5] text-ink">
                Important configuration note
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                body-sm — 15px / 400 / 1.71
              </div>
              <p className="text-[15px] font-normal leading-[1.71] text-body">
                Each node can be configured with a provider, model, system
                instructions, and a prompt template that references upstream
                outputs.
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                body-xs — 14px / 500 / 1.43
              </div>
              <p className="text-[14px] font-medium leading-[1.43] text-body">
                Last updated 3 minutes ago
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                caption-xs — 12px / 600 / uppercase
              </div>
              <p className="text-[12px] font-semibold uppercase leading-[1.33] text-mute">
                Inline badge label
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                utility-xs — 12px / 700 / uppercase
              </div>
              <p className="text-[12px] font-bold uppercase leading-[1.33] text-body">
                Section eyebrow
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-mute">
                code-sm — 14px / mono / 400
              </div>
              <p className="font-mono text-[14px] font-normal leading-[1.43] text-ink">
                {"const workflow = await runNodes(graph);"}
              </p>
            </div>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <div className="space-y-6">
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-mute">
                Variants
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">Primary CTA</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link Style</Button>
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-mute">
                Sizes
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="pill">Pill</Button>
                <Button size="pill-sm" variant="secondary">
                  Pill Small
                </Button>
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-mute">
                States
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button>Enabled</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Product Card</CardTitle>
                <CardDescription>
                  White background, 1px hairline border, 6px radius, 24px
                  padding. No shadows.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-body">
                  Standard card for feature tiles, workflow items, and dashboard
                  widgets.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">
                  Learn more &rarr;
                </Button>
              </CardFooter>
            </Card>

            <Card variant="doc">
              <CardHeader>
                <CardTitle>Doc Card</CardTitle>
                <CardDescription>
                  Warm-white (#fcfcfa) background for documentation content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-body">
                  Used inside doc pages for article body sections, code samples,
                  and callout banners.
                </p>
              </CardContent>
            </Card>

            <Card variant="pricing">
              <CardTitle>Pricing Card</CardTitle>
              <p className="mt-1 text-sm text-body">
                32px padding variant for pricing tiers and large setup forms.
              </p>
              <div className="mt-4">
                <Button className="w-full">Subscribe</Button>
              </div>
            </Card>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges &amp; Pills">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="promo">New</Badge>
            <Badge variant="success">Active</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="purple">Note</Badge>
            <Badge variant="uppercase">Feature Flag</Badge>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Inputs &amp; Forms">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">
                Text Input
              </label>
              <Input placeholder="Enter workflow name..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">
                Disabled Input
              </label>
              <Input placeholder="Disabled..." disabled />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold text-ink">
                Textarea
              </label>
              <Textarea placeholder="Enter system instructions for this LLM node..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">
                Search Input
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <Input className="pl-9" placeholder="Search templates..." />
              </div>
            </div>
          </div>
        </Section>

        {/* Code */}
        <Section title="Code">
          <div className="space-y-6">
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-mute">
                Code Block
              </div>
              <CodeBlock language="typescript" title="workflow.ts">
                {`import { createWorkflow } from "@llm-flow/core";

const workflow = createWorkflow({
  name: "Content Pipeline",
  nodes: [
    { id: "input", type: "input" },
    { id: "gpt4", type: "openai", model: "gpt-4o" },
    { id: "claude", type: "claude", model: "claude-sonnet-4-20250514" },
    { id: "output", type: "output" },
  ],
  edges: [
    { source: "input", target: "gpt4" },
    { source: "gpt4", target: "claude" },
    { source: "claude", target: "output" },
  ],
});

await workflow.run();`}
              </CodeBlock>
            </div>

            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-mute">
                Inline Code
              </div>
              <p className="text-body">
                Use the <InlineCode>createWorkflow()</InlineCode> function to
                initialize a new pipeline. Pass{" "}
                <InlineCode>model: &quot;gpt-4o&quot;</InlineCode> to
                configure the OpenAI node. The output is available at{" "}
                <InlineCode>node.output.text</InlineCode>.
              </p>
            </div>
          </div>
        </Section>

        {/* Callouts */}
        <Section title="Callout Banners">
          <div className="space-y-4">
            <Callout variant="info">
              You can chain up to 20 nodes in a single workflow during the beta
              period.
            </Callout>
            <Callout variant="success">
              Your workflow executed successfully. All 5 nodes completed in
              2.3 seconds.
            </Callout>
            <Callout variant="warning">
              This action will delete the workflow and all associated run
              history. This cannot be undone.
            </Callout>
            <Callout variant="note">
              Custom model nodes require a valid API key to be configured in
              Settings before execution.
            </Callout>
          </div>
        </Section>

        {/* Mascot */}
        <Section title="Mascot Placeholder">
          <p className="mb-4 text-sm text-body">
            Original AI robot-hedgehog doodle. Small, marginal, sketchbook-style
            decoration. Yellow antenna tip is the only color accent.
          </p>
          <div className="flex flex-wrap items-end gap-8">
            <div className="text-center">
              <MascotPlaceholder size="sm" mood="neutral" />
              <div className="mt-2 text-xs text-mute">Small / Neutral</div>
            </div>
            <div className="text-center">
              <MascotPlaceholder size="md" mood="happy" />
              <div className="mt-2 text-xs text-mute">Medium / Happy</div>
            </div>
            <div className="text-center">
              <MascotPlaceholder size="md" mood="thinking" />
              <div className="mt-2 text-xs text-mute">Medium / Thinking</div>
            </div>
            <div className="text-center">
              <MascotPlaceholder size="lg" mood="working" />
              <div className="mt-2 text-xs text-mute">Large / Working</div>
            </div>
          </div>
        </Section>

        {/* Radius */}
        <Section title="Border Radius Scale">
          <div className="flex flex-wrap items-end gap-6">
            {[
              { name: "none", value: "0px", cls: "rounded-none" },
              { name: "xs", value: "2px", cls: "rounded-[2px]" },
              { name: "sm", value: "4px", cls: "rounded-sm" },
              { name: "md", value: "6px", cls: "rounded-md" },
              { name: "lg", value: "8px", cls: "rounded-lg" },
              { name: "full", value: "9999px", cls: "rounded-full" },
            ].map((r) => (
              <div key={r.name} className="text-center">
                <div
                  className={`size-16 border border-hairline bg-surface-card ${r.cls}`}
                />
                <div className="mt-2 text-xs font-semibold text-ink">
                  {r.name}
                </div>
                <div className="text-xs text-mute">{r.value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Spacing */}
        <Section title="Spacing Scale">
          <div className="space-y-2">
            {[
              { name: "xxs", value: "2px" },
              { name: "xs", value: "4px" },
              { name: "sm", value: "8px" },
              { name: "md", value: "12px" },
              { name: "lg", value: "16px" },
              { name: "xl", value: "24px" },
              { name: "xxl", value: "32px" },
              { name: "section", value: "80px" },
            ].map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <div className="w-16 text-right text-xs font-semibold text-ink">
                  {s.name}
                </div>
                <div
                  className="h-3 rounded-sm bg-primary-cta"
                  style={{ width: s.value }}
                />
                <div className="text-xs text-mute">{s.value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Card with Mascot — signature variant */}
        <Section title="Card with Mascot (Signature Variant)">
          <Card className="relative overflow-visible">
            <CardHeader>
              <CardTitle>Workflow Builder</CardTitle>
              <CardDescription>
                Drag LLM nodes onto the canvas. Connect them with arrows.
                Configure instructions. Run the workflow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-body">
                Build complex AI pipelines without writing integration code.
                Each node handles one step — an LLM call, a tool invocation,
                or a conditional branch.
              </p>
            </CardContent>
            <div className="absolute -right-4 -top-6">
              <MascotPlaceholder size="md" mood="working" />
            </div>
          </Card>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline px-6 py-8">
        <p className="text-center text-xs text-mute">
          LLM Flow Studio Design System &mdash; Internal Preview
        </p>
      </footer>
    </div>
  );
}
