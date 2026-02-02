# Dreamlight Production Tracking - React Frontend

Modern React application for production house management system with Express.js backend.

## 🚀 Tech Stack

- **React 18** - UI Library
- **Vite** - Build Tool & Dev Server
- **React Router DOM** - Routing
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **SweetAlert2** - Confirmation Dialogs
- **React Hook Form** - Form Management
- **Zustand** - State Management (optional)
- **React Query** - Server State Management (optional)

## 📁 Project Structure

```
client/
├── public/
├── src/
│   ├── components/       # Reusable components
│   │   ├── common/      # Shared components (Sidebar, Navbar, Modal)
│   │   ├── projects/    # Project-specific components
│   │   ├── crew/        # Crew-specific components
│   │   ├── finance/     # Finance-specific components
│   │   └── episodes/    # Episode-specific components
│   ├── pages/           # Page components
│   │   ├── auth/        # Login, Register
│   │   ├── dashboard/   # Role-based dashboards
│   │   ├── projects/    # Project CRUD pages
│   │   └── finance/     # Finance pages
│   ├── layouts/         # Layout components
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── context/         # React Context (Auth, etc)
│   ├── hooks/           # Custom hooks
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd dreamlight-react/client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Backend Setup

Make sure your Express backend is running on `http://localhost:5000`

### Backend Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_NAME=dreamlight_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=52428800
```

### Start Backend Server

```bash
cd ../src
npm install
npm run dev
```

## 👤 User Roles & Access

### Admin
- Full access to all features
- Project management
- Finance & payroll
- User management

### Producer
- Project management
- Finance & payroll (view/manage)
- Crew assignment

### Crew
- View assigned tasks
- Update task status
- View payment history

### Broadcaster
- View project progress
- Download preview & master files
- View specific project details

### Investor
- View investment portfolio
- Track ROI & burn rate
- Financial reports

## 🔐 Authentication Flow

1. User logs in with email & password
2. Backend returns JWT token
3. Token stored in localStorage
4. Token sent with every API request via Authorization header
5. Auto-redirect to login if token expired

## 📊 Key Features

### Projects
- Create, read, update, delete projects
- Track production phases (Pre-Prod, Prod, Post-Prod)
- Monitor budget vs actual spending
- Set deadlines and milestones

### Crew Management
- Assign tasks to crew members
- Track work status (Pending, In Progress, Waiting Approval, Done)
- Manage crew payments (honor/fees)

### Finance
- Income & expense tracking
- Payroll management
- Budget monitoring
- ROI calculations

### Episodes (for Series)
- Create episodes for TV series projects
- Track episode-specific milestones
- Manage episode status (Scripting → Master Ready)

### File Management
- Upload project files (scripts, contracts, videos)
- Control broadcaster access
- Download master & preview files

## 🎨 Design System

### Colors
- Primary: Indigo (#6366f1)
- Success: Emerald (#10b981)
- Warning: Orange (#f97316)
- Danger: Red (#ef4444)
- Gray Scale: Tailwind Gray palette

### Typography
- Font Family: Poppins
- Headings: Bold (600-700)
- Body: Regular (400)

### Components
- Rounded corners: 1rem - 2rem
- Shadows: Subtle, layered
- Hover states: Scale & color transitions
- Icons: Font Awesome 6

## 📱 Responsive Design

- Mobile First approach
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

## 🐛 Error Handling

- API errors caught and displayed via toast notifications
- Form validation with helpful error messages
- Loading states for async operations
- 404 & 401 error redirects

## 🔄 State Management

### Local State
- `useState` for component state
- `useContext` for auth state

### Server State (optional with React Query)
```javascript
import { useQuery, useMutation } from 'react-query';

const { data, isLoading } = useQuery('projects', projectService.getAll);
const mutation = useMutation(projectService.create);
```

## 📦 Building for Production

```bash
npm run build
```

Output will be in `dist/` folder. Deploy to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Nginx/Apache server

### Example Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/dreamlight/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` instead
2. **JWT tokens** stored in localStorage (consider httpOnly cookies for production)
3. **API requests** always include Authorization header
4. **Input validation** on both frontend and backend
5. **XSS protection** - React escapes output by default
6. **CSRF protection** - Consider adding CSRF tokens for mutations

## 🧪 Testing (Future)

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## 📝 TODO / Roadmap

- [ ] Complete all CRUD pages (Projects, Finance, Episodes)
- [ ] Implement role-based dashboards
- [ ] Add file upload components
- [ ] Implement real-time updates (WebSocket/Polling)
- [ ] Add data visualization (Charts for financial reports)
- [ ] Implement advanced filtering & search
- [ ] Add dark mode support
- [ ] Write unit & integration tests
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] PWA support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is private and proprietary.

## 👨‍💻 Developer

Developed for Dreamlight World Media

---

**Need Help?** Check the backend documentation in `/src/README.md`
