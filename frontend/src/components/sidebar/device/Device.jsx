import Current_png from "../../../assets/current.png";

function Device() {
  return (
    <div className="playing max-2xl:hidden">
      {/* Top Section */}
      <div className="bg-dark-bluish-gray rounded-t-[6px] p-[10px] flex items-center gap-[10px] text-white text-[13px]">
        <img src={Current_png} className="w-[36px] h-[36px]" />
        <h4>
          Apple
          <br />
          Homepod
        </h4>
      </div>

      {/* Bottom Section */}
      <div className="bg-midnight-gray rounded-b-[6px] p-[8px] flex items-center justify-center gap-[6px] text-[12px]">
        <i className="bx bx-podcast text-cool-gray-txt"></i>
        <p className="text-cool-gray-txt max-4xl:text-[10px]">Playing On Device</p>
      </div>
    </div>
  );
}

export default Device;
