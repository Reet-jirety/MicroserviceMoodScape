import Trend from '../../../assets/trend.png'

export const Trending = () => {
  return (
    <div className="trending mt-[40px] flex items-center justify-between text-[#fff]">
      <div className="left">
        <h5>Trending New Song</h5>
        <div className="info mt-[12px] p-[26px]">
          <h2 className='text-[56px] mb-[8px]'>Lost Emotions</h2>
          <h4 className='inline'>Rion Clarke</h4>
          <h5 className='inline ml-[12px] text-[#919191]'>63 Million Plays</h5>
          <div className="buttons mt-[30px] flex items-center gap-[16px]">
            <button className='py-[12px] px-[16px] bg-[#5773ff] border-none rounded-[14px] text-[#fff] font-bold cursor-pointer'>Listen Now</button>
            <i className="bx bxs-heart text-[#5773ff] text-[20px] border-2 border-white p-[10px] rounded-full"></i>
          </div>
        </div>
      </div>
      <img className='w-[300px] h-[200px]' src={Trend} />
    </div>
  );
};
