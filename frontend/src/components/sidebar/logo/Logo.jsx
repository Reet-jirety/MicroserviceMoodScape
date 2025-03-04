function Logo() {
    return (
      <div className="flex items-center gap-[6px]">
        <button className="menu-btn" id="menu-close">
          <i className="bx bx-log-out-circle text-[24px] transition-all duration-300 ease-in-out"></i>
        </button>
        <i className="bx bx-pulse text-[24px] transition-all duration-300 ease-in-out"></i>
        <a href="/" className="font-bold transition-all duration-300 ease-in-out text-white">DilBeats</a>
      </div>
    );
  }
  
  export default Logo;
  