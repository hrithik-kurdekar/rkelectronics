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
import {
  CONTACT_CONNECTION_TYPES,
  SOCIAL_CONNECTION_TYPES,
} from '@/lib/connection-types';
import { maskConnectionValueForAdmin } from '@/lib/inquiry-chat';
import {
  Link2,
  Plus,
  Edit3,
  Trash2,
  X,
  MessageSquare,
  Globe,
  Inbox,
  AlertCircle,
  ShoppingBag,
  Rss,
} from 'lucide-react';
import ErrorBanner from '@/app/components/ErrorBanner';
import { ADMIN_CONTAINER } from '@/lib/storefront-layout';

const CONNECTION_GROUPS = [
  {
    id: 'contact',
    title: 'Contact seller',
    subtitle: 'Product inquiries',
    description:
      'Private 1:1 chat for product inquiries — shown on product pages and footer contact.\nAdd WhatsApp (wa.me), Telegram, Instagram DM, or Messenger links.',
    icon: ShoppingBag,
    accent: 'border-blue-500/20 bg-blue-500/5',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    categories: [
      {
        type: 'Chat Link',
        title: 'Direct chat links',
      },
    ],
  },
  {
    id: 'social',
    title: 'Follow for updates',
    subtitle: 'New listings',
    description:
      'Public channels for new listing alerts — shown in the site footer.\nAdd Instagram, Facebook, YouTube, WhatsApp Channel, or Telegram links.',
    icon: Rss,
    accent: 'border-violet-500/20 bg-violet-500/5',
    badgeClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    categories: [
      {
        type: 'Social Channel',
        title: 'Social & community links',
      },
    ],
  },
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalContext, setModalContext] = useState(null);

  const [formData, setFormData] = useState({
    label: '',
    type: 'Chat Link',
    value: '',
    is_active: true,
  });

  const [validationError, setValidationError] = useState('');
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    const { data, error } = await loadConnections();

    if (error) {
      setLoadError('Could not load connections. Please refresh the page.');
      return;
    }
    setLoadError(null);
    setConnections(data || []);
  };

  const openAddModal = (targetType, group = null) => {
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    setIsEditMode(false);
    setEditingItem(null);
    setValidationError('');
    setModalContext(group);
    setFormData({
      label: '',
      type: targetType,
      value: '',
      is_active: true,
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
    setModalContext(
      isSocialConnectionType(item.type)
        ? CONNECTION_GROUPS.find((g) => g.id === 'social')
        : CONNECTION_GROUPS.find((g) => g.id === 'contact')
    );

    setFormData({
      label: item.label,
      type: item.type,
      value: item.value,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  function isSocialConnectionType(type) {
    return SOCIAL_CONNECTION_TYPES.includes(type);
  }

  function isContactConnectionType(type) {
    return CONTACT_CONNECTION_TYPES.includes(type);
  }

  const validateFormInputs = () => {
    const { type, value, label } = formData;

    if (!label.trim()) {
      setValidationError('Display label is required.');
      return false;
    }
    if (!value.trim()) {
      setValidationError('Link or address cannot be blank.');
      return false;
    }

    if (type === 'Chat Link' || type === 'Social Channel') {
      const trimmed = value.trim();
      if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
        setValidationError('Use chat URLs only — not email or phone links.');
        return false;
      }
      if (type === 'Chat Link' && trimmed.toLowerCase().includes('whatsapp.com/channel')) {
        setValidationError('WhatsApp Channels belong under Follow for updates, not direct chat.');
        return false;
      }
      if (
        type === 'Chat Link' &&
        !trimmed.startsWith('http://') &&
        !trimmed.startsWith('https://')
      ) {
        setValidationError('Chat links must start with https://');
        return false;
      }
      if (type === 'Chat Link' && /wa\.me\/\/?$/i.test(trimmed)) {
        setValidationError('Add your WhatsApp number after wa.me/ (e.g. https://wa.me/919876543210).');
        return false;
      }
      if (type === 'Social Channel' && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        setValidationError('Links must start with https://');
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
      const finalValue = formData.value.trim();

      const payload = {
        label: formData.label.trim(),
        type: formData.type,
        value: finalValue,
        is_active: formData.is_active,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('connections')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('connections').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchConnections();
      await revalidateStorefront();
    } catch (err) {
      setValidationError(`Error saving: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (id) => {
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    if (confirm('Delete this connection?')) {
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
      setConnections(connections.map((c) => (c.id === item.id ? { ...c, is_active: nextState } : c)));
      await revalidateStorefront();
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Chat Link':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'Social Channel':
        return <Globe className="w-4 h-4 text-violet-400" />;
      default:
        return <Globe className="w-4 h-4 text-zinc-400" />;
    }
  };

  const contactCount = connections.filter((c) => CONTACT_CONNECTION_TYPES.includes(c.type)).length;
  const socialCount = connections.filter((c) => SOCIAL_CONNECTION_TYPES.includes(c.type)).length;
  const stackGroups = contactCount > 3 || socialCount > 3;

  function renderConnectionGroup(group, compactLayout) {
    const GroupIcon = group.icon;
    const groupTypes = group.categories.map((c) => c.type);
    const groupCount = connections.filter((c) => groupTypes.includes(c.type)).length;

    return (
      <div
        key={group.id}
        className={`rounded-2xl border p-4 sm:p-5 space-y-5 min-w-0 ${group.accent}`}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <GroupIcon className="w-5 h-5 text-zinc-300 flex-shrink-0" />
            <h3 className="text-base font-bold text-white">{group.title}</h3>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${group.badgeClass}`}
            >
              {group.subtitle}
            </span>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-md">
              {groupCount}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
            {group.description}
          </p>
        </div>

        {group.categories.map((cat) => {
          const catItems = connections.filter((item) => item.type === cat.type);

          return (
            <div key={cat.type} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    {getIconForType(cat.type)} {cat.title}
                    <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-md">
                      {catItems.length}
                    </span>
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => openAddModal(cat.type, group)}
                  className="h-8 px-3 text-[11px] font-bold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition flex items-center gap-1.5 flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {catItems.length === 0 ? (
                <div className="py-5 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40 text-xs text-zinc-600 gap-1.5">
                  <Inbox className="w-4 h-4 text-zinc-700" /> None added yet.
                </div>
              ) : (
                <div
                  className={`grid gap-3 ${
                    compactLayout ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-zinc-900 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                        item.is_active
                          ? 'border-zinc-800/80 hover:border-zinc-700'
                          : 'border-zinc-900 opacity-50'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-bold text-zinc-300 truncate pr-1 flex-1">
                            {item.label}
                          </h5>
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
                              {item.is_active ? 'Active' : 'Hidden'}
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              title="Edit"
                              className="p-1 text-zinc-500 hover:text-blue-400 rounded transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteConnection(item.id)}
                              title="Delete"
                              className="p-1 text-zinc-500 hover:text-red-400 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-zinc-950 border border-zinc-900/60 px-2.5 py-1.5 rounded-lg">
                          <p
                            className="text-xs font-mono text-zinc-400 truncate select-all"
                            title={item.value}
                          >
                            {maskConnectionValueForAdmin(item.value)}
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
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto">
      <div className={`${ADMIN_CONTAINER} py-6 md:py-8 lg:py-10 space-y-8 select-none`}>
      <ErrorBanner message={loadError} onDismiss={() => setLoadError(null)} />

      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-500" /> Platform Connections
        </h2>
      </div>

      <div className={`grid gap-4 pb-8 ${stackGroups ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
        {CONNECTION_GROUPS.map((group) => renderConnectionGroup(group, !stackGroups))}
      </div>

      {isModalOpen && (
        <form
          onSubmit={handleSaveForm}
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-5 shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 flex-shrink-0">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                {getIconForType(formData.type)}{' '}
                {isEditMode ? `Edit ${formData.type}` : `Add ${formData.type}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalContext && (
              <div
                className={`mb-4 p-3 rounded-lg border text-[11px] leading-relaxed ${modalContext.accent}`}
              >
                <p className="font-bold text-zinc-200">{modalContext.title}</p>
                <p className="text-zinc-500 mt-1 whitespace-pre-line">{modalContext.description}</p>
              </div>
            )}

            <div className="space-y-4 flex-1 overflow-y-auto pr-0.5 min-h-0">
              {validationError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-xs leading-tight">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500 block mb-1">
                  Display label
                </label>
                <input
                  required
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder-zinc-800"
                  placeholder={
                    formData.type === 'Chat Link'
                      ? 'e.g. WhatsApp sales'
                      : 'e.g. Instagram — new arrivals'
                  }
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500 block mb-1">
                  {formData.type === 'Chat Link' ? 'Chat link' : 'Link URL'}
                </label>
                <input
                  required
                  type="text"
                  value={formData.value}
                  onChange={(e) => {
                    setValidationError('');
                    setFormData({ ...formData, value: e.target.value });
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono placeholder-zinc-800"
                  placeholder={
                    formData.type === 'Chat Link'
                      ? 'https://wa.me/919876543210'
                      : 'https://'
                  }
                />
                <span className="text-[9px] text-zinc-500 mt-1.5 block leading-relaxed">
                  {formData.type === 'Chat Link' && (
                    <>
                      Paste your <strong>WhatsApp chat link</strong> (e.g.{' '}
                      <code className="text-zinc-400">https://wa.me/919876543210</code>). The number is
                      stored for admin only — the storefront hides it and opens chat through a secure
                      redirect. Telegram, Instagram DM, and Messenger direct links are also supported.
                    </>
                  )}
                  {formData.type === 'Social Channel' && (
                    <>Use your <strong>public profile or channel</strong> where new products are announced.</>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="connection_active_checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded bg-zinc-950 border-zinc-800 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                />
                <label
                  htmlFor="connection_active_checkbox"
                  className="text-[11px] font-semibold text-zinc-400 cursor-pointer select-none"
                >
                  Visible on storefront
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-zinc-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      )}
      </div>
    </div>
  );
}
