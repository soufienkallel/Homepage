import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Instagram,
  Facebook,
  MessageCircle,
  Clock,
} from 'lucide-react';
import logoSvg from '../assets/mallouliauto_logo.svg';
import NewsletterSignup from './NewsletterSignup';
import { NEWSLETTER_FORM_ENABLED } from '../lib/features';
import { EMAIL, HOURS, PHONE, RESPONSE_PROMISE, whatsappLink } from '../data/contactChannels';
import { FOOTER_GROUPS } from '../data/siteNav';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#273F4F' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 xl:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr] gap-x-6 gap-y-8">
          {/* Company Info */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src={logoSvg} alt="MALLOULIAUTO" className="h-10 w-auto" />
            </Link>
            <p className="text-gray-300 text-sm mb-4">
              Le diagnostic indépendant des voitures d&apos;occasion, avec un rapport chiffré
              vérifiable en ligne.
            </p>
            <Link
              to="/demande-inspection"
              className="inline-flex items-center px-5 py-3 mb-5 bg-accent-ink hover:bg-white/15 transition-colors"
            >
              <span className="text-white font-bold text-sm">Demander un diagnostic</span>
            </Link>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/company/mallouliauto"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-orange transition-colors"
              >
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61589350186498"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-orange transition-colors"
              >
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/mallouliauto/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-orange transition-colors"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Site map: the same groups as the header's « Plus » menu (src/data/siteNav.js). */}
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="font-semibold text-lg mb-4">{group.title}</p>
              <ul className="space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-brand-orange transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <p className="font-semibold text-lg mb-4">Contact</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin size={18} className="text-brand-orange mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Sfax, Tunisie</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} className="text-brand-orange flex-shrink-0" />
                <a href={PHONE.href} className="text-gray-300 hover:text-brand-orange">
                  {PHONE.display}
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MessageCircle size={18} className="text-brand-orange flex-shrink-0" />
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-brand-orange"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} className="text-brand-orange flex-shrink-0" />
                <a href={EMAIL.href} className="text-gray-300 hover:text-brand-orange">
                  {EMAIL.display}
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <Clock size={18} className="text-brand-orange mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  {RESPONSE_PROMISE}, {HOURS}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter opt-in */}
        {NEWSLETTER_FORM_ENABLED && (
          <div
            id="newsletter"
            className="mt-12 border-t border-gray-600 pt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
          >
            <div>
              <h3 className="font-semibold text-lg mb-2">Restez informé</h3>
              <p className="text-gray-300 text-sm">
                Recevez nos guides pour acheter un véhicule d&apos;occasion, nos nouveautés produit
                et nos offres. Pas de spam, désinscription en un clic.
              </p>
            </div>
            <NewsletterSignup variant="dark" />
          </div>
        )}

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; {currentYear} MALLOULIAUTO - Startup Tunisienne d'Innovation Automobile</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy" className="hover:text-brand-orange transition-colors">
              Politique de Confidentialité
            </Link>
            <span className="text-gray-500">|</span>
            <Link to="/terms" className="hover:text-brand-orange transition-colors">
              Conditions d'Utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
