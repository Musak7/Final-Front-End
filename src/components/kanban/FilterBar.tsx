"use client";

import { Search, X } from "lucide-react";

interface Props {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterAssignee: string;
  onAssigneeChange: (value: string) => void;
  filterPriority: string;
  onPriorityChange: (value: string) => void;
  filterType: string;
  onTypeChange: (value: string) => void;
  assignees: string[];
  priorities: string[];
  issueTypes: string[];
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  filterAssignee,
  onAssigneeChange,
  filterPriority,
  onPriorityChange,
  filterType,
  onTypeChange,
  assignees,
  priorities,
  issueTypes,
}: Props) {
  const hasFilters = searchQuery || filterAssignee || filterPriority || filterType;

  const clearAll = () => {
    onSearchChange("");
    onAssigneeChange("");
    onPriorityChange("");
    onTypeChange("");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Assignee Filter */}
      <select
        value={filterAssignee}
        onChange={(e) => onAssigneeChange(e.target.value)}
        className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All Assignees</option>
        {assignees.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      {/* Priority Filter */}
      <select
        value={filterPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All Priorities</option>
        {priorities.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {/* Type Filter */}
      <select
        value={filterType}
        onChange={(e) => onTypeChange(e.target.value)}
        className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All Types</option>
        {issueTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
}
