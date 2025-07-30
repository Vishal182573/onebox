"use client";

import React, { createContext, useState, useEffect, useContext, useMemo } from "react";
import { Email, SearchOptions } from "@/types";
import { getEmails } from "@/services/apiService";

interface ExtendedEmailContextType {
  allEmails: Email[];  
  displayedEmails: Email[]; 
  isLoading: boolean;
  error: string | null;
  selectedEmail: Email | null;
  selectEmail: (email: Email | null) => void;
  filters: SearchOptions;
  setFilters: React.Dispatch<React.SetStateAction<SearchOptions>>;
}

const EmailContext = createContext<ExtendedEmailContextType | undefined>(undefined);

export const EmailProvider = ({ children }: { children: React.ReactNode }) => {
  const [allEmails, setAllEmails] = useState<Email[]>([]); 
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filters, setFilters] = useState<SearchOptions>({});

  // fetch all emails ONCE on initial load
  useEffect(() => {
    const fetchAllEmails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getEmails();
        setAllEmails(data.emails);
      } catch (err) {
        setError("Failed to load emails.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllEmails();
  }, []);

  // calculate the displayed emails whenever the filters or the original list changes
  const displayedEmails = useMemo(() => {
    let filtered = [...allEmails];

    if (filters.classification) {
      filtered = filtered.filter(e => e.classification === filters.classification);
    }
    if (filters.accountId) {
      filtered = filtered.filter(e => e.accountId === filters.accountId);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.subject.toLowerCase().includes(searchTerm) || 
        e.from.email.toLowerCase().includes(searchTerm) || 
        e.body.plain.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [allEmails, filters]);
  
  // update the selected email when the displayed list changes
  useEffect(() => {
    if (displayedEmails.length > 0) {
      const isSelectedEmailVisible = displayedEmails.some(e => e.id === selectedEmail?.id);
      if (!isSelectedEmailVisible) {
        setSelectedEmail(displayedEmails[0]);
      }
    } else {
      setSelectedEmail(null); 
    }
  }, [displayedEmails, selectedEmail]);

  const selectEmail = (email: Email | null) => {
    setSelectedEmail(email);
  };

  return (
    <EmailContext.Provider value={{ allEmails, displayedEmails, isLoading, error, selectedEmail, selectEmail, filters, setFilters }}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmails = () => {
  const context = useContext(EmailContext);
  if (context === undefined) throw new Error("useEmails must be used within an EmailProvider");
  return context;
};