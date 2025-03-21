import Header from "@/components/main/header/Header";
import Music from "./music/Music";

function Hero({ onMenuOpen, recommendations }) {
  return (
    <main className="px-[36px] py-[20px]">
      <Header onMenuOpen={onMenuOpen} />
      <Music recommendations={recommendations} />
    </main>
  );
}

export default Hero;