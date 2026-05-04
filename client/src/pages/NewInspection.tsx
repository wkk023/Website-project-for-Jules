import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function NewInspection() {
  const [, setLocation] = useLocation();
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [floor, setFloor] = useState("");
  const [watchNumber, setWatchNumber] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [inspectionTime, setInspectionTime] = useState("");
  const [irregularities, setIrregularities] = useState("");
  const [referralDepartmentId, setReferralDepartmentId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [referralDepartments, setReferralDepartments] = useState<any[]>([]);

  const buildingsQuery = trpc.building.list.useQuery();
  const referralDepartmentsQuery = trpc.referralDepartment.list.useQuery();
  const submitMutation = trpc.inspection.submit.useMutation({
    onSuccess: () => {
      toast.success("Inspection record submitted successfully!");
      setLocation("/records");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit inspection record");
    },
  });

  useEffect(() => {
    if (buildingsQuery.data) {
      setBuildings(buildingsQuery.data);
    }
  }, [buildingsQuery.data]);

  useEffect(() => {
    if (referralDepartmentsQuery.data) {
      setReferralDepartments(referralDepartmentsQuery.data);
    }
  }, [referralDepartmentsQuery.data]);

  const filteredBuildings = buildings.filter(
    (b) => {
      const query = searchQuery.toLowerCase();
      return (
        b.lifipsNumber?.toLowerCase().includes(query) ||
        b.address?.toLowerCase().includes(query) ||
        b.location?.toLowerCase().includes(query) ||
        b.streetName?.toLowerCase().includes(query) ||
        b.buildingName?.toLowerCase().includes(query)
      );
    }
  );

  // Show dropdown only if there's a search query and results
  const showDropdown = searchQuery.length > 0 && filteredBuildings.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBuilding || !inspectionDate || !inspectionTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const inspectionDateTime = new Date(`${inspectionDate}T${inspectionTime}`);
      await submitMutation.mutateAsync({
        buildingId: selectedBuilding.lifipsNumber,
        floor: floor || undefined,
        watchNumber: watchNumber || undefined,
        inspectionDateTime,
        irregularities: irregularities || undefined,
        referralDepartmentId: referralDepartmentId || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={() => setLocation("/records")}
          className="mb-6"
        >
          ← Back
        </Button>

        <Card className="bg-slate-800 border-slate-700">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Submit Inspection Record</h1>
            <p className="text-slate-400 mb-8">
              Risk-based Building Fire Safety Visit Programme
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Building Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Building (Required)
                </label>
                <Input
                  type="text"
                  placeholder="Search by street name, building name, address, or LIFIPS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 mb-2"
                />
                {searchQuery && filteredBuildings.length > 0 && (
                  <div className="bg-slate-700 border border-slate-600 rounded-lg max-h-48 overflow-y-auto">
                    {filteredBuildings.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBuilding(b);
                          setSearchQuery("");
                        }}
                        className="w-full text-left p-3 hover:bg-slate-600 border-b border-slate-600 last:border-b-0 text-white"
                      >
                        <div className="font-semibold">{b.lifipsNumber}</div>
                        {b.streetName && (
                          <div className="text-sm text-cyan-400">Street: {b.streetName}</div>
                        )}
                        {b.buildingName && (
                          <div className="text-sm text-yellow-400">Building: {b.buildingName}</div>
                        )}
                        <div className="text-sm text-slate-400">{b.address}</div>
                        <div className="text-xs text-slate-500">{b.location}</div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedBuilding && (
                  <div className="mt-2 p-3 bg-slate-700 border border-cyan-600 rounded-lg text-white space-y-2">
                    <div className="font-semibold text-cyan-400">{selectedBuilding.lifipsNumber}</div>
                    <div className="text-sm">{selectedBuilding.address}</div>
                    {selectedBuilding.location && (
                      <div className="text-xs text-slate-400">
                        Location: {selectedBuilding.location}
                      </div>
                    )}
                    {selectedBuilding.buildingType && (
                      <div className="text-xs text-slate-400">
                        Building Type: {selectedBuilding.buildingType}
                      </div>
                    )}
                    <div className="text-xs text-slate-400">
                      Risk Category: {selectedBuilding.riskCategory || "N/A"}
                    </div>
                  </div>
                )}
              </div>

              {/* Floor */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Floor
                </label>
                <Input
                  type="text"
                  placeholder="e.g., G, 1, 2, B1"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  disabled={loading}
                />
              </div>

              {/* Watch Number */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Watch Number
                </label>
                <select
                  value={watchNumber}
                  onChange={(e) => setWatchNumber(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                  disabled={loading}
                >
                  <option value="">Select Watch</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              {/* Inspection Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Inspection Date (Required)
                  </label>
                  <Input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Inspection Time (Required)
                  </label>
                  <Input
                    type="time"
                    value={inspectionTime}
                    onChange={(e) => setInspectionTime(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Irregularities */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Irregularities
                </label>
                <textarea
                  placeholder="Describe any irregularities found..."
                  value={irregularities}
                  onChange={(e) => setIrregularities(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 placeholder-slate-500 resize-none"
                  rows={4}
                  disabled={loading}
                />
              </div>

              {/* Referral Department */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Referral Department
                </label>
                <select
                  value={referralDepartmentId || ""}
                  onChange={(e) => setReferralDepartmentId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                  disabled={loading}
                >
                  <option value="">None</option>
                  {referralDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName} ({dept.departmentCode})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Inspection Record"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
