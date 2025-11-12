'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, Loader2, AlertCircle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Article {
  _id?: string;
  title: string;
  content: string;
  contentPreview?: string;
  author?: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface ArticleManagerProps {
  searchQuery: string;
  selectedCategory: string | null;
}

export default function ArticleManager({ searchQuery, selectedCategory }: ArticleManagerProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Article>>({ tags: [] });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [tagInput, setTagInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch articles with debounce
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('tags', selectedCategory);

      const response = await fetch(`/api/article?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.articles);
        setTotalPages(data.pagination.totalPages);
      } else {
        setError(data.message || 'Failed to fetch articles');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Article fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [fetchArticles]);

  const validateForm = (data: Partial<Article>): boolean => {
    const errors: { [key: string]: string } = {};

    if (!data.title || data.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }

    if (!data.content || data.content.trim().length < 50) {
      errors.content = 'Content must be at least 50 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ title: '', content: '', author: '', tags: [] });
    setValidationErrors({});
    setTagInput('');
  };

  const handleEdit = (article: Article) => {
    setEditingId(article._id || null);
    setFormData(article);
    setValidationErrors({});
    setTagInput('');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ tags: [] });
    setValidationErrors({});
    setTagInput('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const handleSubmit = async () => {
    if (!validateForm(formData)) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('ems_token');
      const url = editingId ? `/api/article/${editingId}` : '/api/article';
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
        await fetchArticles();
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
      console.error('Article submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete this article?\n\n"${title}"`)) return;

    try {
      const token = localStorage.getItem('ems_token');
      const response = await fetch(`/api/article/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        await fetchArticles();
      } else {
        setError(data.message || 'Failed to delete article');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Article delete error:', err);
    }
  };

  if (loading && articles.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
          <p className="text-sm text-gray-600 mt-1">Manage detailed content articles</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Article
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

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isCreating ? 'Create New Article' : 'Edit Article'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter article title..."
              />
              {validationErrors.title && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter article content..."
              />
              {validationErrors.content && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.content}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author (Optional)
              </label>
              <input
                type="text"
                value={formData.author || ''}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter author name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a tag..."
                />
                <Button
                  onClick={handleAddTag}
                  type="button"
                  variant="outline"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isCreating ? 'Creating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isCreating ? 'Create Article' : 'Save Changes'}
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

      {/* Article List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-500">No articles found. Create your first article to get started.</p>
          </div>
        ) : (
          articles.map((article) => (
            <div
              key={article._id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {article.title}
                </h3>
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => handleEdit(article)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(article._id!, article.title)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {article.author && (
                <p className="text-sm text-gray-600 mb-3">By {article.author}</p>
              )}

              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {article.contentPreview || article.content}
              </p>

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                <span>Created: {new Date(article.createdAt!).toLocaleDateString()}</span>
                <span>Updated: {new Date(article.updatedAt!).toLocaleDateString()}</span>
              </div>
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
