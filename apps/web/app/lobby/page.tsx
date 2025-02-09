'use client'
import React, { useEffect, useState } from 'react';
import { Users, Plus, LogIn } from 'lucide-react';
import axios from 'axios';
import { ErrorPage } from '../components/error';
import Cookies from 'js-cookie'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); 
    useEffect(() =>{ 
        // console.log('doc cookies: ', JSON.stringify(document.cookie));
        function checkCookies(){ 
            const tokenValue = Cookies.get('token');
            console.log("value: ", tokenValue)
            if(!tokenValue){
                setIsAuthenticated(false);
            } 

        }
        checkCookies();
        // console.log(typeof(document.cookie));
    }, [])
  const [roomId, setRoomId] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  const handleCreateRoom = async() => {
    // Generate a random room ID (in a real app, this would come from the backend)
    // const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    // setCreatedRoomId(newRoomId);

    const response = await axios.post('/api/users/create-room',  {withCredentials:true});

  };    

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would validate and connect to the room
    console.log('Joining room:', roomId);
  };

  return isAuthenticated===true?(
    <div className="min-h-screen bg-[#101828] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 text-white rounded-full flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Create or Join Room</h2>
          <p className="mt-2 text-sm text-gray-600">Connect with others in real-time</p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Create Room Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Create a New Room</h3>
            <div className='mb-4'>
            <label htmlFor="roomname" className='block'>Room Name</label>
            <input type="text" placeholder="My Secret Room" className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'/>

            </div>
            <button
              onClick={handleCreateRoom}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </button>
            {createdRoomId && (
              <div className="mt-4 p-4 bg-green-50 rounded-md">
                <p className="text-sm text-green-800">Room Created! Your Room ID is:</p>
                <p className="text-lg font-mono font-bold text-green-900">{createdRoomId}</p>
              </div>
            )}
          </div>

          {/* Join Room Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Join Existing Room</h3>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label htmlFor="roomId" className="sr-only">
                  Room ID
                </label>
                <input
                  id="roomId"
                  name="roomId"
                  type="text"
                  required
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter Room ID"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Join Room
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  ):<ErrorPage/>;
}

export default App;