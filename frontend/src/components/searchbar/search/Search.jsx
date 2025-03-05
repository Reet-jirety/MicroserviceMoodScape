function Search(){
  return (
     <div className="search items-center mb-6 flex flex-row border border-[#313131] w-[100%]  pl-2 gap-2 bg-[#313131] rounded-[10px] p-2">
        <i className="bx bx-search text-[20px] transition-all duration-300 ease-in-out"></i>
        {/* <div className="border border-[#919191] w-[100%] "> */}
             <input type="text" placeholder="Type here to search" className="w-[100%] light outline-none text-[#919191]"  />
        {/* </div> */}
     </div>
  )
}

export default Search;  