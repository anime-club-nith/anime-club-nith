import Navbar from '../components/NavBar';
import HeroSection from '../components/HeroSection';
import TechStack from '../components/TechStack';
import Footer from '../components/Footer';
import ShowCase from '../components/ShowCase';
import ProposedFeatures from '../components/ProposedFeatures';
import AnimatedBackground from '../components/AnimatedBackground';

export default function HomePage() {
    return (
        <>
            <Navbar />
            <AnimatedBackground />
            <HeroSection />
            <TechStack />
            <ShowCase />
            <ProposedFeatures />
            <Footer />
        </>
    );
}   