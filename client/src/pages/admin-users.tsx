import { useState, useEffect, useRef } from "react";
import { Users, Upload, Plus, Search, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import Papa from "papaparse";
import type { AuthUser } from "../lib/types";

export default function AdminUsers() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; error: number; errors: any[] } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      if (data && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await api.bulkUploadUsers(results.data as any);
          setUploadResult({
            success: res.successCount,
            error: res.errorCount,
            errors: res.errors
          });
          fetchUsers(); // Refresh list
        } catch (error: any) {
          setUploadResult({ success: 0, error: results.data.length, errors: [{ error: error.message }] });
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (error) => {
        setUploadResult({ success: 0, error: 1, errors: [{ error: error.message }] });
        setUploading(false);
      }
    });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.organization && u.organization.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage Trainees and Trainers across the organization.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <div className="h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>Bulk Upload (CSV)</span>
          </button>
          <a
            href="data:text/csv;charset=utf-8,username,name,email,role,organization,designation,department,jobRole,currentAssignment,educationalQualifications,workExperienceYears,previousTrainings%0Ajohndoe1,John Doe,johndoe@mospi.gov.in,learner,MoSPI,Joint Director,NSO,Data Analyst,Survey Data,MSc Statistics,5,%22Python,R%22"
            download="template.csv"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Download Template</span>
          </a>
        </div>
      </div>

      {uploadResult && (
        <div className={`p-4 rounded-xl border ${uploadResult.error > 0 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}>
          <div className="flex items-start gap-3">
            {uploadResult.error > 0 ? (
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            )}
            <div>
              <h4 className="font-semibold text-slate-900">Upload Complete</h4>
              <p className="text-sm text-slate-600 mt-1">
                Successfully created {uploadResult.success} users. {uploadResult.error} failed.
              </p>
              {uploadResult.errors.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 space-y-1 list-disc list-inside">
                  {uploadResult.errors.slice(0, 5).map((e, i) => (
                    <li key={i}>{e.user}: {e.error}</li>
                  ))}
                  {uploadResult.errors.length > 5 && (
                    <li>...and {uploadResult.errors.length - 5} more errors.</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Total Users: {users.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                    <td className="px-6 py-4 text-slate-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'hr' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'trainer' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{u.organization || 'MoSPI'}</td>
                    <td className="px-6 py-4">
                      {u.onboardingCompleted ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                          <AlertCircle className="h-3 w-3" />
                          Pending Setup
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
