Here is the raw Markdown code for the README file. You can copy and paste this directly into a `README.md` file.

```markdown
# Onebox - AI-Powered Email Aggregator

Onebox is a feature-rich, full-stack application designed to synchronize multiple IMAP email accounts into a single, searchable interface. It leverages real-time connections, AI for email categorization, and a Retrieval-Augmented Generation (RAG) model to provide intelligent reply suggestions.

**[Link to Demo Video]**

---

## Features Implemented

-   **Real-Time, Multi-Account Sync:** Connects to multiple Gmail accounts using persistent IMAP IDLE connections for instant updates without polling.
-   **Searchable Storage:** All emails are indexed in Elasticsearch, providing fast, full-text search and filtering capabilities.
-   **AI-Powered Categorization:** New emails are automatically classified by a Gemini AI model into categories like `Interested`, `Not Interested`, `Meeting Booked`, etc.
-   **Automated Notifications:** Triggers Slack messages and generic webhooks for every email classified as `Interested`.
-   **RAG-Based Reply Suggestions:** Utilizes a ChromaDB vector database to store an outreach agenda. The system retrieves the most relevant context to generate smart, contextual replies to incoming emails.
-   **Modern Frontend Interface:** A clean, responsive UI built with Next.js and Tailwind CSS to view, search, and filter emails, and interact with the AI features.

---

## Tech Stack

### Backend

| Technology                  | Description                      |
| :-------------------------- | :------------------------------- |
| **Node.js** | Runtime Environment              |
| **TypeScript** | Language                         |
| **Express.js** | API Framework                    |
| **IMAP (node-imap)** | Real-time Email Synchronization  |
| **Elasticsearch** | Searchable Email Storage         |
| **ChromaDB** | Vector Database for RAG          |
| **Google Gemini** | AI for Categorization & RAG      |
| **Docker & Docker Compose** | Containerization & Orchestration |

### Frontend

| Technology      | Description        |
| :-------------- | :----------------- |
| **Next.js** | React Framework    |
| **TypeScript** | Language           |
| **React Context** | State Management   |
| **Tailwind CSS** | UI Styling         |
| **Framer Motion** | UI Animations      |

---

## System Architecture

The application is fully containerized with Docker for easy setup and consistent behavior across environments.

```

\+--------------------------+
|      Frontend (Next.js)  |  \<-- User Interaction (localhost:3000)
\+--------------------------+
|
v
\+--------------------------+
|      Backend API (Node.js)|  \<-- Business Logic (localhost:8000)
\+--------------------------+
|
|----------------------------+-------------------------+
v                            v                         v
\+--------------------------+ +--------------------------+ +--------------------------+
| IMAP Service (Gmail)     | | Elasticsearch            | | ChromaDB Vector DB       |
| (Real-time Sync)         | | (Search & Storage)       | | (RAG Context Storage)    |
\+--------------------------+ +--------------------------+ +--------------------------+

````

---

## Getting Started

### Prerequisites

-   **Node.js** (v18 or later)
-   **Docker** and **Docker Compose**

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
````

### 2\. Backend Setup

The entire backend (including databases) runs within Docker.

**A. Configure Environment Variables**

1.  Navigate to the `backend` directory.
2.  Create a `.env` file by copying the example: `cp .env.example .env`
3.  Fill in the required variables in the `.env` file:
      - `IMAP_ACCOUNTS`: You need a **Google App Password** for each Gmail account.
          - Go to your Google Account -\> Security -\> 2-Step Verification -\> App passwords.
          - Generate a 16-character password and use it in the JSON array.
      - `GEMINI_API_KEY`: Get your free API key from [Google AI Studio](https://aistudio.google.com/).
      - `SLACK_WEBHOOK_URL`: Create an Incoming Webhook for a Slack channel.
      - `GENERIC_WEBHOOK_URL`: Get a URL from [webhook.site](https://webhook.site/).

**B. Build and Run the Backend**

From the `backend` directory, run the following command. This will build the backend image and start all containers (backend, Elasticsearch, Kibana, ChromaDB).

```bash
docker-compose up --build
```

The backend is now running on `http://localhost:8000`. The initial email sync may take a few minutes and it maybe mark some emails as uncategorised due to rate limit of free tier of gemini .

### 3\. Frontend Setup

**A. Install Dependencies**

Navigate to the `frontend` directory in a **new terminal**.

```bash
cd ../frontend
npm install
```

**B. Run the Frontend**

```bash
npm run dev
```

The application is now running and accessible at **`http://localhost:3000`**.

-----

## How to Use

1.  **Initial Sync:** When the backend starts, it will automatically perform an initial sync of the last 30 days of emails for the configured accounts.
2.  **Teach the AI:** The AI needs context to generate smart replies. Use an API client like Postman to add your outreach agenda.
      - **Method:** `POST`
      - **URL:** `http://localhost:8000/api/context`
      - **Body (JSON):**
        ```json
        {
          "context": "I am applying for a job position. If the lead is interested, share the meeting booking link: [https://cal.com/example](https://cal.com/example)"
        }
        ```
3.  **Use the UI:** Open `http://localhost:3000` to search, filter, and view emails.
4.  **Generate Replies:** Click on an email and use the "✨ Suggest Reply" button to get an AI-powered response based on the context you provided.

```
```