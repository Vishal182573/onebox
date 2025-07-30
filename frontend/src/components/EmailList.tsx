"use client";

import { useEmails } from "@/context/EmailContext";
import ClientOnlyDate from "./ClientOnlyDate";
import { AnimatePresence, motion } from "framer-motion";

export default function EmailList() {
  const { displayedEmails, isLoading, selectedEmail, selectEmail } = useEmails();

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading emails...</div>;
  }

  return (
    <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-white">
      <AnimatePresence>
        {displayedEmails.length > 0 ? (
          <ul>
            {displayedEmails.map((email) => (
              <motion.li
                key={email.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onClick={() => selectEmail(email)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedEmail?.id === email.id ? "bg-blue-100 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-800 truncate pr-2">{email.from.name || email.from.email}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                     <ClientOnlyDate dateString={email.date} options={{ year: 'numeric', month: '2-digit', day: '2-digit' }} />
                  </span>
                </div>
                <div className="text-sm text-gray-900 truncate mt-1">{email.subject}</div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{email.body.plain}</p>
              </motion.li>
            ))}
          </ul>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 text-center text-gray-500"
          >
            No emails match your filters.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}