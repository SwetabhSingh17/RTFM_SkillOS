import { useState, useEffect } from "react";
import { GraduationCap, ArrowRight, User, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../App";

// Valores por defecto cuando el perfil no existe aún en la BD
const DEFAULT_PROFILE = {
  department: "Not Assigned",
  designation: "Not Assigned",
  jobRole: "Not Assigned",
  workExperienceYears: 0,
};

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(DEFAULT_PROFILE);

  useEffect(() => {
    if (user?.onboardingCompleted) {
      navigate("/");
      return;
    }
    if (user?.id) {
      api.getCompetencyProfile(user.id)
        .then(data => {
          if (data?.profile) setProfile(data.profile);
        })
        .catch(console.error);
    }
  }, [user, navigate]);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.completeOnboarding();
      // Recargar la sesión para reflejar el cambio en el AuthContext
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0a1628] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <div className="w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-[#FF9933] to-[#e68a2e] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF9933]/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">RTFM_SkillOS</h1>
            </div>
            <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h2>
            <p className="text-slate-400">Let's set up your personalized learning profile.</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-4 px-8 pt-6">
          <div className={`flex items-center gap-2 text-sm font-medium ${step >= 1 ? "text-orange-600" : "text-slate-400"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"}`}>1</div>
            <span>Review Profile</span>
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className={`flex items-center gap-2 text-sm font-medium ${step >= 2 ? "text-orange-600" : "text-slate-400"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"}`}>2</div>
            <span>Generate Path</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Verify Your Profile</h3>
              </div>
              <p className="text-slate-500 mb-6">
                Your organization has pre-filled some details. Please review them. Our AI engine uses these <strong>Cold Start Parameters</strong> to identify your initial skill gaps.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Name</p>
                  <p className="text-lg font-semibold text-slate-900">{user?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Organization</p>
                  <p className="text-lg font-semibold text-slate-900">{user?.organization || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Department</p>
                  <p className="text-lg font-semibold text-slate-900">{profile.department}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Designation</p>
                  <p className="text-lg font-semibold text-slate-900">{profile.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Job Role</p>
                  <p className="text-lg font-semibold text-slate-900">{profile.jobRole}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Experience</p>
                  <p className="text-lg font-semibold text-slate-900">{profile.workExperienceYears || 0} Years</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0a1628] hover:bg-[#0F204C] text-white font-medium rounded-xl transition-all"
                >
                  <span>Looks Good, Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 text-center py-12">
              {!loading ? (
                <>
                  <div className="inline-flex h-20 w-20 bg-orange-100 text-orange-600 rounded-full items-center justify-center mb-6">
                    <BookOpen className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Begin!</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Our AI will analyze your profile against the Official Statistics Competency Framework to build your personalized curriculum.
                  </p>
                  <button
                    onClick={handleComplete}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-orange-500/25"
                  >
                    <span>Complete Setup & Enter Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Setting up your workspace...</h3>
                  <p className="text-slate-500">Mapping your job role to iGOT courses.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
