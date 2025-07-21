import React, { useState, useRef } from 'react';
import { EnvelopeIcon, UserIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_v04s17t';
const TEMPLATE_ID = 'template_w7613im';
const USER_ID = 'oV3q-FsVu6ppf0GrJ'; // This is the public API key

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef();

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await emailjs.sendForm(
        SERVICE_ID,
        TEMPLATE_ID,
        formRef.current,
        USER_ID
      );
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setErrorMsg('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Contact Support</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">Have a question or need help? Fill out the form below and our team will get back to you as soon as possible.</p>
        {submitted ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Thank you!</h2>
            <p>Your message has been sent successfully. We will contact you soon.</p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <UserIcon className="h-5 w-5 mr-1 text-blue-500" /> Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                placeholder="Your Name"
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-1 text-blue-500" /> Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                placeholder="you@email.com"
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1 text-blue-500" /> Message
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className={`input-field ${errors.message ? 'border-red-400' : ''}`}
                placeholder="How can we help you?"
                disabled={loading}
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>
            {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-center">{errorMsg}</div>}
            <button type="submit" className="btn-primary w-full flex items-center justify-center" disabled={loading}>
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : null}
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactPage; 