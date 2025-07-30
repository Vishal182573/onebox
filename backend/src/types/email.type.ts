export interface Email {
  id: string; // unique ID for the document, can be the message-id
  accountId: string; // to identify which email account it belongs to
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
  date: Date;
  body: {
    plain: string;
    html?: string;
  };
  classification?: string; 
}
export interface ImapAccount {
  id: string;
  user: string;
  password: string;
}

export interface SearchOptions {
  search?: string;
  accountId?: string;
  classification?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  total: number;
  emails: Email[];
}