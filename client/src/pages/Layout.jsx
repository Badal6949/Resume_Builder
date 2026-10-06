import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Components/Navbar'
import {useSelector} from 'react-redux'
import { Loader } from 'lucide-react'
import Login from '../pages/Login.jsx'
const Layout = () => {
  const {user, loading} = useSelector(state => state.auth)

  if(loading){
    return <Loader/>
  }
  return (
    <div>
      {
        user ?(
          <div className='min-h-screen bg-grey-50'>
            <Navbar/>
            <Outlet />
          </div>
        ) : <Login/>
      }
      
    </div>
  )
}

export default Layout
