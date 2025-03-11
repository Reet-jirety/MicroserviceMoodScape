function Menu() {
  const menuItems = [
    { icon: "bxs-bolt-circle", label: "Explore" },
    { icon: "bxs-volume-full", label: "Genres" },
    { icon: "bxs-album", label: "Albums" },
    { icon: "bxs-microphone", label: "Artists" },
    { icon: "bxs-radio", label: "Podcasts" },
  ];

  return (
    <div className="menu">
      <h5 className="text-[#919191] mb-[12px] uppercase">Menu</h5>
      <ul className="list-none text-white">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className="mb-[8px] flex items-center gap-[20px] cursor-pointer hover:text-blue-foreground"
          >
            <i className={`bx ${item.icon}`}></i>
            <a
              href="#"
              className="text-[14px] font-bold transition-all duration-300 ease-in-out"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Menu;
