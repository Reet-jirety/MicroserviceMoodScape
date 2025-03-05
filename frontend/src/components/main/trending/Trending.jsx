import Trend from '../../../assets/trend.png'

export const Trending = () => {
  return (
    <div className="trending mt-[40px] flex items-center justify-between text-[#fff] max-xs:hidden">
      <div className="left">
        <h5>Trending New Song</h5>
        <div className="info mt-[12px] p-[26px]">
          <h2 className='text-[56px] mb-[8px] max-4xl:text-[36px] max-3xl:text-[24px]'>Lost Emotions</h2>
          <h4 className='inline'>Rion Clarke</h4>
          <h5 className='inline ml-[12px] text-[#919191] max-3xl:block max-3xl:text-[12px] max-3xl:ml-0'>63 Million Plays</h5>
          <div className="buttons mt-[30px] flex items-center gap-[16px]">
            <button className='py-[12px] px-[16px] bg-[#5773ff] border-none rounded-[14px] text-[#fff] font-bold cursor-pointer max-3xl:py-[10px] max-3xl:px-[12px] max-3xl:text-[12px]'>Listen Now</button>
            <i className="bx bxs-heart text-[#5773ff] text-[20px] border-2 border-white p-[10px] rounded-full max-3xl:text-[14px]"></i>
          </div>
        </div>
      </div>
      <img className='w-[300px] h-[200px] max-4xl:w-[200px] max-4xl:h-[180px] max-2xl:w-30 max-2xl:h-25 max-2xl:mt-[66px]' src={Trend} />
    </div>
  );
};
