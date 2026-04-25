"use client";

import { useRouter } from "next/navigation";

export default function KeyLandingPage() {
  const router = useRouter();

  return (
    <main className="key-page">
      <header className="key-header">
        <div className="key-logo">OpenRouter</div>
        <input className="key-search" placeholder="Search" />
        <nav className="key-nav">
          <span>Home</span>
          <span>Models</span>
          <span>Chat</span>
          <span>Docs</span>
        </nav>
      </header>

      <section className="key-hero">
        <h1>The Unified Interface For LLMs</h1>
        <p>
          Better <span>prices</span>, better <span>uptime</span>, no subscriptions.
        </p>
        <div className="key-actions">
          <button className="key-primary-btn" onClick={() => router.push("/key/api-keys")}>
            Get API Key
          </button>
          <button className="key-secondary-btn" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </section>

      <section className="key-stats">
        <article>
          <h3>70T</h3>
          <p>Monthly Tokens</p>
        </article>
        <article>
          <h3>5M+</h3>
          <p>Global Users</p>
        </article>
        <article>
          <h3>60+</h3>
          <p>Active Providers</p>
        </article>
        <article>
          <h3 className="accent">300+</h3>
          <p>Models</p>
        </article>
      </section>
    </main>
  );
}
