import HeroSection from '../features/store/components/HeroSection';
import HomeCategoryGallery from '../features/store/components/HomeCategoryGallery';
import SelectedWatches from '../features/store/components/SelectedWatches';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HomeCategoryGallery />
      <SelectedWatches />
    </>
  );
}
