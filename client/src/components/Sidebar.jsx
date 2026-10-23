import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const Sidebar = () => {

    const {getUsers, users, selectedUser, setSelectedUser,
        unseenMessages, setUnseenMessages } = useContext(ChatContext);

    const {logout, onlineUsers} = useContext(AuthContext)

    const [input, setInput] = useState(false)

    const navigate = useNavigate();

    const filteredUsers = input ? users.filter((user)=>user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

    useEffect(()=>{
        getUsers();
    },[onlineUsers])

  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ''}`}>
      <div className='pb-5'>
        <div className='flex justify-between items-center'>
            <img src={assets.logo} alt="logo" className='max-w-40' />
            <div className="relative py-2 group">
                <img src={assets.menu_icon} alt="Menu" className='max-h-5 cursor-pointer' />
                <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block'>
                    <p onClick={()=>navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
                    <hr className="my-2 border-t border-gray-500" />
                    <p onClick={()=> logout()} className='cursor-pointer text-sm'>Logout</p>
                </div>
            </div>
        </div>

        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
            <img src={assets.search_icon} alt="Search" className='w-3'/>
            <input onChange={(e)=>setInput(e.target.value)} type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search User...'/>
        </div>

      </div>

    <div className='flex flex-col gap-1'>
        {filteredUsers.map((user, index)=>(
            <div onClick={()=> {setSelectedUser(user); setUnseenMessages(prev=> ({...prev, [user._id]:0}))}}
             key={index} className={`relative flex items-center gap-2.5 p-2.5 pl-4 rounded-lg cursor-pointer transition-all max-sm:text-sm ${
                selectedUser?._id === user._id 
                    ? 'bg-[#282142]/80 shadow-sm border border-violet-500/30' 
                    : user.isBot 
                    ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/10 hover:bg-violet-600/25 border border-violet-500/20' 
                    : 'hover:bg-[#282142]/30'
            }`}>
                <div className="relative">
                    <img src={user?.profilePic || assets.avatar_icon} alt="" className={`w-[38px] aspect-[1/1] rounded-full object-cover ${user.isBot ? 'p-0.5 bg-gradient-to-tr from-violet-500 to-cyan-400' : ''}`}/>
                    {user.isBot ? (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-cyan-400 border-2 border-[#1a142e] rounded-full"></span>
                    ) : onlineUsers.includes(user._id) ? (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#1a142e] rounded-full"></span>
                    ) : null}
                </div>
                <div className='flex flex-col leading-5 flex-1 min-w-0'>
                    <div className='flex items-center gap-1.5'>
                        <p className='font-medium truncate'>{user.fullName}</p>
                        {user.isBot && (
                            <span className='text-[10px] uppercase tracking-wider font-semibold bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-1.5 py-0.2 rounded-full shadow-sm'>
                                AI
                            </span>
                        )}
                    </div>
                    {
                        user.isBot ? (
                            <span className='text-cyan-300 text-xs flex items-center gap-1'>
                                <span className='inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse'></span>
                                Gemini 2.5 • Ready
                            </span>
                        ) : onlineUsers.includes(user._id) ? (
                            <span className='text-green-400 text-xs'>Online</span>
                        ) : (
                            <span className='text-neutral-400 text-xs'>Offline</span>
                        )
                    }
                </div>
                {unseenMessages[user._id] > 0 && <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500 text-white font-medium'>{unseenMessages[user._id]}</p>}
            </div>
        ) )}
    </div>

    </div>
  )
}

export default Sidebar
