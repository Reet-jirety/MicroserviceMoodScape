import Logo from "./logo/Logo";
import Device from "./device/Device";
import Menu from "./menu/Menu";

function Sidebar({ isOpen, onClose }) {
  return (
    <aside 
      className="sidebar h-screen bg-obsidian-gray py-[20px] px-[36px] flex flex-col justify-between z-[10000] transition-all duration-600 ease-in-out max-2xl:absolute max-2xl:left-[-100%]"
      style={{ 
        left: isOpen ? '0' : '-100%',
        transition: 'left 0.6s ease-in-out' 
      }}
    >
      <Logo onClose={onClose} />
      <Menu />
      
      <Device />
    </aside>
  );
}

export default Sidebar;