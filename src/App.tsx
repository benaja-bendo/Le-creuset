import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import LegalLayout from './layouts/LegalLayout';
import Home from './pages/public/Home';
import Contact from './pages/public/Contact';
import Fonte from './pages/public/Fonte';
import Impression from './pages/public/Impression';
import Moulage from './pages/public/Moulage';
import Services from './pages/public/Services';
import Login from './pages/public/Login';
import WaitingApproval from './pages/public/WaitingApproval';
import ErrorPage from './pages/public/ErrorPage';
import ProtectedRoute, { ClientLoading } from './components/ProtectedRoute';

// Le chunk d'entrée ne porte que la vitrine et la connexion. Le reste est
// téléchargé à la première visite de la page, cf. docs/02-frontend.md#découpage-du-bundle.

// Pages publiques rarement ouvertes : textes légaux, inscription, lien de réinitialisation.
// LegalLayout reste dans l'entrée (1 Ko) : différé, il retarderait d'autant sa page.
const MentionsLegales = lazy(() => import('./pages/public/MentionsLegales'));
const CGV = lazy(() => import('./pages/public/CGV'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const Register = lazy(() => import('./pages/public/Register'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));

// Espace client et admin, layout compris. Leurs pages sont les seules à importer
// STLViewer, donc three.js.
const ClientLayout = lazy(() => import('./layouts/ClientLayout'));
const Dashboard = lazy(() => import('./pages/client/Dashboard'));
const ClientQuote = lazy(() => import('./pages/client/Quote'));
const Orders = lazy(() => import('./pages/client/Orders'));
const OrderDetail = lazy(() => import('./pages/client/OrderDetail'));
const Molds = lazy(() => import('./pages/client/Molds'));
const Profile = lazy(() => import('./pages/client/Profile'));
const MyInvoices = lazy(() => import('./pages/client/MyInvoices'));
const WeightAccount = lazy(() => import('./pages/client/WeightAccount'));
const UsersPending = lazy(() => import('./pages/admin/UsersPending'));
const AdminUserProfile = lazy(() => import('./pages/admin/UserProfile'));
const Weights = lazy(() => import('./pages/admin/Weights'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminInvoices = lazy(() => import('./pages/admin/Invoices'));
const AdminCreateInvoice = lazy(() => import('./pages/admin/CreateInvoice'));
const AdminLibrary = lazy(() => import('./pages/admin/Library'));

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

// Chaque layout met ses pages sous Suspense ; cette frontière-ci ne rattrape que
// ClientLayout. À la racine, elle est déjà affichée quand on navigue vers
// l'espace client : la navigation (une transition) garde la page courante à
// l'écran le temps du téléchargement. Sur un chargement direct, elle prend le
// relais de l'écran de restauration de session, à l'identique.
function App() {
  return (
    <Suspense fallback={<ClientLoading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
