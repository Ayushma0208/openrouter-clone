"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/");
      return;
    }

    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/");
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (_error) {
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/");
  };

  const openDocs = () => {
    router.push("/docs");
  };

  const openKey = () => {
    router.push("/key");
  };

  if (loading) {
    return (
      <main className="page-center">
        <section className="card">
          <p>Loading dashboard...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="brand">
          <div className="brand-dot">A</div>
          <h1>Admin Panel</h1>
        </div>
        <div className="admin-actions">
          <span className="username">{user?.name || "Administrator"}</span>
          <button className="key-btn" onClick={openKey}>
            Key
          </button>
          <button className="docs-btn" onClick={openDocs}>
            Docs
          </button>
          <button className="danger-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-content">
        <section className="hero">
          <h2>Welcome to Admin Dashboard</h2>
          <p>You have full administrative access to the OpenRouter platform.</p>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <p className="stat-title">Total Admins</p>
            <p className="stat-value">1+</p>
          </article>
          <article className="stat-card">
            <p className="stat-title">System Status</p>
            <p className="stat-value status-running">Running</p>
          </article>
        </section>

        <section className="profile-card">
          <h3>Your Profile</h3>
          <p>
            <span className="label">Name</span>
            <span className="value">{user?.name || "Administrator"}</span>
          </p>
          <p>
            <span className="label">Email</span>
            <span className="value">{user?.email || "admin@example.com"}</span>
          </p>
          <p>
            <span className="label">Role</span>
            <span className="value">Admin</span>
          </p>
        </section>
      </div>
    </main>
  );
}
