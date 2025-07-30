"use client";

import { useEmails } from "@/context/EmailContext";
import { SearchOptions } from "@/types";
import { useState, useEffect } from "react";
import AddContextForm from "./AddContextForm";

const CLASSIFICATIONS = ["Interested", "Not Interested", "Meeting Booked", "Spam", "Out of Office"];
const ACCOUNTS = ["account_1", "account_2"];

export default function FilterSidebar() {
  const { filters, setFilters } = useEmails();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters({ search: searchTerm });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, setFilters]);

  const handleFilterClick = (key: keyof SearchOptions, value: string) =>{
    setSearchTerm("");
    const newFilterValue = filters[key] === value ? undefined : value;
    setFilters({ 
      accountId: key === 'accountId' ? newFilterValue : filters.accountId,
      classification: key === 'classification' ? newFilterValue : filters.classification,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({});
  };

  return (
    <div className="p-4">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search emails..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-2 py-1.5 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
      />

      {/* Classification Filters */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-400">Classification</h3>
        <div className="mt-2 flex flex-col items-start gap-2">
          {CLASSIFICATIONS.map((c) => (
            <button
              key={c}
              onClick={() => handleFilterClick("classification", c)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filters.classification === c
                  ? "bg-blue-500 text-white"
                  : "bg-gray-600 text-gray-200 hover:bg-gray-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Account Filters */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-400">Account</h3>
        <div className="mt-2 flex flex-col items-start gap-2">
          {ACCOUNTS.map((acc) => (
            <button
              key={acc}
              onClick={() => handleFilterClick("accountId", acc)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filters.accountId === acc
                  ? "bg-green-500 text-white"
                  : "bg-gray-600 text-gray-200 hover:bg-gray-500"
              }`}
            >
              {acc.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="mt-6 border-t border-gray-700 pt-4">
        <button onClick={clearFilters} className="w-full text-center text-sm text-gray-400 hover:text-white">
          Clear All Filters
        </button>
      </div>

      {/*Add the new component here */}
      <AddContextForm/>
    </div>
  );
}