import { Routes, Route } from "react-router-dom";
import Dhome from "../../dashboard/Dhome";

function DashboardRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/dashboard/" element={<Dhome />} />
      </Routes>
    </div>
  );
}

export default DashboardRoutes;
