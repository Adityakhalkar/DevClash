"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase"; // Ensure your Firebase setup exists here
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  linkWithPopup,
  unlink,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const SettingsPage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!auth.currentUser) {
          router.push("/login");
          return;
        }

        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setDisplayName(data.name || "");
          setEmail(data.email || "");
          setTheme(data.settings?.theme || "light");
          setNotifications(data.settings?.notifications || {});
        }
      } catch (err) {
        console.error("Error fetching user data: ", err);
      }
    };

    fetchUserData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!auth.currentUser) return;

      // Update display name
      await updateProfile(auth.currentUser, { displayName });

      // Update email if changed
      if (email !== auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email!,
          currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updateEmail(auth.currentUser, email);
      }

      // Update password if provided
      if (newPassword) {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email!,
          currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
      }

      // Update Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        name: displayName,
        email: email,
        settings: {
          theme,
          notifications,
        },
      });

      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      if (!auth.currentUser) return;

      const provider = new GoogleAuthProvider();
      await linkWithPopup(auth.currentUser, provider);
      setSuccess("Google account linked successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to link Google account.");
    }
  };

  const handleUnlinkProvider = async (providerId: string) => {
    try {
      if (!auth.currentUser) return;

      await unlink(auth.currentUser, providerId);
      setSuccess(`Successfully unlinked ${providerId}`);
    } catch (err: any) {
      setError(err.message || `Failed to unlink ${providerId}`);
    }
  };

  if (!userData) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Account Settings</h1>

      {/* Profile Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Profile</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-gray-600 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="currentPassword" className="block text-gray-600 mb-2">
              Current Password (required for changes)
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-gray-600 mb-2">
              New Password (optional)
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-500 mt-2">{success}</p>}
        </form>
      </section>

      {/* Notifications Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={notifications.email}
              onChange={(e) =>
                setNotifications({ ...notifications, email: e.target.checked })
              }
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="emailNotifications" className="text-gray-600">
              Email Notifications
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="pushNotifications"
              checked={notifications.push}
              onChange={(e) =>
                setNotifications({ ...notifications, push: e.target.checked })
              }
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="pushNotifications" className="text-gray-600">
              Push Notifications
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="smsNotifications"
              checked={notifications.sms}
              onChange={(e) =>
                setNotifications({ ...notifications, sms: e.target.checked })
              }
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="smsNotifications" className="text-gray-600">
              SMS Notifications
            </label>
          </div>
        </div>
      </section>

      {/* Theme Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Theme</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setTheme("light")}
            className={`px-4 py-2 rounded-lg ${
              theme === "light"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`px-4 py-2 rounded-lg ${
              theme === "dark"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Dark
          </button>
        </div>
      </section>

      {/* Linked Accounts Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Linked Accounts
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Google</span>
            <button
              onClick={handleLinkGoogle}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Link Google
            </button>
          </div>
          {userData.authProviders?.includes("google.com") && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Google Account</span>
              <button
                onClick={() => handleUnlinkProvider("google.com")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Unlink Google
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;