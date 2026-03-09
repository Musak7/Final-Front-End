"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleTest = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/jira/test");
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.message || "Connection failed");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to connect. Check your configuration.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Jira Connection
        </h2>

        <div className="mb-6 space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Configure your Jira connection by updating the{" "}
              <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs">
                .env.local
              </code>{" "}
              file in the project root with the following variables:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>
                <code className="font-mono">JIRA_HOST</code> - Your Jira URL
                (e.g., https://company.atlassian.net)
              </li>
              <li>
                <code className="font-mono">JIRA_EMAIL</code> - Your Jira
                account email
              </li>
              <li>
                <code className="font-mono">JIRA_API_TOKEN</code> - API token
                from Atlassian
              </li>
              <li>
                <code className="font-mono">JIRA_BOARD_ID</code> - Your board
                ID
              </li>
            </ul>
          </div>

          <a
            href="https://id.atlassian.com/manage-profile/security/api-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            Generate an API token
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <button
          onClick={handleTest}
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Test Connection
        </button>

        {status === "success" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
