import {
  Facebook,
  Instagram,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import { useCart } from '../features/cart/CartContext';
import FloatingWhatsApp from '../features/store/components/FloatingWhatsApp';
import { useStoreSettings } from '../features/store/settings/StoreSettingsContext';
import { defaultStoreSettings } from '../features/store/settings/storeSettingsDefaults';
import {
  createExternalHref,
  createPhoneHref,
  createWhatsAppHref,
} from '../utils/contactLinks';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex h-[72px] items-center text-[13px] font-medium transition duration-200 after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:-translate-x-1/2 after:bg-noviq-gold after:transition-all after:duration-200 ${
    isActive
      ? 'text-noviq-text after:w-7'
      : 'text-noviq-text after:w-0 hover:text-noviq-gold hover:after:w-7'
  }`;

const anchorClass =
  'relative flex h-[72px] items-center text-[13px] font-medium text-noviq-text transition duration-200 after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-noviq-gold after:transition-all after:duration-200 hover:text-noviq-gold hover:after:w-7';

export default function StoreLayout() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();
  const { settings } = useStoreSettings();
  const storeName = settings.storeName || defaultStoreSettings.storeName;
  const copyrightText =
    settings.copyrightText.trim() || `جميع الحقوق محفوظة ${storeName} © 2026`;
  const phoneLinks = [
    { href: createPhoneHref(settings.storePhone), label: settings.storePhone.trim() },
    { href: createPhoneHref(settings.secondaryPhone), label: settings.secondaryPhone.trim() },
  ].filter((link) => link.href && link.label);
  const socialLinks = [
    {
      href: createExternalHref(settings.instagramUrl),
      icon: Instagram,
      label: 'Instagram',
    },
    {
      href: createExternalHref(settings.facebookUrl),
      icon: Facebook,
      label: 'Facebook',
    },
    {
      href: createWhatsAppHref(settings.whatsappNumber),
      icon: MessageCircle,
      label: 'WhatsApp',
    },
  ].filter((link) => link.href);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      if (location.hash) {
        const element = document.getElementById(decodeURIComponent(location.hash.slice(1)));

        if (element) {
          element.scrollIntoView({ block: 'start' });
        }

        return;
      }

      window.scrollTo({ left: 0, top: 0 });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen bg-noviq-black text-noviq-text">
      <header
        className="sticky top-0 z-50 border-b border-noviq-border bg-noviq-pure"
        data-store-header
      >
        <div className="luxury-container relative flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Logo label={storeName} />

          <nav
            className="absolute left-1/2 top-0 hidden -translate-x-1/2 items-center justify-center gap-9 lg:flex"
            aria-label="قائمة المتجر"
          >
            <NavLink to="/" end className={linkClass}>
              الرئيسية
            </NavLink>
            <a className={anchorClass} href="/#selected-watches">
              المتجر
            </a>
            <a className={anchorClass} href="/#categories">
              الفئات
            </a>
            <a className={anchorClass} href="/#contact">
              تواصل معنا
            </a>
          </nav>

          <div className="flex items-center justify-end gap-3" dir="ltr">
            <a
              href="/#selected-watches"
              className="hidden h-9 w-9 items-center justify-center text-noviq-secondaryText transition duration-200 hover:text-noviq-gold sm:inline-flex"
              aria-label="البحث"
            >
              <Search size={20} strokeWidth={1.8} />
            </a>
            <Link
              to="/cart"
              className="relative inline-flex h-9 w-9 items-center justify-center text-noviq-secondaryText transition duration-200 hover:text-noviq-gold"
              data-cart-link
              aria-label="سلة التسوق"
            >
              <ShoppingBag size={20} strokeWidth={1.8} />
              {itemCount > 0 ? (
                <span
                  className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-noviq-gold px-1 text-[10px] font-bold text-noviq-black"
                  aria-live="polite"
                  data-cart-count
                >
                  {itemCount}
                </span>
              ) : null}
            </Link>

            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-noviq-border text-noviq-secondaryText transition duration-200 hover:border-noviq-gold hover:text-noviq-gold lg:hidden"
              onClick={() => setIsOpen((current) => !current)}
              type="button"
              aria-label={isOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isOpen ? (
          <nav className="border-t border-noviq-border bg-noviq-pure lg:hidden">
            <div className="luxury-container grid gap-1 py-3">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `rounded-md px-3 py-3 text-sm font-semibold ${
                    isActive ? 'text-noviq-gold' : 'text-noviq-secondaryText'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                الرئيسية
              </NavLink>
              <a
                className="rounded-md px-3 py-3 text-sm font-semibold text-noviq-secondaryText"
                href="/#selected-watches"
                onClick={() => setIsOpen(false)}
              >
                المتجر
              </a>
              <a
                className="rounded-md px-3 py-3 text-sm font-semibold text-noviq-secondaryText"
                href="/#categories"
                onClick={() => setIsOpen(false)}
              >
                الفئات
              </a>
              <a
                className="rounded-md px-3 py-3 text-sm font-semibold text-noviq-secondaryText"
                href="/#contact"
                onClick={() => setIsOpen(false)}
              >
                تواصل معنا
              </a>
            </div>
          </nav>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer id="contact" className="border-t border-noviq-border bg-noviq-pure">
        <div className="luxury-container grid min-h-24 gap-5 py-7 text-center sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:text-right">
          <div className="grid min-w-0 gap-3">
            <div className="flex justify-center sm:justify-start">
              <Logo label={storeName} />
            </div>

            {phoneLinks.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-noviq-secondaryText sm:justify-start">
                {phoneLinks.map((phoneLink, index) => (
                  <a
                    key={`${phoneLink.label}-${index}`}
                    className="inline-flex min-h-8 items-center gap-2 transition hover:text-noviq-gold"
                    href={phoneLink.href}
                  >
                    <Phone size={15} className="shrink-0 text-noviq-gold" strokeWidth={1.8} />
                    <span dir="ltr">{phoneLink.label}</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col items-center gap-3 sm:items-end">
            {socialLinks.length > 0 ? (
              <div className="flex items-center gap-3" dir="ltr">
                {socialLinks.map((socialLink) => {
                  const Icon = socialLink.icon;

                  return (
                    <a
                      key={socialLink.label}
                      aria-label={socialLink.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-noviq-border text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
                      href={socialLink.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon size={17} strokeWidth={1.8} />
                    </a>
                  );
                })}
              </div>
            ) : null}

            <p className="text-xs leading-6 text-noviq-muted">{copyrightText}</p>
          </div>
        </div>
      </footer>

      <FloatingWhatsApp />
    </div>
  );
}
