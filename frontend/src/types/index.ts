export interface Email {
  id: string;
  accountId: string;
  threadId: string;
  subject: string;
  from: {
    name: string;
    email: string;
  };
  to: {
    name: string;
    email: string;
  }[];
  date: string;
  body: {
    plain: string;
    html?: string;
  };
  classification?: string;
}
export interface SearchOptions {
  search?: string;
  accountId?: string;
  classification?: string;
  page?: number;
  limit?: number;
}

export interface EmailContextType {
  emails: Email[];
  isLoading: boolean;
  error: string | null;
  selectedEmail: Email | null;
  selectEmail: (email: Email | null) => void;
}