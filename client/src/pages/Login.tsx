import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useFireStationAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { login } = useFireStationAuth();
  const [stationCode, setStationCode] = useState("TSFStn");
  const [password, setPassword] = useState("P@ssword");
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      toast.success("Login successful!");
      login({
        id: data.stationId,
        stationCode: data.stationCode,
        stationName: data.stationName,
        token: (data as { token?: string }).token,
      });
      setTimeout(() => {
        window.location.href = "/submit";
      }, 300);
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginMutation.mutateAsync({ stationCode, password });
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Fire Inspection System</h1>
            <p className="text-slate-400">Risk-based Building Fire Safety Visit Programme</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Station Code
              </label>
              <Input
                type="text"
                placeholder="e.g., TSFStn"
                value={stationCode}
                onChange={(e) => setStationCode(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">
                Available: TSFStn, STFStn, MOSFStn, SLYFStn, TPFStn, TPEFStn
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
            <p className="text-xs text-slate-400">
              <strong>Demo Credentials:</strong><br />
              Station Code: TSFStn<br />
              Password: P@ssword
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
