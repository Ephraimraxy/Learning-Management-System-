import React, { useState } from 'react'
import Classroom from './pages/Classroom'

export default function App(){
  const [role, setRole] = useState('student')
  const [room, setRoom] = useState('class-101')

  return (
    <div className="app">
      <div className="header">
        <h1>Daily + Firebase LMS Starter</h1>
        <div>
          <label>
            Role:
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </label>
        </div>
      </div>

      <div style={{marginBottom:12}}>
        <label>Room name: <input value={room} onChange={e => setRoom(e.target.value)} /></label>
      </div>

      <Classroom roomName={room} role={role} />
    </div>
  )
}
