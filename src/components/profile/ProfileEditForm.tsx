"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Loader2, Save, X } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name too short"),
  department: z.string().optional(),
  designation: z.string().optional(), // Faculty
  research_area: z.string().optional(), // Faculty
  roll_number: z.string().optional(), // Student
  course: z.string().optional(), // Student
  year: z.string().optional(), // Student
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileEditForm({ profile, onCancel, onUpdate }: { profile: any, onCancel: () => void, onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      department: profile.department || "",
      designation: profile.designation || "",
      research_area: profile.research_area || "",
      roll_number: profile.roll_number || "",
      course: profile.course || "",
      year: profile.year?.toString() || "",
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);

    // 1. Update portal_users
    const { error: userError } = await supabase
      .from("portal_users")
      .update({ name: data.name })
      .eq("id", profile.id);

    if (userError) {
      alert(userError.message);
      setLoading(false);
      return;
    }

    // 2. Update role-specific table
    let roleError = null;
    if (profile.role === "faculty") {
      const { error } = await supabase
        .from("faculty_profiles")
        .update({
          department: data.department,
          designation: data.designation,
          research_area: data.research_area
        })
        .eq("user_id", profile.id);
      roleError = error;
    } else {
      const { error } = await supabase
        .from("student_profiles")
        .update({
          roll_number: data.roll_number,
          course: data.course,
          year: data.year ? parseInt(data.year) : null
        })
        .eq("user_id", profile.id);
      roleError = error;
    }

    if (roleError) {
      alert(roleError.message);
    } else {
      onUpdate();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-surface p-6 rounded-xl border border-outline animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Edit Profile Details</h3>
        <button type="button" onClick={onCancel} className="text-foreground/50 hover:text-foreground">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Full Name</label>
          <input {...register("name")} className="w-full bg-background border border-outline px-3 py-2 text-sm rounded outline-none focus:border-primary" />
          {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>}
        </div>

        <div>
           <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Department</label>
           <select {...register("department")} className="w-full bg-background border border-outline px-3 py-2 text-sm rounded outline-none focus:border-primary">
              <option value="">Select</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="IT">IT</option>
              <option value="MAC">MAC</option>
              <option value="ICE">ICE</option>
              <option value="MECH">MECH</option>
              <option value="BT">BT</option>
           </select>
        </div>

        {profile.role === "faculty" ? (
          <>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Designation</label>
              <input {...register("designation")} className="w-full bg-background border border-outline px-3 py-2 text-sm rounded outline-none focus:border-primary" placeholder="e.g. Assistant Professor" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Research Area</label>
              <input {...register("research_area")} className="w-full bg-background border border-outline px-3 py-2 text-sm rounded outline-none focus:border-primary" placeholder="e.g. Quantum Computing" />
            </div>
          </>
        ) : (
          <>
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Roll Number</label>
               <input {...register("roll_number")} className="w-full bg-background border border-outline px-3 py-2 text-sm rounded outline-none focus:border-primary" placeholder="2024UEXXXX" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Course</label>
                <input {...register("course")} className="w-full bg-background border border-outline px-3 py-2 text-sm rounded outline-none focus:border-primary" placeholder="B.Tech" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Year</label>
                <input {...register("year")} type="number" className="w-full bg-background border border-outline px-3 py-2 text-sm rounded outline-none focus:border-primary" placeholder="1-4" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-outline">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-outline/20 rounded transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="bg-primary text-on-primary px-6 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
