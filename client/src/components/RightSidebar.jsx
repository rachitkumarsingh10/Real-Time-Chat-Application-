import React, { useContext, useEffect, useState } from 'react'
import assets, { imagesDummyData } from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'

const RightSidebar = () => {

    const {selectedUser, messages} = useContext(ChatContext)
    const {logout, onlineUsers} = useContext(AuthContext)
    const [msgImages, setMsgImages] = useState([])

    // Get all the images from the messages and set them to state
    useEffect(()=>{
        setMsgImages(
            messages.filter(msg => msg.image).map(msg=>msg.image)
        )
    },[messages])

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" : ""}`}>

        <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto text-center'>
            <div className="relative">
                <img src={selectedUser?.profilePic || assets.avatar_icon} alt=""
                className={`w-20 aspect-[1/1] rounded-full object-cover ${selectedUser.isBot ? 'p-1 bg-gradient-to-tr from-violet-500 to-cyan-400' : ''}`} />
                {(selectedUser.isBot || onlineUsers.includes(selectedUser._id)) && (
                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 absolute bottom-0 right-1 border-2 border-[#1a142e]"></span>
                )}
            </div>
            <h1 className='px-10 text-xl font-medium mx-auto flex items-center justify-center gap-2'>
                {selectedUser.fullName}
                {selectedUser.isBot && (
                    <span className='text-[10px] uppercase font-bold bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-2 py-0.5 rounded-full shadow-sm'>
                        AI
                    </span>
                )}
            </h1>
            <p className='px-6 mx-auto text-gray-300'>{selectedUser.bio}</p>

            {selectedUser.isBot && (
                <div className="mt-3 px-6 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-gray-300 max-w-[240px] text-left space-y-1">
                    <div className="text-cyan-300 font-medium">✨ Capabilities:</div>
                    <div>• Instant question answering</div>
                    <div>• Code explanation & debugging</div>
                    <div>• Image & vision recognition</div>
                    <div>• Powered by Gemini 2.5 Flash</div>
                </div>
            )}
        </div>

        <hr className="border-[#ffffff50] my-4"/>

        <div className="px-5 text-xs">
            <p>Media</p>
            <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
                {msgImages.map((url, index)=>(
                    <div key={index} onClick={()=> window.open(url)} className='cursor-pointer rounded'>
                        <img src={url} alt="" className='h-full rounded-md'/>
                    </div>
                ))}
            </div>
        </div>

        <button onClick={()=> logout()} className='absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer'>
            Logout
        </button>
    </div>
  )
}

export default RightSidebar
