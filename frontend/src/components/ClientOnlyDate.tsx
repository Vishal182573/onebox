"use client";

import { useState, useEffect } from 'react';

interface ClientOnlyDateProps {
  dateString: string;
  options: Intl.DateTimeFormatOptions;
}

export default function ClientOnlyDate({ dateString, options }: ClientOnlyDateProps) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(new Date(dateString).toLocaleString(undefined, options));
  }, [dateString, options]);
  if (!formattedDate) {
    return null; 
  }

  return <>{formattedDate}</>;
}