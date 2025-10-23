import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import { useToast } from '../../hooks/useToast';

const CreateDiscussionModal = ({ isOpen, onClose, onDiscussionCreated }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    community: 'global',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.title.trim() || !formData.content.trim()) {
    showToast('Title and content are required', 'error');
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    const tagsArray = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];
    
    const response = await axiosClient.post('/discussions', {
      title: formData.title,
      content: formData.content,
      community: formData.community,
      tags: tagsArray
    });
    
    showToast('Discussion created successfully', 'success');
    onDiscussionCreated(response.data.discussion); // Make sure to use response.data.discussion
    onClose();
    setFormData({
      title: '',
      content: '',
      community: 'global',
      tags: ''
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    showToast(error.response?.data?.message || 'Failed to create discussion', 'error');
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div 
        className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Create New Discussion</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's your question or topic?"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Describe your question or topic in detail..."
              rows="6"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="community" className="block text-sm font-medium text-gray-300 mb-1">
                Community
              </label>
              <select
                id="community"
                name="community"
                value={formData.community}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="global">Global</option>
                <option value="dsa">DSA</option>
                <option value="india">India</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="algorithms, arrays, javascript"
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDiscussionModal;