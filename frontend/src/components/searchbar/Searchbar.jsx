import Search from "./search/Search"; 
import Option from "./option/Option";
 
function Searchbar(){
    return(
        <div className="searchbar flex flex-row items-center gap-6 pl-10 " >     
            <Option />
            <Search />
        </div>
    )
}

export default Searchbar;