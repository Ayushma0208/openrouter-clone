"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function DocsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("why");

  const tocItems = useMemo(
    () => [
      { id: "why", label: "Why Use OpenRouter with Claude Code?" },
      { id: "quick-start", label: "Quick Start" },
      { id: "how-it-works", label: "How It Works" },
      { id: "configuring-models", label: "Configuring Models" },
      { id: "fast-mode", label: "Fast Mode" },
      { id: "troubleshooting", label: "Troubleshooting" }
    ],
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.25, 0.5] }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="docs-page">
      <div className="docs-layout">
        <aside className="docs-left-nav">
          <button className="docs-nav-item active">Docs</button>
          <button className="docs-nav-item">API Reference</button>
          <button className="docs-nav-item">Client SDKs</button>
          <button className="docs-nav-item">Agent SDK</button>
          <div className="docs-left-divider" />
          <button className="docs-nav-item" onClick={() => router.push("/key/api-keys")}>
            Generate Key
          </button>
          <button className="docs-nav-item" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </aside>

        <div className="docs-container">
          <header className="docs-header">
            <div>
              <h1>Claude Code</h1>
              <p>Use Claude Code with OpenRouter</p>
            </div>
          </header>

          <section className="docs-card">
            <h2>Integration with Claude Code | OpenRouter</h2>
            <p>
              Canonical URL:{" "}
              <a
                href="https://openrouter.ai/docs/guides/coding-agents/claude-code-integration"
                target="_blank"
                rel="noreferrer"
              >
                https://openrouter.ai/docs/guides/coding-agents/claude-code-integration
              </a>
            </p>
            <div className="docs-warning">
              Claude Code with OpenRouter is only guaranteed to work with the Anthropic first-party
              provider. For maximum compatibility, use Anthropic 1P as top priority provider.
            </div>
          </section>

          <section className="docs-card" id="why">
            <h2>Why Use OpenRouter with Claude Code?</h2>
            <p>
              OpenRouter adds a reliability and management layer between Claude Code and
              Anthropic&apos;s API, giving individuals and teams better uptime, control, and visibility.
            </p>
            <h3>Provider Failover for High Availability</h3>
            <p>
              Requests can fail over between Anthropic providers when one endpoint is unavailable or
              rate-limited.
            </p>
            <h3>Organizational Budget Controls</h3>
            <p>
              Teams can centralize spending limits, allocate credits, and avoid unexpected cost
              overruns.
            </p>
            <h3>Usage Visibility and Analytics</h3>
            <p>
              Track usage patterns, monitor costs, and analyze request activity from the OpenRouter
              dashboard.
            </p>
          </section>

          <section className="docs-card" id="quick-start">
            <h2>Quick Start</h2>
            <h3>Step 1: Install Claude Code (npm only)</h3>
            <p>Requires Node.js 18 or newer.</p>
            <pre>{`npm install -g @anthropic-ai/claude-code`}</pre>

            <h3>Step 2: Connect Claude to OpenRouter</h3>
            <ol>
              <li>Use `https://openrouter.ai/api` as base URL</li>
              <li>Use your OpenRouter API key as auth token</li>
              <li>Set `ANTHROPIC_API_KEY` to an empty string</li>
            </ol>
            <pre>{`export OPENROUTER_API_KEY="<your-openrouter-api-key>"
export ANTHROPIC_BASE_URL="https://openrouter.ai/api"
export ANTHROPIC_AUTH_TOKEN="$OPENROUTER_API_KEY"
export ANTHROPIC_API_KEY=""`}</pre>

            <h3>Step 3: Start Session</h3>
            <pre>{`cd /path/to/your/project
claude`}</pre>

            <h3>Step 4: Verify</h3>
            <pre>{`/status
Auth token: ANTHROPIC_AUTH_TOKEN
Anthropic base URL: https://openrouter.ai/api`}</pre>
          </section>

          <section className="docs-card" id="how-it-works">
            <h2>How It Works</h2>
            <ol>
              <li>
                Direct connection using `ANTHROPIC_BASE_URL=https://openrouter.ai/api` (no local
                proxy needed).
              </li>
              <li>
                OpenRouter&apos;s Anthropic-compatible layer supports model mapping, reasoning blocks, and
                tool use.
              </li>
              <li>Billing and usage are tracked in your OpenRouter account.</li>
            </ol>
          </section>

          <section className="docs-card" id="configuring-models">
            <h2>Configuring Models</h2>
            <pre>{`export ANTHROPIC_DEFAULT_OPUS_MODEL="anthropic/claude-opus-4.7"
export ANTHROPIC_DEFAULT_SONNET_MODEL="anthropic/claude-sonnet-4.6"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="anthropic/claude-haiku-4.5"
export CLAUDE_CODE_SUBAGENT_MODEL="anthropic/claude-opus-4.7"`}</pre>
          </section>

          <section className="docs-card" id="fast-mode">
            <h2>Fast Mode</h2>
            <p>
              Enable Claude Code fast mode support with:
              <code> CLAUDE_CODE_SKIP_FAST_MODE_ORG_CHECK=1</code>
            </p>
            <pre>{`export CLAUDE_CODE_SKIP_FAST_MODE_ORG_CHECK=1`}</pre>
          </section>

          <section className="docs-card" id="troubleshooting">
            <h2>Troubleshooting</h2>
            <ul>
              <li>Set `ANTHROPIC_API_KEY` explicitly to `&quot;&quot;` to avoid auth conflicts.</li>
              <li>Break large tasks into smaller sessions if you hit context limits.</li>
              <li>OpenRouter does not log prompts unless you explicitly opt in.</li>
            </ul>
          </section>
        </div>

        <aside className="docs-right-toc">
          <h4>On this page</h4>
          {tocItems.map((item) => (
            <button
              key={item.id}
              className={`toc-link ${activeSection === item.id ? "active" : ""}`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </aside>
      </div>
    </main>
  );
}
