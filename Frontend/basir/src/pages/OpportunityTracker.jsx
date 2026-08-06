import { useEffect, useState } from "react";
import opportunityApi from "../config/opportunityApi";

const COLUMNS = ["saved", "preparing", "applied", "interview", "selected"];

const OpportunityTracker = () => {
  const [saved, setSaved] = useState([]);

  const load = () => {
    opportunityApi.get("/saved").then((res) => setSaved(res.data.saved));
  };

  useEffect(load, []);

  const handleDrop = async (e, status) => {
    const id = e.dataTransfer.getData("opportunityId");
    if (!id) return;
    await opportunityApi.patch(`/${id}/track`, { status });
    load();
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white px-4 py-8 md:px-10">
      <h1 className="text-2xl font-semibold mb-6">My Opportunities</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col)}
            className="bg-white/5 border border-white/10 rounded-xl p-3 min-h-[300px]"
          >
            <h3 className="text-xs uppercase text-white/50 mb-3">{col}</h3>
            {saved
              .filter((s) => s.status === col)
              .map((s) => (
                <div
                  key={s._id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("opportunityId", s.opportunity._id)
                  }
                  className="bg-white/10 rounded-lg p-2 mb-2 text-xs cursor-grab"
                >
                  <p className="font-medium">{s.opportunity?.title}</p>
                  <p className="text-white/50">{s.opportunity?.company}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpportunityTracker;
