# TrustFund Frontend

A production-ready React frontend for the TrustFund crowdfunding platform, built with Vite, React, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Login and Registration with JWT token management
- 📱 **Campaign Management**: View, create, and manage fundraising campaigns
- 💰 **Donations**: Make donations to campaigns with real-time updates
- 👤 **User Profile**: View and update profile with image upload
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🔔 **Error Handling**: Toast notifications and automatic session management

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/          # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Campaigns.jsx
│   │   ├── CreateCampaign.jsx
│   │   ├── CampaignDetail.jsx
│   │   └── Profile.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles with Tailwind
├── public/               # Static assets
├── index.html            # HTML template
├── tailwind.config.js    # Tailwind configuration
├── vite.config.js        # Vite configuration
└── package.json
```

## API Integration

The frontend is configured to communicate with the backend API at `http://localhost:5000/api`.

### Authentication
- JWT tokens are automatically attached to requests via Axios interceptors
- Tokens are stored in localStorage
- 401 responses automatically log out the user

### Key Endpoints Used
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create campaign
- `POST /api/donations/campaign/:id` - Make a donation
- `POST /api/upload/profile-image` - Upload profile image

## Features in Detail

### Authentication
- **Register**: First Name, Last Name, Email, Password, Phone Number
- **Login**: Email and Password
- Automatic token management and session persistence

### Campaigns
- **Home Page**: Hero section with featured campaigns
- **All Campaigns**: Grid view with progress bars and campaign cards
- **Create Campaign**: Form with title, description, goal amount, deadline, and category
- **Campaign Detail**: Full campaign view with donation form and recent donations list

### Categories
The app uses hardcoded category IDs matching the backend seeder:
- Medical: `650c1f1e1c9d440000000000`
- Education: `650c1f1e1c9d440000000001`
- Environment: `650c1f1e1c9d440000000002`

### Profile
- View user details
- Upload profile image (multipart/form-data)
- Display user stats (total donated, campaigns created)

## Styling

The app uses a "Trustworthy Green" color scheme defined in `tailwind.config.js`:
- Primary colors: Green shades (50-950)
- Responsive design with mobile-first approach
- Modern UI with shadows, rounded corners, and smooth transitions

## Error Handling

- Toast notifications for success/error messages
- Automatic logout on 401 (Unauthorized) responses
- Loading states for async operations
- Form validation with user-friendly error messages

## Notes

- The backend must be running on port 5000
- CORS is configured on the backend to allow requests from the frontend
- Profile image upload expects `multipart/form-data` format
- Campaign creation sends `categoryId` which the backend maps to `category`

