import React from 'react'

export default function Avatar({userId, username}) {
    const isUser = username ? true : false
    const colors = ["red", "green", "purple", "blue", "teal", "yellow", "pink"]
    const colorIdx = parseInt(userId,16) % colors.length -1
    const userColor = colors[colorIdx]

  return (
    <div>
      {isUser && (
   <div className = {"w-8 h-8 rounded-full flex items-center " + " bg-" + userColor + "-200"}>
 
    <div className = "text-center text-gray-800 w-full">{username[0]}</div>
   
        
    </div>
    )}
    </div>
  )
}
