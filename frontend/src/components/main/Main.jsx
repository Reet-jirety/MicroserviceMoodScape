import Header from "./header/Header";
import { Playlist } from "./playlist/Playlist";
import { Trending } from "./trending/Trending";

function Main() {
    return (
      <main className="px-[36px] py-[20px]">
        <Header />
        <Trending/>
        <Playlist/>
      </main>
    );
  }
  
  export default Main;
  