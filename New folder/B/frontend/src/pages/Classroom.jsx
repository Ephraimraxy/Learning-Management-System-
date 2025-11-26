import React, { useEffect, useRef, useState } from 'react'
import { DailyIframe } from 'daily-js'
import { useDaily } from '@daily-co/daily-react'
import VideoTile from '../components/VideoTile'

/*
This page demonstrates a simple flow:
1. Ask your Firebase Function to create/join a Daily "room" and return an ephemeral meeting token
2. Connect using Daily's client with the token
Notes:
- For production, create tokens server-side in Firebase Functions to keep your Daily API key secret.
- This example uses REST endpoints hosted as Firebase Functions (see /functions folder).
*/

export default function Classroom({ roomName, role }) {
  const iframeRef = useRef(null)
  const [callFrame, setCallFrame] = useState(null)
  const [participants, setParticipants] = useState({})

  useEffect(() => {
    return () => {
      if (callFrame) callFrame.destroy()
    }
  }, [callFrame])

  async function join() {
    // call your Firebase Function to get a meeting token (server-side creates token)
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
    const project = '<YOUR_FIREBASE_PROJECT>' // replace or set in .env
    const url = `${base}/${project}/us-central1/createMeetingToken`
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: roomName, identity: (role==='teacher'? 'teacher':'student') + '-' + Math.floor(Math.random()*1000) })
    })
    const data = await resp.json()
    if (!data?.token || !data?.url) {
      alert('failed to get token. Check functions logs and env.')
      return
    }

    // Use Daily iframe/callframe
    const df = DailyIframe.createFrame(iframeRef.current, {
      showLeaveButton: true,
      iframeStyle: { width: '100%', height: '520px' }
    })

    df.on('participant-updated', ev => {
      setParticipants(p => ({ ...p, [ev.participant.session_id || ev.participant.user_id || ev.participant.user_name]: ev.participant }))
    })

    try {
      await df.join({ url: data.url, token: data.token })
      setCallFrame(df)
    } catch (err) {
      console.error('join error', err)
      alert('Could not join call: ' + err.message)
    }
  }

  function leave(){
    if (callFrame) {
      callFrame.leave()
      callFrame.destroy()
      setCallFrame(null)
      setParticipants({})
    }
  }

  return (
    <div>
      <div style={{marginBottom:8}}>
        <button onClick={join}>Join as {role}</button>
        <button onClick={leave} style={{marginLeft:8}}>Leave</button>
      </div>

      <div ref={iframeRef} />

      <div style={{marginTop:12}}>
        <h3>Participants</h3>
        <div className="grid">
          {Object.keys(participants).length===0 && <div>No participants yet</div>}
          {Object.entries(participants).map(([id, p]) => (
            <VideoTile key={id} participant={p} />
          ))}
        </div>
      </div>
    </div>
  )
}
