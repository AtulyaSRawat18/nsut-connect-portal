import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-[72px]">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold overflow-hidden bg-white shadow-sm">
                                <span className="text-xs">NC</span>
                                <img src="/nsut-logo.jpg" alt="" className="absolute inset-0 w-full h-full object-cover z-10" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-[17px] font-extrabold text-primary tracking-tight leading-none">NSUT Connect</h1>
                                <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1"><span className="text-[8px] align-text-bottom text-gray-400">BY</span> IQAC</p>
                            </div>
                        </Link>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link href="/faculty" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">Directory</Link>
                        <Link href="/projects" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">Projects</Link>
                        <Link href="/publications" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">Publications</Link>
                        <Link href="/grants" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">Grants</Link>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link
                            href="/login"
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 text-sm font-bold tracking-wider rounded transition-all shadow-md hover:shadow-lg"
                        >
                            SIGN IN
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
