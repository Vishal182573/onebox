"use client";

import { useEmails } from "@/context/EmailContext";
import { suggestReply } from "@/services/apiService";
import { useState, useEffect } from "react";
import ClientOnlyDate from "./ClientOnlyDate";
import { AnimatePresence, motion } from "framer-motion"; 

export default function EmailDetail() {
  const { selectedEmail } = useEmails();
  
  const [suggestion, setSuggestion] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  useEffect(() => {
    setSuggestion("");
    setCopySuccess("");
  }, [selectedEmail]);

  const handleSuggestReply = async () => {
    if (!selectedEmail) return;

    setIsSuggesting(true);
    setSuggestion("");
    setCopySuccess("");
    const data = await suggestReply(selectedEmail.id);
    setSuggestion(data.reply);
    setIsSuggesting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000); 
    }, () => {
      setCopySuccess('Failed to copy');
    });
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <AnimatePresence mode="wait">
        {!selectedEmail ? (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full items-center justify-center"
          >
            <p className="text-gray-500">Select an email to read</p>
          </motion.div>
        ) : (
          <motion.div
            key={selectedEmail.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            {/* Header */}
            <div className="border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedEmail.subject}</h2>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 mr-4 flex-shrink-0">
                  {selectedEmail.from.name?.[0]?.toUpperCase() || selectedEmail.from.email[0]?.toUpperCase()}
                </div>
                <div className="flex-grow">
                  <div className="font-semibold text-gray-900">{selectedEmail.from.name}</div>
                  <div className="text-sm text-gray-500">{`<${selectedEmail.from.email}>`}</div>
                </div>
                <div className="text-sm text-gray-500 flex-shrink-0">
                  <ClientOnlyDate dateString={selectedEmail.date} options={{ dateStyle: 'medium', timeStyle: 'short' }} />
                </div>
              </div>
            </div>

            {/* Body */}
            <div
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: selectedEmail.body.html || selectedEmail.body.plain.replace(/\n/g, '<br />') }}
            />

            {/* AI Suggestion Section */}
            <div className="mt-8 pt-6 border-t">
              <button
                onClick={handleSuggestReply}
                disabled={isSuggesting}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <span className="mr-2">✨</span>
                {isSuggesting ? "Generating..." : "Suggest Reply"}
              </button>

              <AnimatePresence>
                {isSuggesting && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-gray-600"
                  >
                    AI is thinking...
                  </motion.p>
                )}

                {suggestion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 border rounded-md bg-gray-50 relative"
                  >
                    <h3 className="font-semibold mb-2 text-gray-800">Suggested Reply:</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{suggestion}</p>
                    <button onClick={handleCopy} className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded">
                      {copySuccess || 'Copy'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}