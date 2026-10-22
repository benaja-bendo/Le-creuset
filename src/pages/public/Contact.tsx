import ContactSection from '../../components/vitrine/ContactSection';
import PageHero from '../../components/vitrine/PageHero';
import { PHOTOS } from '../../lib/photos';

export default function Contact() {
  return (
    <>
      <PageHero
        photo={PHOTOS.impression}
        title="Contact"
        lead="Un projet, une question ? Parlons-en."
        breadcrumb={[{ label: 'Accueil', to: '/' }, { label: 'Contact' }]}
      />
      <ContactSection />
    </>
  );
}
