import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import ThreeD from "./ThreeD"
import HyperText from "../components/HyperText";
import Loader from "../components/Loader";
import "boxicons";


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await axios.get(`${baseUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error(error);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);



  if (!user) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex ">
     
  
      {/* Content container aligned to the top-left corner */}
      <div className="flex-1 p-8 pl-[8%] mt-12 lg:mt-0 md:mt-0 md:ml-8 lg:ml-0 ml-0">
        <h1 className="text-lg md:text-2xl lg:text-4xl font-bold">
          Welcome to the <span className="text-lg md:text-2xl lg:text-4xl font-bold text-highlight">STARTUP MART</span> <HyperText>{user.username}</HyperText>
        </h1>
        {/* <ThreeD/> */}
      </div>
    </div>
  );
};

export default Dashboard;
