// app/admin/settings/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { revalidateStorefront } from '@/app/actions/revalidate-storefront';
import {
  isDemoMode,
  DEMO_WRITE_MESSAGE,
  fetchConnections as loadConnections,
} from '@/lib/data';
import { Link2, Plus, Edit3, Trash2, X, Mail, Phone, MessageSquare, Globe, Inbox, AlertCircle } from 'lucide-react';
import ErrorBanner from '@/app/components/ErrorBanner';

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    label: '',
    type: 'Phone',
    value: '',
    is_active: true
  });

  const [validationError, setValidationError] = useState('');
  const [loadError, setLoadError] = useState(null);

  const categoryOrder = [
    { type: 'Phone', title: 'Phone Numbers', description: 'Voice routing channels and Indian service hotlines.' },
    { type: 'Email', title: 'Email Addresses', description: 'Digital mailboxes and corporate inquiries lines.' },
    { type: 'Chat Link', title: 'Chat Links', description: 'WhatsApp, Telegram, or support chat redirection anchors.' },
    { type: 'Social Channel', title: 'Social Channels', description: 'Instagram grids, YouTube handles, and platform communities.' }
  ];

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    const { data, error } = await loadConnections();
    
    if (error) {
      setLoadError('Could not load contact connections. Please refresh the page.');
      return;
    }
    setLoadError(null);
    setConnections(data || []);
  };

  const openAddModal = (targetType) => {
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    setIsEditMode(false);
    setEditingItem(null);
    setValidationError('');
    setFormData({
      label: '',
      type: targetType,
      value: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    setIsEditMode(true);
    setEditingItem(item);
    setValidationError('');
    
    let renderValue = item.value;
    if (item.type === 'Email' && renderValue.startsWith('mailto:')) {
      renderValue = renderValue.replace('mailto:', '');
    }

    setFormData({
      label: item.label,
      type: item.type,
      value: renderValue,
      is_active: item.is_active
    });
    setIsModalOpen(true);
  };

  const validateFormInputs = () => {
    const { type, value, label } = formData;
    
    if (!label.trim()) {
      setValidationError('Display label context is required.');
      return false;
    }
    if (!value.trim()) {
      setValidationError('Destination string/address route cannot be blank.');
      return false;
    }

    if (type === 'Phone') {
      const indianPhoneRegex = /^\+91\s?[6-9]\d{9}$/;
      if (!indianPhoneRegex.test(value.trim())) {
        setValidationError('Invalid Phone Format! Must match Indian standards: "+91" followed by a space and 10 digits (e.g., +91 9876543210).');
        return false;
      }
    }

    if (type === 'Email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        setValidationError('Please type a valid structured routing email address.');
        return false;
      }
    }

    if (type === 'Chat Link' || type === 'Social Channel') {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        setValidationError('Web endpoints require explicit network transport protocols (http:// or https://).');
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (isDemoMode()) {
      setValidationError(DEMO_WRITE_MESSAGE);
      return;
    }
    if (!validateFormInputs()) return;
    
    setLoading(true);

    try {
      let finalValue = formData.value.trim();
      
      if (formData.type === 'Email' && !finalValue.startsWith('mailto:')) {
        finalValue = `mailto:${finalValue}`;
      }

      const payload = {
        label: formData.label.trim(),
        type: formData.type,
        value: finalValue,
        is_active: formData.is_active
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('connections')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('connections')
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchConnections();
      await revalidateStorefront();
    } catch (err) {
      setValidationError(`Error saving parameters: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (id) => {
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    if (confirm("Are you sure you want to delete this communication entry?")) {
      const { error } = await supabase.from('connections').delete().eq('id', id);
      if (!error) {
        await fetchConnections();
        await revalidateStorefront();
      }
    }
  };

  const toggleConnectionStatus = async (item) => {
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    const nextState = !item.is_active;
    const { error } = await supabase
      .from('connections')
      .update({ is_active: nextState })
      .eq('id', item.id);

    if (!error) {
      setConnections(connections.map(c => c.id === item.id ? { ...c, is_active: nextState } : c));
      await revalidateStorefront();
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Phone': return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'Email': return <Mail className="w-4 h-4 text-blue-400" />;
      case 'Chat Link': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      default: return <Globe className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="flex-1 w-full p-4 md:p-6 space-y-8 max-w-6xl mx-auto overflow-y-auto select-none">
      <ErrorBanner message={loadError} onDismiss={() => setLoadError(null)} />
      
      {/* Top Heading Banner */}
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-500" /> Platform Connections
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">Configure custom contact endpoints and routing fields used across client-side modules.</p>
      </div>

      {/* Main Segments Array Grid Layout */}
      <div className="space-y-10 pb-12">
        {categoryOrder.map((cat) => {
          const catItems = connections.filter(item => item.type === cat.type);

          return (
            <div key={cat.type} className="space-y-4">
              
              {/* Category Bar Component Header */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    {getIconForType(cat.type)} {cat.title}
                    <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded-md">
                      {catItems.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-500">{cat.description}</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => openAddModal(cat.type)}
                  className="h-8 px-3 text-[11px] font-bold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Data Presentation Grid */}
              {catItems.length === 0 ? (
                <div className="py-6 flex items-center justify-center border border-dashed border-zinc-900 rounded-xl bg-zinc-950/40 text-xs text-zinc-600 gap-1.5">
                  <Inbox className="w-4 h-4 text-zinc-700" /> No parameters mapped yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catItems.map((item) => (
                    <div 
                      key={item.id}
                      className={`bg-zinc-900 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                        item.is_active ? 'border-zinc-800/80 hover:border-zinc-700' : 'border-zinc-900 opacity-50'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Upper Control Bar Layout */}
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-zinc-300 truncate pr-1 flex-1">{item.label}</h4>
                          
                          {/* Top-Right Consolidated Operations Matrix */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleConnectionStatus(item)}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition ${
                                item.is_active 
                                  ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                              }`}
                            >
                              {item.is_active ? 'Active' : 'Muted'}
                            </button>
                            
                            <button 
                              onClick={() => openEditModal(item)}
                              title="Edit Route"
                              className="p-1 text-zinc-500 hover:text-blue-400 rounded transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteConnection(item.id)}
                              title="Remove Entry"
                              className="p-1 text-zinc-500 hover:text-red-400 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Connection String Layout */}
                        <div className="bg-zinc-950 border border-zinc-900/60 px-2.5 py-1.5 rounded-lg">
                          <p className="text-xs font-mono text-zinc-400 truncate select-all" title={item.value}>
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* --- Overlay Modal Form Context Canvas Panel --- */}
      {isModalOpen && (
        <form onSubmit={handleSaveForm} className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-5 shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 flex-shrink-0">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                {getIconForType(formData.type)} {isEditMode ? `Edit ${formData.type}` : `New ${formData.type} Configuration`}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-500 hover:text-zinc-200 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto pr-0.5 min-h-0">
              
              {validationError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-xs leading-tight">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Form Input 1: Label Name */}
              <div>
                <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500 block mb-1">Display Title / Label</label>
                <input 
                  required 
                  type="text" 
                  value={formData.label} 
                  onChange={(e) => setFormData({...formData, label: e.target.value})} 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder-zinc-800" 
                  placeholder={
                    formData.type === 'Phone' ? 'e.g., Hubli Office, Sales Support' :
                    formData.type === 'Email' ? 'e.g., General Billing, Business Inquiry' :
                    formData.type === 'Chat Link' ? 'e.g., WhatsApp Direct Link' : 'e.g., Official Instagram'
                  }
                />
              </div>

              {/* Form Input 2: Mapped value target endpoint */}
              <div>
                <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500 block mb-1">
                  Value Mapping Target
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.value} 
                  onChange={(e) => {
                    setValidationError('');
                    setFormData({...formData, value: e.target.value});
                  }} 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono placeholder-zinc-800" 
                  placeholder={
                    formData.type === 'Phone' ? '+91 9876543210' : 
                    formData.type === 'Email' ? 'contact@rkelectronics.com' : 
                    'https://'
                  }
                />
                
                <span className="text-[9px] text-zinc-500 mt-1.5 block leading-relaxed flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 text-zinc-600 flex-shrink-0 mt-0.5" />
                  {formData.type === 'Phone' ? (
                    <span>Indian notation validation: Type <strong>+91</strong> followed by a space and your 10 digit string.</span>
                  ) : formData.type === 'Email' ? (
                    <span>Standard corporate routing address configuration patterns.</span>
                  ) : (
                    <span>Web redirection links must explicitly include transport prefixes (<strong>https://</strong>).</span>
                  )}
                </span>
              </div>

              {/* Status Visibility Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="connection_active_checkbox" 
                  checked={formData.is_active} 
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
                  className="rounded bg-zinc-950 border-zinc-800 text-blue-600 focus:ring-0 w-3.5 h-3.5" 
                />
                <label htmlFor="connection_active_checkbox" className="text-[11px] font-semibold text-zinc-400 cursor-pointer select-none">
                  Make route active and visible to client interfaces immediately
                </label>
              </div>

            </div>

            {/* Actions Footer Container */}
            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-zinc-800 flex-shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition">Cancel</button>
              <button type="submit" disabled={loading} className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Routing'}
              </button>
            </div>

          </div>
        </form>
      )}
    </div>
  );
}