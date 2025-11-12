'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FAQ {
  _id?: string;
  question: string;
  answer: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FAQManagerProps {
  searchQuery: string;
  selectedCategory: string | null;
}

export default function FAQManager({ searchQuery, selectedCategory }: FAQManagerProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<FAQ>>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch FAQs with debounce
  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/faq?${params}`);
      const data = await response.json();

      if (data.success) {
        setFaqs(data.faqs);
        setTotalPages(data.pagination.totalPages);
      } else {
        setError(data.message || 'Failed to fetch FAQs');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('FAQ fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFAQs();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [fetchFAQs]);

  const validateForm = (data: Partial<FAQ>): boolean => {
    const errors: { [key: string]: string } = {};

    if (!data.question || data.question.trim().length < 10) {
      errors.question = 'Question must be at least 10 characters';
    }

    if (!data.answer || data.answer.trim().length < 20) {
      errors.answer = 'Answer must be at least 20 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ question: '', answer: '', category: '' });
    setValidationErrors({});
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq._id || null);
    setFormData(faq);
    setValidationErrors({});
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({});
    setValidationErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm(formData)) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('ems_token');
      const url = editingId ? `/api/faq/${editingId}` : '/api/faq';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        await fetchFAQs();
        handleCancel();
      } else {
        setError(data.message || 'Operation failed');
        if (data.errors) {
          const errors: { [key: string]: string } = {};
          data.errors.forEach((err: any) => {
            errors[err.field] = err.message;
          });
          setValidationErrors(errors);
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('FAQ submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Are you sure you want to delete this FAQ?\n\n"${question}"`)) return;

    try {
      const token = localStorage.getItem('ems_token');
      const response = await fetch(`/api/faq/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        await fetchFAQs();
      } else {
        setError(data.message || 'Failed to delete FAQ');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('FAQ delete error:', err);
    }
  };

  if (loading && faqs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">FAQs</h2>
          <p className="text-sm text-gray-600 mt-1">Manage frequently asked questions</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New FAQ
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-700 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New FAQ</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <input
                type="text"
                value={formData.question || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter question..."
              />
              {validationErrors.question && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.question}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer *
              </label>
              <textarea
                value={formData.answer || ''}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter answer..."
              />
              {validationErrors.answer && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.answer}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (Optional)
              </label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create FAQ
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isSubmitting}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-500">No FAQs found. Create your first FAQ to get started.</p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq._id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {editingId === faq._id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question *
                    </label>
                    <input
                      type="text"
                      value={formData.question || ''}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {validationErrors.question && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.question}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer *
                    </label>
                    <textarea
                      value={formData.answer || ''}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {validationErrors.answer && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.answer}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h3>
                      {faq.category && (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {faq.category}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleEdit(faq)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(faq._id!, faq.question)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {new Date(faq.createdAt!).toLocaleDateString()}</span>
                    <span>Updated: {new Date(faq.updatedAt!).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
