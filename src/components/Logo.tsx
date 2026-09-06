import { Link } from 'react-router-dom';
import { storeName } from '../config/theme';

interface LogoProps {
  label?: string;
}

export default function Logo({ label = storeName }: LogoProps) {
  return (
    <Link
      to="/"
      className="group inline-flex items-center text-noviq-text"
      aria-label="الانتقال إلى الصفحة الرئيسية"
    >
      <span
        className="max-w-[42vw] truncate font-brand text-[27px] font-medium tracking-[0.08em] text-noviq-gold transition group-hover:text-noviq-goldHover"
        title={label}
      >
        {label}
      </span>
    </Link>
  );
}
