import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";

export default function BulkImport() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"csv" | "xlsx">("csv");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const bulkImportMutation = trpc.bulkImport.import.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith(".csv")) {
        setFileType("csv");
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        setFileType("xlsx");
      } else {
        toast.error("Please select a CSV or Excel file");
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    try {
      let fileContent: string;

      if (fileType === "csv") {
        fileContent = await file.text();
      } else {
        // For Excel files, read as base64
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const binaryString = Array.from(bytes).map((b) => String.fromCharCode(b)).join("");
        fileContent = btoa(binaryString);
      }

      const result = await bulkImportMutation.mutateAsync({
        fileContent,
        fileType,
      });
      setResult(result);

      if (result.success) {
        toast.success(`Successfully imported ${result.validRecords} records`);
      } else {
        toast.error(`Import failed: ${result.errors?.length || 0} errors found`);
      }
    } catch (error) {
      console.error("Error importing file:", error);
      toast.error("Failed to import file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
        >
          ← Back
        </Button>

        <Card className="bg-slate-800 border-slate-700 mb-6">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bulk Import</h1>
            <p className="text-slate-400 mb-8">
              Import inspection records from CSV or Excel file
            </p>

            {/* File Upload Area */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                Select File
              </label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <div className="text-slate-300 font-medium">
                    {file ? file.name : "Click to select file or drag and drop"}
                  </div>
                  <div className="text-slate-400 text-sm mt-2">
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </div>
                </label>
              </div>
            </div>

            {/* File Info */}
            {file && (
              <div className="bg-slate-700 p-4 rounded mb-8">
                <div className="text-sm text-slate-300">
                  <div>
                    <strong>File:</strong> {file.name}
                  </div>
                  <div>
                    <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
                  </div>
                  <div>
                    <strong>Type:</strong> {fileType.toUpperCase()}
                  </div>
                </div>
              </div>
            )}

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 mb-8"
            >
              {loading ? "Importing..." : "Import Records"}
            </Button>

            {/* Result */}
            {result && (
              <div className="space-y-4">
                {result.success ? (
                  <div className="bg-green-900 border border-green-700 rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <h3 className="text-green-400 font-semibold">Import Successful</h3>
                    </div>
                    <div className="text-green-300 text-sm">
                      <div>Total Records: {result.totalRecords}</div>
                      <div>Valid Records: {result.validRecords}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-900 border border-red-700 rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <h3 className="text-red-400 font-semibold">Import Failed</h3>
                    </div>
                    <div className="text-red-300 text-sm mb-4">
                      <div>Total Records: {result.totalRecords}</div>
                      <div>Valid Records: {result.validRecords}</div>
                      <div>Errors: {result.errors?.length || 0}</div>
                    </div>
                    {result.errors && result.errors.length > 0 && (
                      <div className="bg-red-950 p-3 rounded text-xs max-h-48 overflow-y-auto">
                        {result.errors.map((error: string, index: number) => (
                          <div key={index} className="text-red-200 mb-1">
                            • {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Template Info */}
            <div className="mt-12 bg-slate-700 p-6 rounded">
              <h3 className="text-white font-semibold mb-4">File Format Requirements</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Your CSV or Excel file must contain the following columns:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Building ID</strong> - e.g., "TS-1" (Required)</li>
                  <li><strong>Inspection Date/Time</strong> - e.g., "2024-05-01 10:00" (Required)</li>
                  <li><strong>Floor</strong> - e.g., "G/F" (Optional)</li>
                  <li><strong>Watch Number</strong> - e.g., "A", "B", "C" (Optional)</li>
                  <li><strong>Irregularities</strong> - Description of issues (Optional)</li>
                  <li><strong>Referral Dept ID</strong> - Numeric ID of department (Optional)</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
