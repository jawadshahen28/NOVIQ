import { Link } from 'react-router-dom';
import { storeName } from '../config/theme';

export default function Logo() {
  return (
    <Link
      to="/"
      className="group inline-flex items-center text-noviq-text"
      aria-label="الانتقال إلى الصفحة الرئيسية"
    >
      <span className="font-brand text-[27px] font-medium tracking-[0.08em] text-noviq-gold transition group-hover:text-noviq-goldHover">
        {storeName}
      </span>
    </Link>
  );
}
