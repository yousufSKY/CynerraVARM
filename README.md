# VARM Frontend

This is the frontend for the Vulnerability Assessment and Management (VARM) platform, a modern web application designed to help users run and manage security scans.

## Description

The VARM platform provides an AI-powered interface for orchestrating various open-source security tools to perform vulnerability scans on network and web assets. This frontend application offers a user-friendly dashboard to create, monitor, and analyze scan results.

It is built with Next.js and TypeScript, and it communicates with a separate backend API to manage the scanning lifecycle.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI**: [React](https://reactjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Component Library**: [Shadcn UI](https://ui.shadcn.com/)
-   **Authentication**: [Clerk](https://clerk.com/)

The backend is expected to orchestrate the following security tools:
-   Nmap
-   OWASP ZAP
-   Nikto
-   SQLMap

## Features

-   **User Authentication**: Secure sign-up and sign-in functionality handled by Clerk.
-   **Scanning Dashboard**: A central place to create and view security scans.
-   **Multiple Scan Profiles**: Pre-configured scan types for different targets (e.g., Comprehensive Network Scan, Web Application Scan).
-   **Real-time Scan Monitoring**: View the progress and status of ongoing scans.
-   **Results Analysis**: View detailed results from completed scans.

## Getting Started

Follow these instructions to get the development environment up and running.

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the following variables.

    For Clerk authentication:
    ```
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    ```

    For the backend API URL (optional, defaults to `http://localhost:8000`):
    ```
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

4.  **Run the development server:**
    Make sure the backend service is running on the configured API URL.
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Status

**Note:** This project is currently under active development.

There is a known issue where the backend's `/scan/history` endpoint is not functioning correctly. The frontend implements a client-side workaround using `localStorage` to track and fetch scan histories. This is an important consideration for anyone contributing to the project.
