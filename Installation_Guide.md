# 🚀 RTFM SkillOS - Beginner's Installation Guide

Welcome! This guide is written so that **anyone**—even a school student—can easily install and run this application on their computer.

We have created an automated script (`start_server.bat`) that will do almost all the heavy lifting for you! However, it's good to know exactly what is happening.

---

## 🐳 Step 1: Run with Docker (The Easiest Way!)

If you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed, you can start the entire platform in one command:

1. Open your computer's terminal (search for **cmd** or **PowerShell**) and navigate to the project folder.
2. Run the following command:
   ```bash
   docker compose up -d --build
   ```
3. Docker will automatically download the database, cache, and build the website for you.
4. Once it says "Started", open your web browser and go to `http://localhost:5001`.

*Note: To populate the database with hackathon mock data, you can run `docker compose exec app npm run seed` (or run it locally via `npx tsx scripts/seed.ts` inside the server folder).*

---

## 🛠️ Step 2: Run the Automated Script (The Local Way)

We also have a magic script that does everything automatically on your local machine!

1. Open the folder where you extracted this project.
2. Double-click the file named **`start_server.bat`**.
3. A black command window will open. Just sit back and watch! 
4. The script will:
   - Check if you have **Node.js** and **PostgreSQL** installed. If you don't, it will download and install them for you! (A window might pop up asking for your permission—click **Yes**).
   - Set up all the necessary environment (`.env`) files.
   - Install all the required code packages.
   - Create the database and fill it with some demo data.
   - Start the backend and frontend servers.

Once it's done, it will automatically open your web browser to the app! You can log in using:
- **Username:** `admin`
- **Password:** `admin123`

---

## 🛑 What if the script fails? (Troubleshooting & Manual Steps)

Sometimes computers are tricky. If `start_server.bat` fails or you see a lot of red error text, don't panic! Just follow these simple manual steps:

### 1. Install Prerequisites manually
If the script failed to install the required software, you can do it yourself:
* **Node.js**: Go to [nodejs.org](https://nodejs.org/) and download the "LTS" version. Install it like a normal program (just keep clicking "Next").
* **PostgreSQL**: Go to [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) and download the installer. 
  * During installation, it will ask you to set a password for the "postgres" user. **Remember this password!** (We recommend `postgres` for simplicity).
  * Keep the default port as `5432`.

### 2. Configure the Database
1. Open your Start Menu and search for **pgAdmin 4** (it was installed with PostgreSQL) and open it.
2. Log in with the password you just created.
3. Right-click on **Databases** on the left panel -> **Create** -> **Database...**
4. Name it **`skillos`** and click Save.

### 3. Create the configuration files
The application needs to know your database password to connect.
1. In the project folder, open the `server` folder.
2. Make a copy of the `.env.example` file and rename the copy to just `.env`.
3. Open `.env` in Notepad.
4. Find the line that says:
   `DATABASE_URL=postgresql://postgres@localhost:5432/skillos`
   *(If you set a password during PostgreSQL installation, change `postgres@localhost` to `postgres:YOUR_PASSWORD@localhost`)*.
5. Do the same thing in the main project folder (copy `.env.example` to `.env`).

### 4. Start the Application
Open your computer's terminal (search for **cmd** or **PowerShell** in the Start Menu) and type these commands one by one, pressing Enter after each:

```bash
# Go to the project folder (replace this with your actual folder path)
cd D:\path\to\RTFM_SkillOS-master

# Install the main packages
npm install

# Go into the server folder and set up the database
cd server
npm install
npx drizzle-kit push
npm run seed

# Start the server (leave this window open!)
npm run dev
```

Now, open a **second** terminal window:
```bash
# Go to the client folder
cd D:\path\to\RTFM_SkillOS-master\client

# Install packages and start the website!
npm install
npm run dev
```

Your app is now running at **http://localhost:5173**! 🎉
