import React, { useState } from 'react';
import { useRealtimeSync } from '@/lib/utils/realtimeSync';
import { validationRules, conditionalRules } from '@/lib/validation/validationRules';
import { validateField, getFieldStateClass, isFieldValid } from '@/lib/validation/validationHelpers';
import { sanitizeFormData } from '@/lib/validation/sanitization';
import { ErrorMessage } from '@/components/validation/ErrorMessage';
import { SuccessIcon } from '@/components/validation/SuccessIcon';

interface EnquiryFormProps {
 onClose: () => void;
 onSuccess?: () => void;
}

export default function EnquiryForm({ onClose, onSuccess }: EnquiryFormProps) {
 const { addEnquiry } = useRealtimeSync();
 const [formData, setFormData] = useState({
 visitorName: '',
 email: '',
 phone: '',
 subject: '',
 message: '',
 service: 'General Inquiry',
 priority: 'medium' as 'low' | 'medium' | 'high'
 });
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [touched, setTouched] = useState<Record<string, boolean>>({});
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 // Debug log to verify new code is loaded - BUILD TIME: 2024-01-10-15:30
 console.log('🔥 EnquiryForm with VALIDATION loaded - Version 3.0 - BUILD: 2024-01-10-15:30');
 console.log('📋 Validation rules active:', {
 name: 'min 2 chars, letters only',
 email: 'valid email format',
 phone: 'numbers only, 10-15 digits',
 message: 'min 10 chars'
 });

 // Validate a single field
 const validateSingleField = (fieldName: string, value: any) => {
 let error: string | null = null;
 
 if (fieldName === 'visitorName') {
 error = validateField(fieldName, value, validationRules.name);
 } else if (fieldName === 'email') {
 // Only validate format if email is provided
 if (value) {
 const emailRules = {
 maxLength: validationRules.email.maxLength,
 pattern: validationRules.email.pattern
 };
 error = validateField(fieldName, value, emailRules);
 }
 } else if (fieldName === 'phone') {
 // Only validate format if phone is provided
 if (value) {
 const phoneRules = {
 pattern: validationRules.phone.pattern
 };
 error = validateField(fieldName, value, phoneRules);
 }
 } else if (fieldName === 'subject') {
 error = validateField(fieldName, value, validationRules.subject);
 } else if (fieldName === 'message') {
 error = validateField(fieldName, value, validationRules.message);
 }
 
 return error;
 };

 const handleBlur = (fieldName: string) => {
 setTouched(prev => ({ ...prev, [fieldName]: true }));
 
 const error = validateSingleField(fieldName, formData[fieldName as keyof typeof formData]);
 
 if (error) {
 setErrors(prev => ({ ...prev, [fieldName]: error }));
 } else {
 setErrors(prev => {
 const newErrors = { ...prev };
 delete newErrors[fieldName];
 return newErrors;
 });
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
 // Mark all fields as touched
 setTouched({
 visitorName: true,
 email: true,
 phone: true,
 subject: true,
 message: true
 });

 // Validate all fields
 const newErrors: Record<string, string> = {};
 
 const nameError = validateSingleField('visitorName', formData.visitorName);
 if (nameError) newErrors.visitorName = nameError;
 
 const emailError = validateSingleField('email', formData.email);
 if (emailError && formData.email) newErrors.email = emailError;
 
 const phoneError = validateSingleField('phone', formData.phone);
 if (phoneError && formData.phone) newErrors.phone = phoneError;
 
 const subjectError = validateSingleField('subject', formData.subject);
 if (subjectError) newErrors.subject = subjectError;
 
 const messageError = validateSingleField('message', formData.message);
 if (messageError) newErrors.message = messageError;
 
 // Check email or phone requirement
 const emailOrPhoneError = conditionalRules.emailOrPhone(formData.email, formData.phone);
 if (emailOrPhoneError !== true) {
 if (!formData.email) newErrors.email = emailOrPhoneError;
 if (!formData.phone) newErrors.phone = emailOrPhoneError;
 }
 
 setErrors(newErrors);
 
 // If there are errors, focus on first error field and stop
 if (Object.keys(newErrors).length > 0) {
 const firstErrorField = Object.keys(newErrors)[0];
 document.getElementById(firstErrorField)?.focus();
 setLoading(false);
 return;
 }

 // Sanitize form data
 const sanitizedData = sanitizeFormData(formData);

 // Prepare enquiry data matching API expectations
 const enquiryData = {
 visitorName: sanitizedData.visitorName,
 email: sanitizedData.email,
 phoneNumber: sanitizedData.phone, // API expects phoneNumber
 enquiryType: 'website', // Source of the enquiry
 enquiryDetails: sanitizedData.message, // API expects enquiryDetails
 service: sanitizedData.service,
 subservice: sanitizedData.subject || '', // Use subject as subservice
 priority: sanitizedData.priority,
 organization: '',
 region: ''
 };

 // Add enquiry using real-time sync
 console.log('📤 Submitting enquiry data:', enquiryData);
 const success = await addEnquiry(enquiryData);
 console.log('📥 Enquiry submission result:', success);

 if (success) {
 console.log('✅ Enquiry added successfully');
 onSuccess?.();
 onClose();
 
 // Show success message
 if (window.confirm('Enquiry added successfully! The dashboard will refresh to show the new enquiry.')) {
 window.location.reload();
 }
 } else {
 console.error('❌ Failed to add enquiry - addEnquiry returned false');
 setError('Failed to add enquiry. Please try again.');
 }
 } catch (err) {
 console.error('Error adding enquiry:', err);
 setError('An error occurred while adding the enquiry');
 } finally {
 setLoading(false);
 }
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 let processedValue = value;
 
 // Special handling for phone field - only allow numbers, spaces, +, -, (, )
 if (name === 'phone') {
 processedValue = value.replace(/[^0-9+\s\-()]/g, '');
 
 // Show error immediately if alphabets were attempted
 if (value !== processedValue) {
 setErrors(prev => ({ ...prev, phone: 'Only numbers and +, -, (, ), spaces are allowed' }));
 setTouched(prev => ({ ...prev, phone: true }));
 }
 }
 // Special handling for email field - remove spaces
 else if (name === 'email') {
 processedValue = value.replace(/\s/g, '');
 }
 
 setFormData(prev => ({ ...prev, [name]: processedValue }));
 
 // Real-time validation if field has been touched
 if (touched[name] && processedValue) {
 const error = validateSingleField(name, processedValue);
 if (error) {
 setErrors(prev => ({ ...prev, [name]: error }));
 } else {
 setErrors(prev => {
 const newErrors = { ...prev };
 delete newErrors[name];
 return newErrors;
 });
 }
 } else if (errors[name]) {
 // Clear error when user starts typing
 setErrors(prev => {
 const newErrors = { ...prev };
 delete newErrors[name];
 return newErrors;
 });
 }
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
 <div className="p-6">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h2 className="text-xl font-bold text-gray-900">Add New Enquiry</h2>
 <p className="text-xs text-green-600 font-mono">✓ Validation Active v3.0</p>
 </div>
 <button
 onClick={onClose}
 className="text-gray-700 hover:text-gray-900 text-2xl"
 >
 ×
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label htmlFor="visitorName" className="block text-sm font-medium text-gray-700 mb-1">
 Visitor Name <span className="text-red-500">*</span>
 </label>
 <div className="relative">
 <input
 id="visitorName"
 type="text"
 name="visitorName"
 value={formData.visitorName}
 onChange={handleChange}
 onBlur={() => handleBlur('visitorName')}
 placeholder="e.g., John Doe"
 aria-label="Visitor Name"
 aria-invalid={errors.visitorName ? 'true' : 'false'}
 aria-describedby={errors.visitorName ? 'visitorName-error' : undefined}
 aria-required="true"
 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 ${getFieldStateClass(formData.visitorName, errors.visitorName, touched.visitorName)}`}
 />
 {isFieldValid(formData.visitorName, errors.visitorName, touched.visitorName) && <SuccessIcon />}
 </div>
 {errors.visitorName && touched.visitorName && (
 <ErrorMessage message={errors.visitorName} id="visitorName-error" />
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
 Email
 </label>
 <div className="relative">
 <input
 id="email"
 type="email"
 name="email"
 value={formData.email}
 onChange={handleChange}
 onBlur={() => handleBlur('email')}
 placeholder="e.g., john@example.com"
 aria-label="Email"
 aria-invalid={errors.email ? 'true' : 'false'}
 aria-describedby={errors.email ? 'email-error' : undefined}
 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 ${getFieldStateClass(formData.email, errors.email, touched.email)}`}
 />
 {isFieldValid(formData.email, errors.email, touched.email) && <SuccessIcon />}
 </div>
 {errors.email && touched.email && (
 <ErrorMessage message={errors.email} id="email-error" />
 )}
 </div>
 <div>
 <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
 Phone
 </label>
 <div className="relative">
 <input
 id="phone"
 type="tel"
 name="phone"
 value={formData.phone}
 onChange={handleChange}
 onKeyPress={(e) => {
 // Prevent non-numeric characters from being entered
 const char = e.key;
 const allowedChars = /[0-9+\s\-()]/;
 if (!allowedChars.test(char)) {
 e.preventDefault();
 }
 }}
 onInput={(e) => {
 // Additional safeguard: filter on input event
 const target = e.target as HTMLInputElement;
 target.value = target.value.replace(/[^0-9+\s\-()]/g, '');
 }}
 onPaste={(e) => {
 // Handle paste events
 e.preventDefault();
 const pastedText = e.clipboardData.getData('text');
 const filteredText = pastedText.replace(/[^0-9+\s\-()]/g, '');
 const target = e.target as HTMLInputElement;
 const start = target.selectionStart || 0;
 const end = target.selectionEnd || 0;
 const currentValue = target.value;
 const newValue = currentValue.substring(0, start) + filteredText + currentValue.substring(end);
 setFormData(prev => ({ ...prev, phone: newValue }));
 }}
 onBlur={() => handleBlur('phone')}
 inputMode="numeric"
 placeholder="e.g., +1 234 567 8900"
 aria-label="Phone"
 aria-invalid={errors.phone ? 'true' : 'false'}
 aria-describedby={errors.phone ? 'phone-error' : undefined}
 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 ${getFieldStateClass(formData.phone, errors.phone, touched.phone)}`}
 />
 {isFieldValid(formData.phone, errors.phone, touched.phone) && <SuccessIcon />}
 </div>
 {errors.phone && touched.phone && (
 <ErrorMessage message={errors.phone} id="phone-error" />
 )}
 {formData.phone && (
 <p className={`text-xs mt-1 ${formData.phone.replace(/\D/g, '').length === 10 ? 'text-green-600' : 'text-gray-800'}`}>
 {formData.phone.replace(/\D/g, '').length} / 10 digits
 </p>
 )}
 </div>
 </div>
 <p className="text-xs text-gray-800 -mt-2">* At least one contact method (email or phone) is required</p>

 <div>
 <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
 Subject
 </label>
 <div className="relative">
 <input
 id="subject"
 type="text"
 name="subject"
 value={formData.subject}
 onChange={handleChange}
 onBlur={() => handleBlur('subject')}
 placeholder="Brief subject of the enquiry"
 aria-label="Subject"
 aria-invalid={errors.subject ? 'true' : 'false'}
 aria-describedby={errors.subject ? 'subject-error' : undefined}
 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 ${getFieldStateClass(formData.subject, errors.subject, touched.subject)}`}
 />
 {isFieldValid(formData.subject, errors.subject, touched.subject) && <SuccessIcon />}
 </div>
 {errors.subject && touched.subject && (
 <ErrorMessage message={errors.subject} id="subject-error" />
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Service
 </label>
 <select
 name="service"
 value={formData.service}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
 >
 <option value="General Inquiry">General Inquiry</option>
 <option value="Environmental Consulting">Environmental Consulting</option>
 <option value="Water Quality Testing">Water Quality Testing</option>
 <option value="Air Quality Monitoring">Air Quality Monitoring</option>
 <option value="Waste Management">Waste Management</option>
 <option value="Laboratory Services">Laboratory Services</option>
 <option value="Training Programs">Training Programs</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Priority
 </label>
 <select
 name="priority"
 value={formData.priority}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
 >
 <option value="low">Low</option>
 <option value="medium">Medium</option>
 <option value="high">High</option>
 </select>
 </div>

 <div>
 <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
 Message <span className="text-red-500">*</span>
 </label>
 <div className="relative">
 <textarea
 id="message"
 name="message"
 value={formData.message}
 onChange={handleChange}
 onBlur={() => handleBlur('message')}
 rows={4}
 placeholder="Detailed enquiry message..."
 aria-label="Message"
 aria-invalid={errors.message ? 'true' : 'false'}
 aria-describedby={errors.message ? 'message-error' : undefined}
 aria-required="true"
 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 ${getFieldStateClass(formData.message, errors.message, touched.message)}`}
 />
 </div>
 {errors.message && touched.message && (
 <ErrorMessage message={errors.message} id="message-error" />
 )}
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 rounded-md p-3">
 <p className="text-red-600 text-sm">{error}</p>
 </div>
 )}

 <div className="flex justify-end space-x-3 pt-4">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
 disabled={loading}
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 disabled={loading}
 aria-label="Add Enquiry"
 >
 {loading ? 'Adding...' : 'Add Enquiry'}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
}
