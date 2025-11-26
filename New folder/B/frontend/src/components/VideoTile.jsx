import React from 'react'

export default function VideoTile({ participant }){
  return (
    <div className="video-tile">
      <div>
        <div style={{fontSize:14}}>{participant?.user_name || participant?.session_id || 'participant'}</div>
        <div style={{fontSize:12, opacity:0.8}}>audio:{participant?.audio ? 'on' : 'off'} video:{participant?.video ? 'on' : 'off'}</div>
      </div>
    </div>
  )
}
