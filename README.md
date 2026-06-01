# HubSpot MCP Advanced OAuth Server

A premium, state-of-the-art **Model Context Protocol (MCP)** server for HubSpot built on Next.js. This server enables LLMs and AI agents (such as Claude, Gemini, Cursor, etc.) to securely interact with HubSpot resources (Contacts, Companies, Deals, Tasks, etc.) using a fully-integrated **Advanced OAuth flow**.

---

## 🛠️ Environment Variables

To run this project, you need to configure the following environment variables. Create a `.env` file in the root of the project:

```env
# HubSpot OAuth Credentials
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret

```

### Configuration Details

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `HUBSPOT_CLIENT_ID` | **Yes** (for OAuth) | The unique Client ID of your HubSpot Developer Application. |
| `HUBSPOT_CLIENT_SECRET`| **Yes** (for OAuth) | The Client Secret of your HubSpot Developer Application. Keep this secret. 

---

## 🚀 Getting Started

### 1. Install Dependencies
This project uses **pnpm** as its package manager. Install the dependencies using:

```bash
pnpm install
```

### 2. Configure Environment Variables
Copy the environment variables template or create a `.env` file in the root directory:

```bash
# On Windows PowerShell
New-Item .env -ItemType File
```
Populate `.env` with your actual HubSpot App Client ID and Client Secret.

### 3. Run the Development Server
Start the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to verify the setup and complete the OAuth authorization handshake.

---

## 🔌 Integrated MCP Tools

Once authenticated, the server registers a robust set of tools with the Model Context Protocol, including:

*   **User Details**: `get_current_user`
*   **Contacts**: Create, update, search, and delete contacts.
*   **Companies**: Manage company directories and details.
*   **Leads & Deals**: Track opportunities, pipelines, and status.
*   **Tasks & Meetings**: Coordinate engagements, set reminders, and log details.
*   **Communications**: Log and track calls, emails, notes, and messages.
*   **Products**: View and manage company catalog items.

---

## 🔒 Security & OAuth Flow

This server handles the OAuth 2.0 protocol seamlessly:
1. Users initiate authorization at `/oauth/authorize`.
2. Upon approval, HubSpot redirects back to `/oauth/callback` with an authorization code.
3. The server exchanges the authorization code for a secure Access Token and Refresh Token, persisting them in the secure token store.
4. AI Clients connect securely using the standardized Model Context Protocol transport endpoints.

