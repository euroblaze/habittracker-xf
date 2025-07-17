# Habit Tracker App

A simple, personalized habit tracking web application for two partners, Doro and Ashant, with central data storage and individual views.

## Features

*   **Personalized Views**: Each partner accesses their own habit tracker via a unique URL (e.g., `/doro`, `/ashant`).
*   **Centralized Data**: All habit entries are stored in a shared JSON file, allowing for combined totals.
*   **Private Checkboxes**: Each partner can only mark their own habits.
*   **Shared Totals**: The bottom of the table displays combined totals for each habit for both Doro and Ashant.
*   **Auto-Save**: All changes are automatically saved to the backend.
*   **Month Navigation**: Easily slide between previous and future months (up to 12 months in each direction).
*   **Customizable Habits**: Add, activate, deactivate, and delete custom habits via a settings menu.
*   **Black & White UI**: Clean and minimalist design.
*   **Responsive**: Works well on both desktop and mobile devices.

## Installation

To get this project up and running locally, follow these steps:

### Prerequisites

Make sure you have Node.js (v18.x or higher) and npm (or yarn/pnpm) installed on your machine.

### Steps

1.  **Clone the repository (or download the code):**

    If you're using Git, clone the project:
    ```bash
    git clone <repository-url>
    cd habit-tracker
    ```

    If you downloaded the code, extract it and navigate into the project directory.

2.  **Install dependencies:**

    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```
    Or using pnpm:
    ```bash
    pnpm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```
    Or using yarn:
    ```bash
    yarn dev
    ```
    Or using pnpm:
    ```bash
    pnpm dev
    ```

    The application will start on `http://localhost:3000`.

## Usage

Once the app is running, you can access it in your web browser:

1.  **Accessing Your Tracker:**
    *   For **Doro**: Go to `http://localhost:3000/doro`
    *   For **Ashant**: Go to `http://localhost:3000/ashant`
    *   The root URL `http://localhost:3000` provides links to each partner's tracker.

2.  **Tracking Habits:**
    *   On your respective page, you will see a grid with days listed vertically and your active habits horizontally.
    *   Click the checkboxes to mark a habit as completed for a specific day. Changes are saved automatically.

3.  **Navigating Months:**
    *   Use the left (`<`) and right (`>`) arrow buttons in the header to navigate between months. You can go up to 12 months back or forward from the current date.

4.  **Managing Habits (Settings):**
    *   Click the **gear icon** (⚙️) in the top right corner of your tracker page.
    *   **Add New Habit**: Type a new habit name in the input field and click "Add". This habit will be added to your personal list and automatically activated.
    *   **Activate/Deactivate Habits**: Check or uncheck the boxes next to existing habits to control which ones appear on your main tracking grid.
    *   **Delete Custom Habits**: For habits you've added, a "Delete" button will appear. Click it to remove the custom habit from your list and its associated entries. Default habits cannot be deleted.
    *   Click "Done" to close the settings.

5.  **Viewing Totals:**
    *   At the bottom of the habit grid, you'll find a "Total" row. This row displays the total number of times each habit has been completed by **both Doro and Ashant** for the currently viewed month.

6.  **Data Persistence:**
    *   All your habit data and settings are stored in a JSON file (`data/habits.json`) within the project directory. This means your progress will be saved even if you close and reopen the application.

## Deployment

This application is built with Next.js and can be easily deployed to Vercel.

1.  **Create a Vercel Account**: If you don't have one, sign up at [vercel.com](https://vercel.com/).
2.  **Connect Your Git Repository**: Import your project from GitHub, GitLab, or Bitbucket.
3.  **Deploy**: Vercel will automatically detect it's a Next.js project and deploy it.

Once deployed, you can access your app at the Vercel URL, and then navigate to `/doro` or `/ashant`.

### Deployment on a VM (e.g., Ubuntu/Debian)

If you prefer to deploy the application on your own Virtual Machine, follow these steps. This guide assumes you have SSH access to your VM and a basic Linux environment.

#### Prerequisites on your VM

Before you start, ensure your VM has the following installed:

*   **Node.js and npm**: Version 18.x or higher.
    ```bash
    # Example for Ubuntu/Debian
    sudo apt update
    sudo apt install -y nodejs npm
    ```
*   **Git**: For cloning the repository.
    ```bash
    sudo apt install -y git
    ```
*   **PM2**: A production process manager for Node.js applications.
    ```bash
    sudo npm install -g pm2
    ```
*   **Nginx**: A high-performance web server and reverse proxy.
    ```bash
    sudo apt install -y nginx
    ```

#### Deployment Steps

1.  **SSH into your VM:**
    ```bash
    ssh ashant@your_vm_ip_address
    ```

2.  **Navigate to your home directory:**
    ```bash
    cd /home/ashant/
    ```

3.  **Clone your repository:**
    Replace `<your-repository-url>` with the actual URL of your Git repository.
    ```bash
    git clone <your-repository-url> habit-tracker
    cd habit-tracker
    ```

4.  **Install project dependencies:**
    ```bash
    npm install
    ```

5.  **Build the Next.js application for production:**
    ```bash
    npm run build
    ```

6.  **Start the application with PM2:**
    PM2 will keep your application running in the background and restart it if it crashes.
    ```bash
    pm2 start npm --name "habit-tracker-app" -- start
    ```
    To ensure PM2 restarts your app on server reboot:
    ```bash
    pm2 save
    pm2 startup
    ```
    Follow the instructions provided by `pm2 startup` to set up the systemd script.

7.  **Configure Nginx as a Reverse Proxy:**
    This will allow Nginx to serve your Next.js app on standard HTTP/HTTPS ports (80/443).

    Create a new Nginx configuration file for your app:
    ```bash
    sudo nano /etc/nginx/sites-available/habit-tracker
    ```
    Paste the following configuration into the file. Replace `your_domain_or_ip` with your VM's domain name or IP address.

    ```nginx
    server {
        listen 80;
        server_name your_domain_or_ip;

        location / {
            proxy_pass http://localhost:3000; # Next.js app runs on port 3000 by default
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    Save and exit the file (Ctrl+X, Y, Enter in nano).

    Create a symbolic link to enable the site:
    ```bash
    sudo ln -s /etc/nginx/sites-available/habit-tracker /etc/nginx/sites-enabled/
    ```

    Test the Nginx configuration for syntax errors:
    ```bash
    sudo nginx -t
    ```

    If the test is successful, restart Nginx to apply the changes:
    ```bash
    sudo systemctl restart nginx
    ```

8.  **Adjust Firewall (if applicable):**
    If you have a firewall (like UFW on Ubuntu), ensure ports 80 (HTTP) and 443 (HTTPS, if you add SSL later) are open.
    ```bash
    sudo ufw allow 'Nginx HTTP'
    sudo ufw enable # if firewall is not already enabled
    ```

#### Accessing Your Deployed App

Your Habit Tracker app should now be accessible via your VM's domain name or IP address.

*   **For Doro**: `http://your_domain_or_ip/doro`
*   **For Ashant**: `http://your_domain_or_ip/ashant`
*   The main page with links: `http://your_domain_or_ip/`

Remember to replace `your_domain_or_ip` with your actual VM's public IP address or domain name.
