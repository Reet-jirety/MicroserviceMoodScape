function Menu() {
    return (
      <div className="menu mb-6">
        <h5 className="text-[#919191] mb-[12px] uppercase">Menu</h5>
        <ul className="list-none">
          <li className="mb-[12px] flex items-center gap-[20px] cursor-pointer">
            <i className="bx bxs-bolt-circle"></i>
            <a href="#" className="text-[14px] font-bold transition-all duration-300 ease-in-out">Explore</a>
          </li>
          <li className="mb-[12px] flex items-center gap-[20px] cursor-pointer">
            <i className="bx bxs-volume-full"></i>
            <a href="#" className="text-[14px] font-bold transition-all duration-300 ease-in-out">Genres</a>
          </li>
          <li className="mb-[12px] flex items-center gap-[20px] cursor-pointer">
            <i className="bx bxs-album"></i>
            <a href="#" className="text-[14px] font-bold transition-all duration-300 ease-in-out">Albums</a>
          </li>
          <li className="mb-[12px] flex items-center gap-[20px] cursor-pointer">
            <i className="bx bxs-microphone"></i>
            <a href="#" className="text-[14px] font-bold transition-all duration-300 ease-in-out">Artists</a>
          </li>
          <li className="mb-[12px] flex items-center gap-[20px] cursor-pointer">
            <i className="bx bxs-radio"></i>
            <a href="#" className="text-[14px] font-bold transition-all duration-300 ease-in-out">Podcasts</a>
          </li>
        </ul>
      </div>
    );
  }
  
  export default Menu;
  