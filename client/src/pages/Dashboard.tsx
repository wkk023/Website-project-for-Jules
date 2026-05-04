import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertCircle, FileText, CheckCircle2 } from "lucide-react";

const COLORS = [
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#fcd34d",
  "#fbbf24",
  "#f59e0b",
  "#d97706",
  "#b45309",
  "#92400e",
  "#78350f",
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();

  const isLoading = statsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400 text-lg">Fire inspection statistics and analytics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Total Inspections */}
          <Card className="bg-slate-800 border-slate-700 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-slate-300">Total Inspections</h3>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats?.totalInspections || 0}
              </div>
            </div>
          </Card>

          {/* Total Verifications */}
          <Card className="bg-slate-800 border-slate-700 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-medium text-slate-300">Total Verifications</h3>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats?.totalVerifications || 0}
              </div>
            </div>
          </Card>

          {/* Verified */}
          <Card className="bg-slate-800 border-slate-700 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-medium text-slate-300">Verified</h3>
              </div>
              <div className="text-3xl font-bold text-green-400">
                {stats?.verifiedCount || 0}
              </div>
            </div>
          </Card>

          {/* Pending Verifications */}
          <Card className="bg-slate-800 border-slate-700 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-medium text-slate-300">Pending</h3>
              </div>
              <div className="text-3xl font-bold text-yellow-400">
                {stats?.pendingVerifications || 0}
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends */}
          <Card className="bg-slate-800 border-slate-700 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-6">Inspection Trends (Last 6 Months)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.trendData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Verification Status */}
          <Card className="bg-slate-800 border-slate-700 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-6">Verification Status Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.verificationStats || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats?.verificationStats?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={() => setLocation("/submit")}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            New Inspection
          </Button>
          <Button
            onClick={() => setLocation("/records")}
            variant="outline"
            className="text-slate-300"
          >
            View Records
          </Button>
          <Button
            onClick={() => setLocation("/verification")}
            variant="outline"
            className="text-slate-300"
          >
            Verification Dashboard
          </Button>
          <Button
            onClick={() => setLocation("/verification-history")}
            variant="outline"
            className="text-slate-300"
          >
            Verification History
          </Button>
          <Button
            onClick={() => setLocation("/bulk-import")}
            variant="outline"
            className="text-slate-300"
          >
            Bulk Import
          </Button>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="text-slate-300"
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
