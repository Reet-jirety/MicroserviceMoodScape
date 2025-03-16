import { useState } from 'react';
import Sidebar from "../../components/sidebar/Sidebar";
import Main from "../../components/main/Main";
import { RightSection } from "../../components/right/RightSection";

function Emotion() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="emotion_container w-full grid grid-cols-[1fr_4fr_2fr] bg-gradient-to-b from-[#050505] to-[#18181d] max-2xl:grid-cols-[3fr_2fr] max-xs:grid-cols-[1fr]">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <Main onMenuOpen={() => setIsSidebarOpen(true)} />
      {/* <RightSection /> */}
    </div>
  );
}

export default Emotion;