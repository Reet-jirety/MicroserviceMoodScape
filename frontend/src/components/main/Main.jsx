import Header from "./header/Header";
import { Playlist } from "./playlist/Playlist";
import { Trending } from "./trending/Trending";

function Main({ onMenuOpen }) {
  return (
    <main className="px-[36px] py-[20px]">
      <Header onMenuOpen={onMenuOpen} />
      <Trending/>
      <Playlist/>
    </main>
  );
}

export default Main;