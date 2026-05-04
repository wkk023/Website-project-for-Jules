import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface VerificationRecord {
  id: number;
  inspectionRecordId: number;
  verifiedByStationId: number;
  verificationDate: Date | string | null;
  status: "pending" | "viewed" | "verified" | "rejected";
  notes: string | null;
}

export default function VerificationHistory() {
  const [, setLocation] = useLocation();
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "verified" | "rejected" | "pending">("all");

  const verificationQuery = trpc.verification.getRecords.useQuery();

  useEffect(() => {
    if (verificationQuery.data) {
      setRecords(verificationQuery.data);
      setLoading(false);
    }
  }, [verificationQuery.data]);

  const filteredRecords = records.filter((record) => {
    if (filter === "all") return true;
    return record.status === filter;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600";
      case "viewed":
        return "bg-blue-600";
      case "verified":
        return "bg-green-600";
      case "rejected":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusStats = () => {
    return {
      total: records.length,
      verified: records.filter((r) => r.status === "verified").length,
      rejected: records.filter((r) => r.status === "rejected").length,
      pending: records.filter((r) => r.status === "pending").length,
      viewed: records.filter((r) => r.status === "viewed").length,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="outline"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
        >
          ← Back
        </Button>

        <Card className="bg-slate-800 border-slate-700 mb-6">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Verification History</h1>
            <p className="text-slate-400 mb-8">
              Review all verification records and their status
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-slate-700 p-4 rounded">
                <div className="text-slate-400 text-sm">Total</div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </div>
              <div className="bg-green-900 p-4 rounded">
                <div className="text-slate-400 text-sm">Verified</div>
                <div className="text-2xl font-bold text-green-400">{stats.verified}</div>
              </div>
              <div className="bg-red-900 p-4 rounded">
                <div className="text-slate-400 text-sm">Rejected</div>
                <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
              </div>
              <div className="bg-blue-900 p-4 rounded">
                <div className="text-slate-400 text-sm">Viewed</div>
                <div className="text-2xl font-bold text-blue-400">{stats.viewed}</div>
              </div>
              <div className="bg-yellow-900 p-4 rounded">
                <div className="text-slate-400 text-sm">Pending</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-8 flex-wrap">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="text-sm"
              >
                All
              </Button>
              <Button
                variant={filter === "verified" ? "default" : "outline"}
                onClick={() => setFilter("verified")}
                className="text-sm bg-green-600 hover:bg-green-700"
              >
                Verified
              </Button>
              <Button
                variant={filter === "rejected" ? "default" : "outline"}
                onClick={() => setFilter("rejected")}
                className="text-sm bg-red-600 hover:bg-red-700"
              >
                Rejected
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                className="text-sm bg-yellow-600 hover:bg-yellow-700"
              >
                Pending
              </Button>
            </div>
          </div>
        </Card>

        {/* Records Table */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-8">
            {loading ? (
              <div className="text-center text-slate-400">Loading...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center text-slate-400">
                No verification records found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300">Record ID</th>
                      <th className="text-left py-3 px-4 text-slate-300">Status</th>
                      <th className="text-left py-3 px-4 text-slate-300">Verification Date</th>
                      <th className="text-left py-3 px-4 text-slate-300">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-slate-700 hover:bg-slate-700">
                        <td className="py-3 px-4 text-white">{record.inspectionRecordId}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${getStatusBadgeColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {record.verificationDate
                            ? new Date(record.verificationDate).toLocaleDateString()
                            : "Not verified"}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {record.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
