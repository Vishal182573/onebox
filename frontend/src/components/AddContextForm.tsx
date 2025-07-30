"use client";

import { useState } from "react";
import { addContext } from "@/services/apiService";

export default function AddContextForm() {
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.trim()) {
      setMessageType("error");
      setMessage("Context cannot be empty.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const response = await addContext(context);

    setIsLoading(false);
    
    if (response.message === "Context added successfully.") {
      setMessageType("success");
      setMessage(response.message);
      setContext(""); 
    } else {
      setMessageType("error");
      setMessage(response.message);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-700 pt-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-2">
        Teach the AI
      </h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., If a lead is interested, share the meeting link: https://cal.com/example"
          className="w-full h-24 p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 px-3 py-1.5 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-500 transition-colors"
        >
          {isLoading ? "Adding..." : "Add to AI Textbook"}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-xs ${
          messageType === "success" ? "text-green-400" : "text-red-400"
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}