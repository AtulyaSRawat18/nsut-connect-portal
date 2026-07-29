"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, X } from "lucide-react";

export function ApplyProjectButton({ projectId, maxStudents, isClosed }: { projectId: string; maxStudents: number; isClosed: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sop, setSop] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorText, setErrorText] = useState("");
  const supabase = createClient();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorText("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorText("You must be logged in to apply.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("applications")
      .insert({
        project_id: projectId,
        student_id: user.id,
        statement_of_purpose: sop,
        status: "pending"
      });

    setLoading(false);

    if (error) {
      if (error.code === '23505') { // Unique violation
        setErrorText("You have already applied for this project.");
      } else {
        setErrorText(error.message);
      }
    } else {
      setSuccess(true);
      setTimeout(() => setIsOpen(false), 2000);
    }
  };

  if (isClosed) {
    return (
      <button disabled className="block w-full bg-outline text-foreground/50 py-4 font-bold uppercase tracking-widest text-sm rounded cursor-not-allowed">
        Project Closed
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="block w-full bg-primary text-on-primary py-4 font-bold uppercase tracking-widest text-sm rounded hover:brightness-110 transition-colors"
      >
        Apply Now ({maxStudents} slots)
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border border-outline w-full max-w-lg rounded-xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-foreground/50 hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8">
              <h3 className="text-2xl font-display font-bold mb-2">Statement of Purpose</h3>
              <p className="text-sm text-foreground/70 mb-6">Briefly explain why you are a good fit for this research project. Focus on your skills and motivation.</p>

              {success ? (
                <div className="bg-green-500/10 text-green-700 p-4 rounded font-bold text-center border border-green-500/20">
                  Application submitted successfully!
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4 text-left">
                  <textarea
                    value={sop}
                    onChange={(e) => setSop(e.target.value)}
                    required
                    maxLength={1500}
                    placeholder="I am highly interested in this project because..."
                    className="w-full h-40 bg-background border border-outline p-4 rounded text-sm focus:border-primary outline-none resize-none"
                  />
                  <div className="text-right text-[10px] text-foreground/50 font-bold tracking-widest uppercase mb-4">
                    {sop.length} / 1500 chars limit
                  </div>

                  {errorText && <p className="text-red-500 text-xs font-bold">{errorText}</p>}

                  <button
                    type="submit"
                    disabled={loading || sop.length < 10}
                    className="w-full bg-primary text-on-primary py-3 font-bold uppercase tracking-widest text-sm rounded flex justify-center items-center gap-2 hover:brightness-110 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Application"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
