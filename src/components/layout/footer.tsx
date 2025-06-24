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
              <li><a href="/" className="text-gray-300 hover:text-white">Home</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-white">About</a></li>
              <li><a href="/events" className="text-gray-300 hover:text-white">Events</a></li>
              <li><a href="/membership" className="text-gray-300 hover:text-white">Membership</a></li>
              <li><a href="/resources" className="text-gray-300 hover:text-white">Resources</a></li>
              <li><a href="/blog" className="text-gray-300 hover:text-white">Blog/News</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          {/* Member Portal */}
          <div>
            <h4 className="text-md font-semibold mb-4">Member Portal</h4>
            <ul className="space-y-2">
              <li><a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a></li>
              <li><a href="/dashboard/directory" className="text-gray-300 hover:text-white">Directory</a></li>
              <li><a href="/dashboard/resources" className="text-gray-300 hover:text-white">Resources</a></li>
              <li><a href="/dashboard/events" className="text-gray-300 hover:text-white">My Events</a></li>
              <li><a href="/dashboard/profile" className="text-gray-300 hover:text-white">Profile</a></li>
              <li><a href="/dashboard/account" className="text-gray-300 hover:text-white">Account</a></li>
            </ul>
          </div>
          
          {/* Authentication */}
          <div>
            <h4 className="text-md font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li><a href="/auth/sign-in" className="text-gray-300 hover:text-white">Login</a></li>
              <li><a href="/auth/sign-up" className="text-gray-300 hover:text-white">Register</a></li>
              <li><a href="/auth/forgot-password" className="text-gray-300 hover:text-white">Forgot Password</a></li>
              <li><a href="/auth/verify-email" className="text-gray-300 hover:text-white">Verify Email</a></li>
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