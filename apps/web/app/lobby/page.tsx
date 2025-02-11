"use client";
import React, { useEffect, useRef, useState } from "react";
import { Users, Plus, LogIn } from "lucide-react";
import axios from "axios";
import { ErrorPage } from "../components/error";
import Cookies from "js-cookie";
import { notify } from "../../utils";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { checkCookies } from "../utils/cookie-check";
function Lobby() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  useEffect(() => {
    // console.log('doc cookies: ', JSON.stringify(document.cookie));
    // function checkCookies() {
    //   const tokenValue = Cookies.get("token");
    //   console.log("value: ", tokenValue);
    //   if (!tokenValue) {
    //     setIsAuthenticated(false);
    //   }
    // }
    checkCookies(setIsAuthenticated);
    // console.log(typeof(document.cookie));
  }, []);
  const createRoomRef = useRef<HTMLInputElement | null>(null);
  const [roomId, setRoomId] = useState("");
  const joinRoomRef = useRef<HTMLInputElement | null>(null);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    const slug = createRoomRef.current?.value;
    if (!slug) {
      notify("Please enter a Name for your room", false);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3002/api/v1/create-room",
        { slug },
        { withCredentials: true }
      );
      // console.log("response from create-room: " + JSON.stringify(response));
      const newRoomId = response.data.roomId;
      setRoomId(newRoomId);
      console.log("new room: " + newRoomId);
      router.push("/canvas/" + newRoomId);
    } catch (err: any) {
      // console.log('Error: ' + typeof(err.status));
      if (err.status === 409) {
        notify(
          "Room name already taken. Please choose a different one.",
          false
        );
        return;
      }
      console.log("Error joining room: " + JSON.stringify(err));
      notify("Sorry, please try again!", false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const unique_room_id = joinRoomRef.current?.value;
    if (!unique_room_id) {
      notify("Please enter a room id", false);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3002/api/v1/get-room-id/",
        { unique_room_id },
        { withCredentials: true }
      );
      const joinRoomId = response.data.message; 
      router.push('/canvas/'+joinRoomId);
      // console.log('response data: ', response.data); 
      // router.push('/canvas/'+joinRoomId); 
      // console.log('cookies: ',  Cookies.get('token'));
      // const websocketURL = 'ws://localhost:3001/?token='+Cookies.get('token');
      // console.log("websocket url: ", websocketURL);
      // const socket = new WebSocket(websocketURL);
      
      // socket.onopen = () => {
      //   console.log("Socket opened");
      //   socket.send(
      //     JSON.stringify({
      //       type: "join",
      //       payload: {
      //         roomId: joinRoomId,
      //       },
      //     })
      //   );

        // socket.onmessage = (event) => {
        //   if (event.data.toString() === "success") {
        //     router.push("/canvas/" + joinRoomId);
        //   } else {
        //     console.log("Message: " + event.data.toString());
        //   }
        // };
      // };
      // console.log("Joining room:", roomId);
    } catch (err: any) {
      console.log("Error joining room: ", err);
      notify("Sorry, please try again!", false);
    }
  };

  return isAuthenticated === true ? (
    <div className="min-h-screen bg-[#101828] flex items-center justify-center p-4">
      <ToastContainer />
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 text-white rounded-full flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Create or Join Room
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connect with others in real-time
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Create Room Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
              Create a New Room
            </h3>
            <div className="mb-4">
              {/* <label htmlFor="roomname" className="block">
                Room Name
              </label> */}
              <input
                ref={createRoomRef}
                type="text"
                placeholder="Enter a room name (eg: Red_Room)"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
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
                <p className="text-sm text-green-800">
                  Room Created! Your Room ID is:
                </p>
                <p className="text-lg font-mono font-bold text-green-900">
                  {createdRoomId}
                </p>
              </div>
            )}
          </div>

          {/* Join Room Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-center text-lg font-medium text-gray-900 mb-4">
              Join Existing Room
            </h3>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label htmlFor="roomId" className="sr-only">
                  Room ID
                </label>
                <input
                  id="roomId"
                  name="roomId"
                  type="text"
                  ref={joinRoomRef}
                  required
                  // onChange={(e) => setRoomId(e.target.value.toUpperCase())}
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
  ) : (
    <ErrorPage />
  );
}

export default Lobby;
