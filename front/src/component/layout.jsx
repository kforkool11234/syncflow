import { Outlet } from "react-router-dom";
import "./index.css";
import Sidebar from "./sidebar";

import Header from "./header";
const layout = () => {
  return (
    <>
      <div className="whole">
        <Sidebar />
        <Header />
        <Outlet />
      </div>
    </>
  );
};

export default layout;
