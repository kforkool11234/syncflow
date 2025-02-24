import React from "react";
import Header from "./header";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Project from "./project";
import Chat from "./chat";
import Pinfo from "./pinfo";
import PForm from "./pnew";
import Login from "./login";
import Signup from "./signup";
import ChatUI from "./chatUI";
import TaskList from "./task";
import CalendarView from "./CalanderView";
import Layout from "./layout";
import Layout2 from "./reg_layout";
function App() {
  const location = useLocation(); // Get current location

  return (
    <div>
      {/* <div className='whole'>
            <Header /> */}
      {/* Conditionally render Sidebar based on the current path */}
      {/* {(location.pathname !== '/login' && location.pathname !== '/signup') && <Sidebar />} */}
      <Routes>
        <Route path="/registration" element={<Layout2 />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        <Route path="/" element={<Layout />}>
          <Route path="project" element={<Project />} />
          <Route path="project/:pid" element={<Pinfo />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/newproject" element={<PForm />} />
          <Route path="chat/:cid" element={<ChatUI />} />
          <Route path="/task" element={<TaskList />} />
          <Route path="/calender" element={<CalendarView />} />
        </Route>
      </Routes>
      {/* // </div> */}
    </div>
  );
}

// Wrap App component with Router
const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
