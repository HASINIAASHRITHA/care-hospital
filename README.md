# Welcome to Modern Health Canvas

## Project info

**Created by**: Hasini Addanki from Dream Team Services

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Firebase (Firestore & Authentication)
- Cloudinary (Image Storage & Optimization)

## Configuration

### Cloudinary Setup

This project uses Cloudinary for image storage and optimization. To set up Cloudinary:

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. In your Cloudinary dashboard, create an upload preset:
   - Go to Settings > Upload
   - Click "Add upload preset"
   - Set the preset name to "care hospital" (or update `CLOUDINARY_CONFIG.uploadPreset` in `src/lib/cloudinary.ts`)
   - Set the signing mode to "Unsigned"
   - Configure any transformations you want (optional)
3. Update the `CLOUDINARY_CONFIG` in `src/lib/cloudinary.ts` with your cloud name

### Firebase Setup

This project uses Firebase for database and authentication. Configure your Firebase project and update the configuration in `src/config/firebase.ts`.

Note: Firebase Storage is not used for image uploads - Cloudinary is used instead to avoid CORS issues.

## How can I deploy this project?

You can deploy this project using services like Vercel, Netlify, or any other hosting provider that supports Vite applications.

## Connecting a custom domain

You can connect a custom domain through your chosen hosting provider's domain management settings.
