import { Genrex } from './genres/Genrex'
import { Musiclist } from './musiclist/Musiclist'

export const Playlist = () => {
  return (
    <div className='playlist mt-[14px] flex gap-[20px]'>
        <Genrex/>
       <Musiclist/> 
    </div>
  )
}
