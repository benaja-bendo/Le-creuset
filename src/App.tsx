import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import ClientLayout from './layouts/ClientLayout';
import LegalLayout from './layouts/LegalLayout';
import Home from './pages/public/Home';
import Contact from './pages/public/Contact';
import ServiceDetail from './pages/public/ServiceDetail';
import Services from './pages/public/Services';
import MentionsLegales from './pages/public/MentionsLegales';
import CGV from './pages/public/CGV';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Dashboard from './pages/client/Dashboard';
import ClientQuote from './pages/client/Quote.tsx';
import UsersPending from './pages/admin/UsersPending';
import Weights from './pages/admin/Weights';
import { Flame, Printer, Layers } from 'lucide-react';

// Import Assets
import fonteImg from './assets/fonte.png';
import impressionImg from './assets/impression-3d.png';
import moulageImg from './assets/moulage.png';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
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
        path: 'services',
        element: <Services />,
      },
      {
        path: 'fonte',
        element: <ServiceDetail 
          title="Fonte à Cire Perdue"
          subtitle="L'alchimie entre tradition millénaire et technologies modernes."
          description="Chez Le Creuset, nous maîtrisons l'art délicat de la fonte à cire perdue. Que vous nous fournissiez vos cires, vos fichiers 3D ou vos moules, nous garantissons une qualité de surface exceptionnelle et une densité de métal optimale. Nous travaillons l'or (tous titres), l'argent, le bronze et le laiton."
          icon={Flame}
          image={fonteImg}
          details={[
            { title: "Métaux Précieux", text: "Or 18k (Jaune, Rose, Gris), Argent 925. Alliages certifiés." },
            { title: "Métaux Communs", text: "Bronze et Laiton pour la bijouterie fantaisie et l'objet d'art." },
            { title: "Finitions", text: "Brut de fonte, ébavurage, sablage ou polissage complet selon vos besoins." }
          ]}
        />,
      },
      {
        path: 'impression',
        element: <ServiceDetail 
          title="Impression 3D"
          subtitle="La précision du numérique au service de votre créativité."
          description="Équipés des dernières imprimantes résine haute résolution, nous transformons vos fichiers CAD en objets physiques. Nos résines calcinables sont spécialement sélectionnées pour ne laisser aucun résidu lors de la fonte, assurant un résultat final sans porosité."
          icon={Printer}
          image={impressionImg}
          details={[
            { title: "Haute Résolution", text: "Impression jusqu'à 25 microns pour les détails les plus fins." },
            { title: "Résines Calcinables", text: "Combustion propre parfaite pour la fonte directe." },
            { title: "Prototypage", text: "Résines grises pour validation de volume avant production." }
          ]}
        />,
      },
      {
        path: 'moulage',
        element: <ServiceDetail 
          title="Moulage"
          subtitle="Dupliquer l'unique pour créer la série."
          description="Le moulage est une étape cruciale pour la reproduction de vos pièces. Nous réalisons des moules en silicone (froid) ou caoutchouc (vulcanisé à chaud) selon la fragilité de votre pièce mère (master). Nous assurons une découpe experte pour minimiser les lignes de jointure."
          icon={Layers}
          image={moulageImg}
          details={[
            { title: "Silicone RTV", text: "Moulage à froid sans retrait, idéal pour les résines et les pièces fragiles." },
            { title: "Caoutchouc", text: "Moulage à chaud pour une durabilité maximale sur les grandes séries." },
            { title: "Injection Cire", text: "Tirage de cires sous vide pour éviter les bulles d'air." }
          ]}
        />,
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
    element: <ClientLayout />,
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
        element: <div className="p-8 text-center text-secondary-500">Page Commandes en construction</div>,
      },
      {
        path: 'settings',
        element: <div className="p-8 text-center text-secondary-500">Page Paramètres en construction</div>,
      },
      {
        path: 'admin/users',
        element: <UsersPending />,
      },
      {
        path: 'admin/weights',
        element: <Weights />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_URL
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
