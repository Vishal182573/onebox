import { Email, SearchOptions } from "@/types"; 

const API_BASE_URL = "https://reachinbox-assignment-ozu9.onrender.com/api";

interface GetEmailsResponse {
  total: number;
  emails: Email[];
}

export const getEmails = async (): Promise<GetEmailsResponse> => {
  const url = `${API_BASE_URL}/emails?limit=200`; 
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch emails");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching emails:", error);
    return { total: 0, emails: [] };
  }
};

export const suggestReply = async (emailId: string): Promise<{ reply: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/emails/${emailId}/suggest-reply`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error("Failed to suggest a reply");
    }
    return await response.json();
  } catch (error) {
    console.error("Error suggesting reply:", error);
    return { reply: "Sorry, an error occurred while generating a reply." };
  }
};

export const addContext = async (context: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ context }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add context");
    }
    return await response.json();
  } catch (error) {
    console.error("Error adding context:", error);
    return { message: (error as Error).message || "An error occurred." };
  }
};