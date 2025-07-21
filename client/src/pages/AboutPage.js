import React, { useEffect } from "react";
import {
  PhoneIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";

const AboutPage = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if the URL has a hash and scroll to that element
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        // Add a small delay to ensure the page has fully loaded
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);
  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About LostMobile.lk
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our mission is to help reunite people with their lost phones through
            a community-driven platform.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h2>
        <p className="text-lg text-gray-700 mb-6">
          At LostMobile.lk, we understand the stress and frustration that comes
          with losing your phone. That's why we've created a simple yet powerful
          platform that leverages the power of community to increase the chances
          of recovering lost devices.
        </p>
        <p className="text-lg text-gray-700 mb-6">
          Our service uses unique identifiers like IMEI numbers to match lost
          phones with found devices, helping honest finders connect with the
          rightful owners. We believe in the goodness of people and their
          willingness to help others in need.
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Why Choose Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              IMEI Tracking
            </h3>
            <p className="text-gray-600">
              Our unique IMEI-based identification system increases the chances
              of matching lost devices with their owners.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Privacy Focused
            </h3>
            <p className="text-gray-600">
              We prioritize your privacy and only share necessary information
              when there's a potential match.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Community Driven
            </h3>
            <p className="text-gray-600">
              We believe in the power of community and goodwill to help reunite
              people with their lost devices.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
        <ol className="space-y-6">
          <li className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
              1
            </span>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Report Your Lost Phone
              </h3>
              <p className="text-gray-700">
                Create a detailed report about your lost device, including the
                IMEI number, model, color, and where it was lost.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
              2
            </span>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                We Help Connect
              </h3>
              <p className="text-gray-700">
                Our system matches reported lost phones with found devices,
                alerting both parties when there's a potential match.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
              3
            </span>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Recover Your Device
              </h3>
              <p className="text-gray-700">
                Connect with the finder and arrange to recover your phone. Mark
                your report as resolved once you get your device back.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
};

export default AboutPage;
