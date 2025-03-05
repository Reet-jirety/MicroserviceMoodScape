import React from 'react'
import { Navbar } from './navbar/Navbar'
import { Search } from './search/Search'

const Header = () => {
  return (
    <header className='flex items-center justify-between'>
        <Navbar/>
        <Search/>
    </header>
  )
}

export default Header