
import Header from "@/components/Header";
import AboutMe from "@/components/AboutMe";
import TechStack from "@/components/TechStack";
import Projects from "@/components/Projects";
import GitHubStats from "@/components/GitHubStats";
import Connect from "@/components/Connect";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="fixed inset-0 bg-[url('/hexagon-pattern.png')] bg-repeat opacity-10 pointer-events-none"></div>
      <Header />
      <main>
        <AboutMe />
        <TechStack />
        <Projects />
        <GitHubStats />
        <Connect />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
