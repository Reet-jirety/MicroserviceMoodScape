import Logo from "./logo/Logo";
import Device from "./device/Device";
import Menu from "./menu/Menu";

function Sidebar() {
  return (
    // <div>
      <aside className="sidebar h-screen bg-[#18181d] py-[20px] px-[36px] flex flex-col justify-between z-[10000] transition-all duration-600 ease-in-out">
        <Logo />
        <Menu />
        <Menu />
        <Menu />
        <Device />
      </aside>
    // </div>
  );
}

export default Sidebar;
