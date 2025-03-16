import React from 'react'
import { Navbar } from './navbar/Navbar'
import { Search } from './search/Search'

const Header = ({ onMenuOpen }) => {
  return (
    <header className='flex items-center justify-between'>
      <Navbar onOpen={onMenuOpen} />
      <Search/>
    </header>
  );
}

export default Header;