import Header from "@/components/main/header/Header";
import Music from "./music/Music";

function Hero({ onMenuOpen }) {
  return (
    <main className="px-[36px] py-[20px]">
      <Header onMenuOpen={onMenuOpen} />
      <Music/>
    </main>
  );
}

export default Hero;