import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import ClientLayout from './layouts/ClientLayout';
import LegalLayout from './layouts/LegalLayout';
import Home from './pages/public/Home';
import Contact from './pages/public/Contact';
import Fonte from './pages/public/Fonte';
import Impression from './pages/public/Impression';
import Moulage from './pages/public/Moulage';
import Services from './pages/public/Services';
import MentionsLegales from './pages/public/MentionsLegales';
import CGV from './pages/public/CGV';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ResetPassword from './pages/public/ResetPassword';
import WaitingApproval from './pages/public/WaitingApproval';
import ErrorPage from './pages/public/ErrorPage';
import Dashboard from './pages/client/Dashboard';
import ClientQuote from './pages/client/Quote';
import Orders from './pages/client/Orders';
import Molds from './pages/client/Molds';
import Profile from './pages/client/Profile';
import UsersPending from './pages/admin/UsersPending';
import Weights from './pages/admin/Weights';
import AdminOrders from './pages/admin/Orders';
import AdminInvoices from './pages/admin/Invoices';
import AdminCreateInvoice from './pages/admin/CreateInvoice';
import AdminOrderDetail from './pages/admin/OrderDetail';
import MyInvoices from './pages/client/MyInvoices';
import OrderDetail from './pages/client/OrderDetail';
import WeightAccount from './pages/client/WeightAccount';
import AdminUserProfile from './pages/admin/UserProfile';
import AdminLibrary from './pages/admin/Library';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'reset',
        element: <ResetPassword />,
      },
      {
        path: 'waiting-approval',
        element: <WaitingApproval />,
      },
      {
        path: 'services',
        element: <Services />,
      },
      {
        path: 'fonte',
        element: <Fonte />,
      },
      {
        path: 'impression',
        element: <Impression />,
      },
      {
        path: 'moulage',
        element: <Moulage />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'legal',
        element: <LegalLayout />,
        children: [
          {
            path: 'mentions-legales',
            element: <MentionsLegales />,
          },
          {
            path: 'cgv',
            element: <CGV />,
          },
          {
            path: 'privacy',
            element: <PrivacyPolicy />,
          },
        ],
      },
    ],
  },
  {
    path: '/client',
    element: (
      <ProtectedRoute>
        <ClientLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'quote',
        element: <ClientQuote />,
      },
      {
        path: 'orders',
        element: <Orders />,
      },
      {
        path: 'molds',
        element: <Molds />,
      },
      {
        path: 'settings',
        element: <Profile />,
      },
      {
        path: 'invoices',
        element: <MyInvoices />,
      },
      {
        path: 'orders/:id',
        element: <OrderDetail />,
      },
      {
        path: 'weight-account',
        element: <WeightAccount />,
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsersPending />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users/:id',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/weights',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Weights />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/orders',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminOrders />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/invoices',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminInvoices />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/invoices/new',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminCreateInvoice />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/orders/:id',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminOrderDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/library',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLibrary />
          </ProtectedRoute>
        ),
      },
    ],
  },
], {
  basename: import.meta.env.BASE_URL
});

import { TooltipProvider } from './components/ui/tooltip';

function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  );
}

export default App;
