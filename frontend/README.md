# Barbershop Booking Frontend

A modern, dark-themed web application for booking barbershop appointments. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### For Clients
- Browse barbershops with filtering by type, location, and rating
- View barbershop details, services, and barbers
- Interactive booking flow with step-by-step process
- Select barber, services, date, and time
- View booking history and manage appointments
- Responsive design for all devices

### For Barbershop Admins
- Manage barbershop profile and information
- Add/edit barbers and their specialties
- Manage services with pricing and duration
- View and manage all bookings
- Set working hours and availability

### For Barbers
- View upcoming appointments
- Manage personal schedule
- Block time slots for breaks

### For Super Admins
- Read-only access to all system data
- Monitor all barbershops and bookings

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Forms**: React Hook Form with Zod validation
- **Maps**: Google Maps JavaScript API
- **Notifications**: React Hot Toast
- **Date/Time**: date-fns
- **Icons**: Lucide React

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── login/             # Authentication pages
│   ├── register/
│   ├── barbershop/[id]/   # Barbershop detail pages
│   ├── admin/             # Admin dashboard
│   ├── barber/            # Barber dashboard
│   └── bookings/          # Booking management
├── components/            # Reusable UI components
│   ├── Header.tsx
│   ├── BarbershopList.tsx
│   ├── BarbershopMap.tsx
│   ├── FilterBar.tsx
│   └── BookingForm.tsx
├── lib/                   # API helpers and utilities
│   ├── api.ts            # API client functions
│   └── auth.ts           # Authentication utilities
├── types/                 # TypeScript type definitions
│   └── index.ts
├── styles/                # Global styles and Tailwind config
│   └── globals.css
└── hooks/                 # Custom React hooks
```

## 🎨 Design System

### Colors
- **Primary**: Slate gray palette for dark theme
- **Accent**: Orange/amber for highlights and CTAs
- **Barbershop**: Custom gold and charcoal colors

### Typography
- **Sans**: Inter for body text
- **Display**: Playfair Display for headings

### Components
- Consistent card layouts with hover effects
- Custom form inputs with focus states
- Responsive grid systems
- Loading states and animations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes |

### Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Maps JavaScript API
4. Create credentials (API key)
5. Add the API key to your environment variables

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔐 Authentication

- JWT-based authentication stored in HTTP-only cookies
- Role-based access control (client, barber, admin, superadmin)
- Protected routes based on user roles
- Automatic redirects based on authentication status

## 🗺️ Google Maps Integration

- Interactive map showing barbershop locations
- Custom markers with barbershop information
- Dark theme styling for maps
- Responsive map containers

## 📊 API Integration

The frontend communicates with a RESTful backend API:

### Endpoints
- **Auth**: `/auth/login`, `/auth/register`, `/auth/logout`
- **Barbershops**: `/barbershops`
- **Barbers**: `/barbers`
- **Services**: `/services`
- **Bookings**: `/bookings`
- **Time Slots**: `/timeslots`

### Error Handling
- Centralized error handling with toast notifications
- Loading states for all async operations
- Graceful fallbacks for failed requests

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔄 Updates

Stay updated with the latest changes:
- Follow the repository for updates
- Check the changelog
- Review release notes

---

Built with ❤️ for modern barbershop management 