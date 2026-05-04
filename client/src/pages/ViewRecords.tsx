import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Download, Plus, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ViewRecords() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [newRiskCategory, setNewRiskCategory] = useState("");
  const [officerRank, setOfficerRank] = useState("");
  const [officerName, setOfficerName] = useState("");

  const recordsQuery = trpc.inspection.list.useQuery();
  const exportQuery = trpc.inspection.export.useQuery();
  const updateRiskMutation = trpc.riskCategoryUpdate.update.useMutation({
    onSuccess: () => {
      toast.success("Risk category updated successfully!");
      setShowUpdateDialog(false);
      setSelectedRecord(null);
      setNewRiskCategory("");
      setOfficerRank("");
      setOfficerName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update risk category");
    },
  });

  const handleExport = () => {
    const records = exportQuery.data;
    if (!records || records.length === 0) {
      toast.error("No records to export");
      return;
    }

    const headers = ["ID", "Building ID", "Floor", "Watch", "Date/Time", "Irregularities"];
    const rows = records.map((r: any) => [
      r.id,
      r.buildingId,
      r.floor || "",
      r.watchNumber || "",
      new Date(r.inspectionDateTime).toLocaleString(),
      r.irregularities || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inspection_records_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Records exported successfully!");
  };

  const handleUpdateRiskCategory = () => {
    if (!selectedRecord || !newRiskCategory || !officerRank || !officerName) {
      toast.error("Please fill in all fields");
      return;
    }

    updateRiskMutation.mutate({
      buildingId: selectedRecord.buildingId,
      newRiskCategory: newRiskCategory as any,
      officerRank: officerRank as any,
      officerName,
    });
  };

  const filteredRecords = (recordsQuery.data || []).filter((r: any) =>
    searchQuery === "" ||
    (r.floor && r.floor.includes(searchQuery)) ||
    (r.watchNumber && r.watchNumber.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Inspection Records</h1>
            <p className="text-slate-400">View and manage your inspection records</p>
          </div>
          <Button
            onClick={() => setLocation("/submit")}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Inspection
          </Button>
        </div>

        <Card className="bg-slate-800 border-slate-700 mb-6">
          <div className="p-6">
            <div className="flex gap-4 mb-4">
              <Input
                type="text"
                placeholder="Search by floor or watch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 flex-1"
              />
              <Button
                onClick={handleExport}
                disabled={!recordsQuery.data || recordsQuery.data.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {recordsQuery.isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading records...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No inspection records found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">ID</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Building</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Floor</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Watch</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Date/Time</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Irregularities</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record: any) => (
                      <tr key={record.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4 text-white">{record.id}</td>
                        <td className="py-3 px-4 text-white">{record.buildingId}</td>
                        <td className="py-3 px-4 text-slate-300">{record.floor || "-"}</td>
                        <td className="py-3 px-4 text-slate-300">{record.watchNumber || "-"}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {new Date(record.inspectionDateTime).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {record.irregularities ? record.irregularities.substring(0, 50) + "..." : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowUpdateDialog(true);
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Risk Category Update Dialog */}
        {showUpdateDialog && selectedRecord && (
          <Card className="bg-slate-800 border-slate-700 mb-6 fixed inset-0 m-auto max-w-md h-fit">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Update Risk Category</h2>
              <p className="text-slate-400 mb-4">
                Building: {selectedRecord.buildingId}
              </p>

              <div className="space-y-4">
                {/* Risk Category Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    New Risk Category
                  </label>
                  <Select value={newRiskCategory} onValueChange={setNewRiskCategory}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select risk category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="A*">A* (Highest Risk)</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="E">E (Lowest Risk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Officer Rank Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Officer Rank
                  </label>
                  <Select value={officerRank} onValueChange={setOfficerRank}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="SStnO">SStnO (副站長)</SelectItem>
                      <SelectItem value="StnO">StnO (站長)</SelectItem>
                      <SelectItem value="PStnO">PStnO (總隊長)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Officer Name Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Officer Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter officer name"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-6">
                  <Button
                    onClick={handleUpdateRiskCategory}
                    disabled={updateRiskMutation.isPending}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white flex-1"
                  >
                    {updateRiskMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowUpdateDialog(false);
                      setSelectedRecord(null);
                      setNewRiskCategory("");
                      setOfficerRank("");
                      setOfficerName("");
                    }}
                    variant="outline"
                    className="text-slate-300 flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Button
          variant="outline"
          onClick={() => setLocation("/")}
          className="text-slate-300"
        >
          ← Back to Home
        </Button>
      </div>
    </div>
  );
}
