"use client";

import { useJira } from "@/context/JiraContext";
import { cn, formatDate } from "@/lib/utils";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useSWRConfig } from "swr";

export default function Header() {
  const { sprints, selectedSprintId, setSelectedSprintId, isLoading } = useJira();
  const { mutate } = useSWRConfig();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId);

  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate(() => true, undefined, { revalidate: true });
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {selectedSprint?.name || "Select a Sprint"}
        </h1>
        {selectedSprint && (
          <span className="text-sm text-gray-500">
            {formatDate(selectedSprint.startDate)} -{" "}
            {formatDate(selectedSprint.endDate)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
          title="Refresh data"
        >
          <RefreshCw
            className={cn("h-4 w-4", refreshing && "animate-spin")}
          />
        </button>

        {/* Sprint Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {isLoading ? "Loading..." : selectedSprint?.name || "Select Sprint"}
            <ChevronDown className="h-4 w-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {sprints.map((sprint) => (
                <button
                  key={sprint.id}
                  onClick={() => {
                    setSelectedSprintId(sprint.id);
                    setDropdownOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50",
                    sprint.id === selectedSprintId && "bg-blue-50 text-blue-700"
                  )}
                >
                  <span>{sprint.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      sprint.state === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {sprint.state}
                  </span>
                </button>
              ))}
              {sprints.length === 0 && (
                <p className="px-4 py-2 text-sm text-gray-500">
                  No sprints found
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
