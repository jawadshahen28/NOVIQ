import HeroSection from '../features/store/components/HeroSection';
import HomeCategoryGallery from '../features/store/components/HomeCategoryGallery';
import SelectedWatches from '../features/store/components/SelectedWatches';
import TrustStrip from '../features/store/components/TrustStrip';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HomeCategoryGallery />
      <SelectedWatches />
      <TrustStrip />
    </>
  );
}
