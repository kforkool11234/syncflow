import { Outlet } from "react-router-dom";
import "./index.css";
import Header from "./header";
const layout = () => {
  return (
    <>
      <div className="min-h-screen bg-transparent">
        <Header fullWidth={true} />
        <div className="pt-[80px]">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default layout;
