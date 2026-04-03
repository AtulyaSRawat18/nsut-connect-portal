import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full py-6 px-4 md:px-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
                <span className="font-semibold text-gray-700 dark:text-gray-300">NSUT RESEARCH</span>
                <span className="hidden md:inline">&mdash;</span>
                <span>© 2024 Netaji Subhas University of Technology. All rights reserved.</span>
            </div>

            <div className="flex space-x-6">
                <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider">Privacy</Link>
                <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider">Terms</Link>
                <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider">Helpdesk</Link>
            </div>
        </footer>
    );
}
