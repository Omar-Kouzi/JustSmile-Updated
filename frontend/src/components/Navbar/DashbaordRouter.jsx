import { Routes, Route } from "react-router-dom";
import Dhome from "../../dashboard/Dhome";
import Dproject from "../../dashboard/Dproduct";

function DashboardRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/dashboard/" element={<Dhome />} />
        <Route path="/dashboard/Dproject" element={<Dproject />} />
        <Route path="/dashboard/" element={<Dhome />} />
        <Route path="/dashboard/" element={<Dhome />} />
        <Route path="/dashboard/" element={<Dhome />} />
        <Route path="/dashboard/" element={<Dhome />} />
        <Route path="/dashboard/" element={<Dhome />} />
        <Route path="/dashboard/" element={<Dhome />} />
      </Routes>
    </div>
  );
}

export default DashboardRoutes;
