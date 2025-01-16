import React from "react"
import { Link } from "react-router-dom";
import "./index.css"
function sidebar(){
    return(<div className="sidebar font-extrabold text-xl">
        <Link to='/project'><p className="item">Project</p></Link>
        <Link to='/task'><p className="item">Task</p></Link>
        <Link to='/chat'><p className="item">Chat</p></Link>
        <Link to='/calender'><p className="item">Calender</p></Link>
    </div>)
}
export default sidebar