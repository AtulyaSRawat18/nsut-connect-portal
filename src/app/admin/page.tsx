import Link from "next/link";
import { LayoutDashboard, Users, ShieldAlert, FileText, Settings, BarChart3, Bell, CheckCircle, XCircle } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";

export default async function AdminPanel() {
  await requirePageIdentity({ roles: ["admin"] });

  return (
    <div className="min-h-screen bg-surface font-sans">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-secondary min-h-screen p-8 text-white hidden lg:block">
           <h2 className="text-xl font-display font-black text-primary mb-12 tracking-tight">Admin Console</h2>
           <nav className="space-y-6">
              {[
                { name: 'Dashboard', icon: LayoutDashboard, active: true },
                { name: 'Verification Queue', icon: Users, alert: 12 },
                { name: 'Content Moderation', icon: ShieldAlert, alert: 5 },
                { name: 'System Logs', icon: FileText },
                { name: 'Settings', icon: Settings }
              ].map(item => (
                <Link key={item.name} href="#" className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${item.active ? 'text-primary' : 'text-white/50 hover:text-white'}`}>
                   <item.icon className="w-4 h-4" /> {item.name}
                   {item.alert && <span className="ml-auto bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full">{item.alert}</span>}
                </Link>
              ))}
           </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 lg:p-12">
           <header className="flex justify-between items-center mb-12">
              <h1 className="text-3xl font-display font-black text-foreground tracking-tight">System Overview</h1>
              <div className="flex items-center gap-6">
                 <button className="relative p-2 text-foreground/50 hover:text-primary transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                 </button>
                 <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold">A</div>
              </div>
           </header>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Total Users', value: '4,521', growth: '+12%', icon: Users },
                { label: 'Active Projects', value: '458', growth: '+5%', icon: FileText },
                { label: 'Verification Rate', value: '98.2%', growth: '+2%', icon: BarChart3 },
                { label: 'System Uptime', value: '99.9%', growth: 'Stable', icon: ShieldAlert }
              ].map(stat => (
                <div key={stat.label} className="bg-background border border-outline p-6 rounded-xl shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-primary/5 rounded-lg text-primary">
                         <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-green-500">{stat.growth}</span>
                   </div>
                   <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                   <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Verification Queue Table */}
              <div className="bg-background border border-outline rounded-xl p-8 overflow-hidden">
                 <h3 className="text-sm font-black text-foreground/50 uppercase tracking-[0.2em] mb-8">Faculty Verification Queue</h3>
                 <div className="space-y-6">
                    {[
                      { name: 'Dr. Alok Nath', dept: 'CSE', date: '2h ago', avatar: 'A' },
                      { name: 'Prof. Meera Bai', dept: 'BT', date: '5h ago', avatar: 'M' },
                      { name: 'Dr. Siddharth Jain', dept: 'ECE', date: 'Yesterday', avatar: 'S' }
                    ].map(user => (
                      <div key={user.name} className="flex items-center gap-4 group">
                         <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-bold text-foreground/50">{user.avatar}</div>
                         <div className="flex-1">
                            <h4 className="font-bold text-foreground text-sm">{user.name}</h4>
                            <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">{user.dept} • {user.date}</p>
                         </div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                            <button className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"><XCircle className="w-4 h-4" /></button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Action Logs */}
              <div className="bg-background border border-outline rounded-xl p-8 shadow-sm">
                 <h3 className="text-sm font-black text-foreground/50 uppercase tracking-[0.2em] mb-8">AI Action Logs</h3>
                 <div className="space-y-6">
                    {[
                      { action: 'Automated Toxicity Review', status: 'Completed', detail: 'Forum post #892 flagged as safe.' },
                      { action: 'Project Tagging Engine', status: 'Running', detail: 'Optimizing 12 new project descriptions.' },
                      { action: 'Duplicate Profile Check', status: 'Completed', detail: '0 duplicates found in recent signups.' }
                    ].map((log, i) => (
                      <div key={i} className="flex gap-4">
                         <div className={`w-2 h-2 rounded-full mt-1.5 ${log.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                         <div>
                            <p className="text-[11px] font-bold text-foreground uppercase tracking-widest">{log.action}</p>
                            <p className="text-xs text-foreground/50 mt-1">{log.detail}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
