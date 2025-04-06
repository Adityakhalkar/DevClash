"use client";
import React from "react";
import Link from "next/link";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Terms of Service
        </h1>
        <div className="text-gray-700 space-y-4">
          <p>
            Welcome to Savium! These Terms of Service (&quot;Terms&quot;) govern your use
            of our platform and services. By accessing or using Savium, you
            agree to comply with and be bound by these Terms.
          </p>
          <h2 className="text-xl font-semibold text-gray-800">1. Acceptance</h2>
          <p>
            By creating an account or using our services, you confirm that you
            have read, understood, and agree to these Terms. If you do not agree
            to these Terms, you may not use our services.
          </p>
          <h2 className="text-xl font-semibold text-gray-800">
            2. User Responsibilities
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. You agree to notify us immediately of any unauthorized use
            of your account.
          </p>
          <h2 className="text-xl font-semibold text-gray-800">
            3. Prohibited Activities
          </h2>
          <p>
            You agree not to engage in any activity that violates applicable
            laws or regulations or disrupts the functioning of our platform.
          </p>
          <h2 className="text-xl font-semibold text-gray-800">
            4. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, Savium shall not be liable
            for any indirect, incidental, or consequential damages arising out
            of your use of our platform.
          </p>
          <h2 className="text-xl font-semibold text-gray-800">
            5. Modifications
          </h2>
          <p>
            We reserve the right to modify these Terms at any time. Continued
            use of our services after such modifications constitutes acceptance
            of the updated Terms.
          </p>
            <h2 className="text-xl font-semibold text-gray-800">
                6. Allowance of Investing
            </h2>
            <p>
                Users allow Savium to invest in various assets on their behalf. Savium
                will make investment decisions based on the user&apos;s preferences and
                risk tolerance. Users can set their investment goals and strategies
                within the platform. Savium will provide regular updates on the
                performance of the investments and any changes made to the portfolio.
            </p>
        </div>
        <div className="mt-8 text-center">
          <Link href="/">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;