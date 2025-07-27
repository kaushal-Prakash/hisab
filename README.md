Of course\! I've beautified and enriched your README by incorporating details from your `package.json` files, improving the structure, and adding professional touches like badges and clearer explanations.

Here is the enhanced `README.md` file.

-----

\<div align="center"\>
\<br /\>
\<h1\>Hisab - Personal Expense Tracker 💰\</h1\>
\<p\>
An intelligent personal finance tracker to manage expenses, analyze spending with AI, and achieve your financial goals.
\</p\>
\<br /\>
\</div\>

\<div align="center"\>

[](https://opensource.org/licenses/ISC)
[](http://makeapullrequest.com)
[](https://www.google.com/search?q=https://github.com/yourusername/hisab/fork)
[](https://www.google.com/search?q=https://github.com/yourusername/hisab/stargazers)

\</div\>

-----

**Hisab** is a full-stack personal finance application designed to provide users with a seamless way to track their expenses. It leverages the power of AI to deliver personalized spending insights and sends automated monthly reports, helping you stay on top of your finances.

\<br/\>

> **Note**
> Don't forget to add a screenshot of your application here\!
> `![App Screenshot](https://drive.google.com/file/d/1PEHZrmMfN7c-C8IxjZXbfdr6jncrRVit/view?usp=sharing)`

-----

## ✨ Features

  * **📊 Expense Tracking:** Log and categorize your daily expenses with an intuitive interface.
  * **🤖 AI-Powered Insights:** Get smart analysis of your spending habits powered by the **Google Gemini API**.
  * **📧 Automated Reports:** Receive beautiful, summarized monthly expense reports directly in your inbox via **Resend**.
  * **🔄 Recurring Expenses:** Set up and automatically track recurring bills and subscriptions.
  * **👥 Group Management:** Create groups to manage shared expenses with friends or family.
  * **🖼️ Receipt Uploads:** Attach images of your receipts to expenses using **ImageKit** for better record-keeping.
  * **📱 Responsive Design:** A clean, mobile-first design built with Next.js and Tailwind CSS.

-----

## 🛠️ Tech Stack & Dependencies

This project is a full-stack MERN application with a few modern twists.

| Frontend (Next.js) | Backend (Node.js) |
| :--- | :--- |
| **Framework:** Next.js 15 | **Runtime:** Node.js |
| **Styling:** Tailwind CSS, clsx | **Framework:** Express.js |
| **UI Components:** Shadcn UI (Radix), Lucide Icons | **Database:** MongoDB with Mongoose |
| **Data Visualization:** Recharts | **Authentication:** JWT & bcryptjs |
| **API Client:** Axios | **AI:** Google Gemini API (`@google/genai`) |
| **Notifications:** Sonner, React Toastify | **Email:** Resend API |
| **State Management:** Next.js App Router | **File Uploads:** ImageKit & Multer |
| \*\* Linting:\*\* ESLint | **Scheduled Jobs:** `node-cron` |

-----

## ⚙️ Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

  * **Node.js** (v18 or higher)
  * **MongoDB** (A local instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account)
  * **API Keys** for:
      * Google Gemini
      * Resend
      * ImageKit

### Installation & Setup

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/yourusername/hisab.git
    cd hisab
    ```

2.  **Setup Backend**

      * Navigate to the backend folder and install dependencies.
        ```bash
        cd backend
        npm install
        ```
      * Create a `.env` file in the `backend` directory and fill it with your credentials (see [Environment Variables](https://www.google.com/search?q=%23-environment-variables) section below).

3.  **Setup Frontend**

      * Navigate to the frontend folder and install dependencies.
        ```bash
        cd ../frontend
        npm install
        ```
      * Create a `.env.local` file in the `frontend` directory.
        ```env
        NEXT_PUBLIC_API_URL=http://localhost:8000
        ```

4.  **Run the Application**

      * Open two terminal windows.
      * In the first terminal, start the backend server from the `backend` directory:
        ```bash
        npm run dev
        ```
      * In the second terminal, start the frontend development server from the `frontend` directory:
        ```bash
        npm run dev
        ```
      * Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

-----

## 🛡️ Environment Variables

Create a `.env` file in the `/backend` directory and add the following variables.

| Variable | Description |
| :--- | :--- |
| `PORT` | The port for the backend server (e.g., `8000`). |
| `MONGO_URL` | Your MongoDB connection string. |
| `JWT_SECRET` | A long, random string for signing JWT tokens. |
| `GEMINI_API_KEY` | Your API key for the Google Gemini service. |
| `RESEND_API_KEY`| Your API key for the Resend email service. |
| `IMAGEKIT_URL_ENDPOINT` | Your ImageKit URL endpoint for file delivery. |
| `IMAGEKIT_PUBLIC_KEY` | Your public API key for ImageKit. |
| `IMAGEKIT_PRIVATE_KEY`| Your private API key for ImageKit. |

-----

## 🌐 API Endpoints

The backend exposes the following REST API endpoints.

| Endpoint | Method | Description | Protected |
| :--- | :--- | :--- | :---: |
| `/api/user/signup` | `POST` | Registers a new user. | No |
| `/api/user/login` | `POST` | Logs in a user and returns a JWT. | No |
| `/api/expenses` | `POST` | Creates a new expense record. | Yes |
| `/api/expenses` | `GET` | Retrieves all expenses for the logged-in user. | Yes |
| `/api/dashboard` | `GET` | Fetches aggregated data for the dashboard. | Yes |
| `/api/groups` | `POST` | Creates a new expense group. | Yes |
| `/api/groups` | `GET` | Retrieves all groups for the logged-in user. | Yes |

-----

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

### Show your support

Give a ⭐️ if this project helped you\!

-----

## 📧 Contact

Kaushal Prakash

**Discord:** `kaushalprakash`
