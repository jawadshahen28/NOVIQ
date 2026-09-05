import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  return (
    <a
      className="fixed bottom-3 right-3 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-noviq-whatsapp text-noviq-text transition duration-200 hover:scale-[1.05] sm:bottom-5 sm:right-5 sm:h-12 sm:w-12"
      href="https://wa.me/"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle size={20} strokeWidth={2} />
    </a>
  );
}
