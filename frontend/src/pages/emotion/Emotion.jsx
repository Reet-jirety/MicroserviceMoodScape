import { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Hero from "@/components/emotion/hero/Hero";
import { Detect } from "@/components/emotion/right/Dectect";

function Emotion() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="emotion_container w-full grid grid-cols-[1fr_4fr_2fr] bg-gradient-to-b from-[#050505] to-[#18181d] max-2xl:grid-cols-[3fr_2fr] max-xs:grid-cols-[1fr]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Hero onMenuOpen={() => setIsSidebarOpen(true)} />
        <Detect/>
    </div>
  );
}

export default Emotion;
