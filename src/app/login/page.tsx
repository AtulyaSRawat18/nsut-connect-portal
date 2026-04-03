import Link from "next/link";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden p-8">

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Portal Authentication</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Please log in with your institutional credentials.</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded mb-8">
                    <button className="flex-1 py-2 text-sm font-bold text-primary bg-white dark:bg-gray-900 rounded shadow-sm">STUDENT</button>
                    <button className="flex-1 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700">FACULTY</button>
                </div>

                <form className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wider uppercase mb-2">NSUT EMAIL ID</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                placeholder="rollnumber@nsut.ac.in"
                                className="pl-10 w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 dark:text-white transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wider uppercase">PASSWORD</label>
                            <Link href="#" className="flex text-xs font-bold text-primary hover:underline">RESET PASSWORD?</Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="pl-10 w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 dark:text-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input type="checkbox" id="remember" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Remember this device for 30 days
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center gap-2 bg-[#CD2027] hover:bg-[#b01c22] text-white py-3 rounded-md font-bold tracking-wider transition-all shadow hover:shadow-lg"
                    >
                        SIGN IN TO PORTAL
                        <LogIn className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-white dark:bg-gray-900 text-gray-400 font-medium tracking-widest uppercase">Alternative Access</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button className="flex justify-center items-center gap-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors">
                            <span className="text-primary font-serif italic text-lg leading-none">IMS</span> Login
                        </button>
                        <button className="flex justify-center items-center gap-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors">
                            <Mail className="w-4 h-4 text-red-500" /> G-Suite
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-500">
                    <p>Official portal of Netaji Subhas University of Technology.</p>
                    <p className="mt-1">Use of this system is subject to the <Link href="#" className="font-bold text-primary hover:underline">IT Policy</Link> and <Link href="#" className="font-bold text-primary hover:underline">User Guidelines</Link>.</p>
                </div>

            </div>
        </div>
    );
}
