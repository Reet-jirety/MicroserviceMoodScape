import { Genrex } from './genres/Genrex'
import { Musiclist } from './musiclist/Musiclist'

export const Playlist = () => {
  return (
    <div className='playlist mt-[14px] flex gap-[20px] max-2xl:mt-[40px] max-xs:hidden'>
        <Genrex/>
       <Musiclist/> 
    </div>
  )
}
