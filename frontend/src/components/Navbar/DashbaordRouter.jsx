import { Routes, Route } from "react-router-dom";
import Dhome from "../../dashboard/Dhome";
import Dproducts from "../../dashboard/Dproducts";
import Dproduct from "../../dashboard/Dproduct";
import Dorders from "../../dashboard/Dorders";
import Dabout from "../../dashboard/Dabout";

function DashboardRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/dashboard/" element={<Dhome />} />
        <Route path="/dashboard/Dproducts" element={<Dproducts />} />
        <Route path="/dashboard/Dproduct/:id" element={<Dproduct />} />
        <Route path="/dashboard/Dabout" element={<Dabout />} />
        <Route path="/dashboard/Dorders" element={<Dorders />} />
      </Routes>
    </div>
  );
}

export default DashboardRoutes;
