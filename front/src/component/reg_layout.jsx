import { Outlet } from "react-router-dom";
import "./index.css";
import Header from "./header";
const layout = () => {
  return (
    <>
      <div className="whole">
        <div className="main">
        <Header />
        </div>
        <div className="content">
        <Outlet />
        </div>
        
      </div>
    </>
  );
};

export default layout;
