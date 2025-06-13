import { FC } from "react";
import "@xyflow/react/dist/base.css";
import { Home } from "@/pages/Home";

const App: FC = () => {
  return (
    <div className="h-full w-full">
      <Home />
    </div>
  );
};

export default App;
