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

export default function VerificationDashboard() {
  const [, setLocation] = useLocation();
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const verificationQuery = trpc.verification.getRecords.useQuery();
  const markViewedMutation = trpc.verification.markViewed.useMutation({
    onSuccess: () => {
      toast.success("Record marked as viewed");
      verificationQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark as viewed");
    },
  });

  const verifyMutation = trpc.verification.verify.useMutation({
    onSuccess: () => {
      toast.success("Record verified successfully");
      verificationQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to verify record");
    },
  });

  useEffect(() => {
    if (verificationQuery.data) {
      setRecords(verificationQuery.data);
      setLoading(false);
    }
  }, [verificationQuery.data]);

  const handleMarkViewed = (recordId: number) => {
    markViewedMutation.mutate({ recordId });
  };

  const handleVerify = (recordId: number, status: "verified" | "rejected") => {
    verifyMutation.mutate({
      recordId,
      status,
      notes: "",
    });
  };

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

        <Card className="bg-slate-800 border-slate-700">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Verification Dashboard</h1>
            <p className="text-slate-400 mb-8">
              Review and verify inspection records from other stations
            </p>

            {loading ? (
              <div className="text-center text-slate-400">Loading...</div>
            ) : records.length === 0 ? (
              <div className="text-center text-slate-400">
                No verification records available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300">Record ID</th>
                      <th className="text-left py-3 px-4 text-slate-300">Status</th>
                      <th className="text-left py-3 px-4 text-slate-300">Verification Date</th>
                      <th className="text-left py-3 px-4 text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
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
                        <td className="py-3 px-4">
                          {record.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleMarkViewed(record.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Mark Viewed
                              </Button>
                            </div>
                          )}
                          {record.status === "viewed" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerify(record.id, "verified")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleVerify(record.id, "rejected")}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {(record.status === "verified" || record.status === "rejected") && (
                            <span className="text-slate-400">Completed</span>
                          )}
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
