import Sidebar from "../../components/sidebar/Sidebar"
import Searchbar from "../../components/searchbar/Searchbar"
import Main from "../../components/main/Main"
import { RightSection } from "../../components/right/RightSection"
function Home() {

  return (
    <div className="home_container w-full grid" style={{ gridTemplateColumns: "1fr 4fr 2fr", background: "linear-gradient(#050505, #18181d)" }}  >
      <Sidebar/>
      {/* <Searchbar/> */}
      <Main/>
      <RightSection/>
    </div>
  )
}

export default Home
