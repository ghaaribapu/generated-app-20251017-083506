# Acadia: AI-Powered Learning Management System

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ghaaribapu/Zavia-AI-Academy)

Acadia is a next-generation, AI-enhanced Learning Management System (LMS) designed to streamline academic operations and personalize the learning journey. It provides a comprehensive suite of tools for educational institutions to manage courses, schedules, students, and instructors with unparalleled efficiency. The platform's core is its AI engine, which analyzes student performance data to provide predictive analytics on grades and potential career paths, offering valuable insights to both educators and learners. Acadia features distinct user roles (Admin, Instructor, Student) with tailored dashboards, a powerful scheduling system that handles complex logistics like time zones and instructor assignments, and seamless integration with essential tools like Google Meet. The user interface is designed to be visually stunning, intuitive, and highly responsive, ensuring a delightful user experience across all devices.

## ✨ Key Features

-   **AI-Powered Predictive Analytics**: Leverages AI to forecast student grades and suggest potential career paths based on performance data.
-   **Comprehensive Course Management**: Tools for creating, updating, and managing courses, including curriculum, modules, and content.
-   **Role-Based Dashboards**: Tailored views for Admins, Instructors, and Students, providing relevant information at a glance.
-   **Advanced Scheduling & Calendar**: An interactive calendar for scheduling classes, managing events, and viewing timetables with time zone support.
-   **Data-Driven Analytics**: A visualization dashboard displaying institutional performance, student engagement, and AI-powered insights.
-   **Stunning & Responsive UI**: A beautiful, modern, and intuitive interface that works flawlessly on all devices.
-   **Secure User Profiles**: Dedicated pages for student and instructor profiles with academic history, schedules, and performance.

## 🛠️ Technology Stack

-   **Frontend**: React, Vite, TypeScript
-   **Backend**: Cloudflare Workers, Hono, Durable Objects
-   **Styling**: Tailwind CSS, shadcn/ui
-   **State Management**: Zustand
-   **Animation**: Framer Motion
-   **Data Visualization**: Recharts
-   **Forms**: React Hook Form, Zod
-   **Package Manager**: Bun

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
-   `wrangler` CLI, which can be installed with `bun install -g wrangler`.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/acadia-lms.git
    cd acadia-lms
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Configure Environment Variables:**
    Create a `.dev.vars` file in the root of the project for local development. You can copy the example from `wrangler.jsonc`:

    ```ini
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```

    Replace the placeholder values with your actual Cloudflare Account ID, AI Gateway ID, and API Key.

### Running the Development Server

To start the development server, which includes the Vite frontend and the local `wrangler` dev server, run:

```sh
bun dev
```

This will start the application, typically available at `http://localhost:3000`. The frontend will hot-reload on changes, and the worker backend will restart automatically.

## 🚢 Deployment

This project is designed for seamless deployment to Cloudflare's global network.

1.  **Login to Wrangler:**
    If you haven't already, authenticate `wrangler` with your Cloudflare account:
    ```sh
    bunx wrangler login
    ```

2.  **Configure Production Secrets:**
    Set your production environment variables as secrets for your worker:
    ```sh
    bunx wrangler secret put CF_AI_BASE_URL
    bunx wrangler secret put CF_AI_API_KEY
    ```

3.  **Deploy the application:**
    Run the deploy script to build the application and deploy it to Cloudflare Pages:
    ```sh
    bun deploy
    ```

Alternatively, you can deploy directly from your GitHub repository using the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ghaaribapu/Zavia-AI-Academy)

## 📂 Project Structure

The project is organized into two main directories:

-   `src/`: Contains the entire React frontend application, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the Cloudflare Worker backend code, including the Hono router, Durable Object classes (`ChatAgent`, `AppController`), and API logic.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.