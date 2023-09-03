import React from 'react'

export default function Avatar({userId, username}) {
    const isUser = username ? true : false
    const colors = ["red", "green", "purple", "blue", "teal", "yellow", "pink"]
    console.log(userId, "TAkE A LOOK AT THE USER ID")
    const colorIdx = parseInt(userId,16) % colors.length -1
    console.log(colorIdx)
    const userColor = colors[colorIdx]
    console.log(userColor)

  return (
    <div>
      {isUser && (
   <div className = {"w-8 h-8 rounded-full flex items-center" + " bg-" + userColor + "-200"}>
 
    <div className = "text-center text-gray-800 w-full">{username[0]}</div>
   
        
    </div>
    )}
    </div>
  )
}
