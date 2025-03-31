function Menu() {
  const menuItems = [
    { icon: "bxs-bolt-circle", label: "Explore" },
    { icon: "bxs-volume-full", label: "Genres" },
    { icon: "bxs-album", label: "Albums" },
    { icon: "bxs-microphone", label: "Artists" },
   
  ];

  const [explore, genres, albums, artists] = menuItems;

  return (
    <div className="menu">
      <h5 className="text-[#919191] mb-[12px] uppercase">Menu</h5>
      <ul className="list-none text-white">
      <li className="mb-[8px] flex items-center gap-[20px] cursor-pointer hover:text-blue-foreground">
          <i className={`bx ${explore.icon}`}></i>
          <a
            href="/explore"
            className="text-[14px] font-bold transition-all duration-300 ease-in-out"
          >
            {explore.label}
          </a>
        </li>

        {/* Genres Link */}
        <li className="mb-[8px] flex items-center gap-[20px] cursor-pointer hover:text-blue-foreground">
          <i className={`bx ${genres.icon}`}></i>
          <a
            href="/genres"
            className="text-[14px] font-bold transition-all duration-300 ease-in-out"
          >
            {genres.label}
          </a>
        </li>

        {/* Albums Link */}
        <li className="mb-[8px] flex items-center gap-[20px] cursor-pointer hover:text-blue-foreground">
          <i className={`bx ${albums.icon}`}></i>
          <a
            href="/albums"
            className="text-[14px] font-bold transition-all duration-300 ease-in-out"
          >
            {albums.label}
          </a>
        </li>

        {/* Artists Link */}
        <li className="mb-[8px] flex items-center gap-[20px] cursor-pointer hover:text-blue-foreground">
          <i className={`bx ${artists.icon}`}></i>
          <a
            href="/artists"
            className="text-[14px] font-bold transition-all duration-300 ease-in-out"
          >
            {artists.label}
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Menu;
