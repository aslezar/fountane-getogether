import { Input } from "@mui/material"
import { useState } from "react"
import MessageComponent from "../components/MessageComponent"
import { Link, SendHorizontal } from "lucide-react"
const randomChatData = [
  { id: 1, message: "Hey there!", name: "Alice", date: "10:30" },
  { id: 2, message: "Hello!", name: "Bob", date: "10:32" },
  { id: 3, message: "How are you?", name: "Alice", date: "10:34" },
  { id: 4, message: "I'm good, thanks!", name: "You", date: "10:35" },
  { id: 6, message: "I'm doing well too.", name: "Alice", date: "10:37", imgSrc : "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
]

const userId = 4

const ChannelChat = () => {
  const [messages, setMessages] = useState(randomChatData)
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      const newMessageData = {
        id: userId,
        message: newMessage,
        name: "You",
        date: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setMessages([...messages, newMessageData])
      setNewMessage("")
    }
  }

  return (
    <div className="px-4 flex-col flex justify-between h-[87vh] py-4 relative lg:w-4/5 mx-auto">
      <div className="mb-4 overflow-y-auto max-h-[80vh] flex flex-col gap-3 pb-20 ">
        {messages.map((msg, index) => (
          <MessageComponent
            key={index}
            message={msg.message}
            name={msg.name}
            date={msg.date}
            isUserMessage={msg.id === userId}
            imgSrc={msg.imgSrc}
          />
        ))}
      </div>
      <div className="md:px-20 flex justify-center gap-2 items-center fixed w-4/5 backdrop-blur-md  py-4 px-4 left-1/2 translate-x-[-50%] bottom-14">
        <button className="p-2.5 border border-zinc-600 text-zinc-600 rounded-full">
          <Link size={20} />
        </button>
        <Input
          fullWidth
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage() : null)}
        />
        <button
          onClick={handleSendMessage}
          className="py-2.5 px-3 bg-zinc-600 text-white rounded-full"
        >
          <SendHorizontal size={18} />
        </button>
      </div>
    </div>
  )
}

export default ChannelChat
