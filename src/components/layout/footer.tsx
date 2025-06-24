import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">BASA</h3>
            <p className="text-gray-300">
              Building stronger business communities through networking and giving.
            </p>
          </div>
          
          {/* Public Pages */}
          <div>
            <h4 className="text-md font-semibold mb-4">Public</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white">About</Link></li>
              <li><Link href="/events" className="text-gray-300 hover:text-white">Events</Link></li>
              <li><Link href="/membership" className="text-gray-300 hover:text-white">Membership</Link></li>
              <li><Link href="/resources" className="text-gray-300 hover:text-white">Resources</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog/News</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          {/* Member Portal */}
          <div>
            <h4 className="text-md font-semibold mb-4">Member Portal</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link></li>
              <li><Link href="/dashboard/directory" className="text-gray-300 hover:text-white">Directory</Link></li>
              <li><Link href="/dashboard/resources" className="text-gray-300 hover:text-white">Resources</Link></li>
              <li><Link href="/dashboard/events" className="text-gray-300 hover:text-white">My Events</Link></li>
              <li><Link href="/dashboard/profile" className="text-gray-300 hover:text-white">Profile</Link></li>
              <li><Link href="/dashboard/account" className="text-gray-300 hover:text-white">Account</Link></li>
            </ul>
          </div>
          
          {/* Authentication */}
          <div>
            <h4 className="text-md font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link href="/auth/sign-in" className="text-gray-300 hover:text-white">Login</Link></li>
              <li><Link href="/auth/sign-up" className="text-gray-300 hover:text-white">Register</Link></li>
              <li><Link href="/auth/forgot-password" className="text-gray-300 hover:text-white">Forgot Password</Link></li>
              <li><Link href="/auth/verify-email" className="text-gray-300 hover:text-white">Verify Email</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 BASA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 