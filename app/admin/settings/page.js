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
import {
  Link2,
  Plus,
  Edit3,
  Trash2,
  X,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  Inbox,
  AlertCircle,
  ShoppingBag,
  Rss,
} from 'lucide-react';
import ErrorBanner from '@/app/components/ErrorBanner';

const CONNECTION_GROUPS = [
  {
    id: 'contact',
    title: 'Contact seller',
    subtitle: 'Product inquiries',
    description:
      'One-to-one channels for shoppers asking about a specific product — price, condition, or availability.',
    storefrontHint: 'Shown on product detail pages',
    icon: ShoppingBag,
    accent: 'border-blue-500/20 bg-blue-500/5',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    categories: [
      {
        type: 'Phone',
        title: 'Phone numbers',
        description: 'Direct call lines for sales support.',
      },
      {
        type: 'Email',
        title: 'Email addresses',
        description: 'Inboxes for product and billing questions.',
      },
      {
        type: 'Chat Link',
        title: 'Direct chat links',
        description: 'Private WhatsApp/Telegram for 1:1 sales — not broadcast groups.',
      },
    ],
  },
  {
    id: 'social',
    title: 'Follow for updates',
    subtitle: 'New listings',
    description:
      'Public social channels where you post new inventory. Followers get alerts — not for private product chat.',
    storefrontHint: 'Shown in the site footer',
    icon: Rss,
    accent: 'border-violet-500/20 bg-violet-500/5',
    badgeClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    categories: [
      {
        type: 'Social Channel',
        title: 'Social & community links',
        description: 'Instagram, Facebook, YouTube, WhatsApp Channels, Telegram, etc.',
        presets: [
          { label: 'Instagram', value: 'https://instagram.com/' },
          { label: 'Facebook Page', value: 'https://facebook.com/' },
          { label: 'YouTube', value: 'https://youtube.com/@' },
          { label: 'WhatsApp Channel', value: 'https://whatsapp.com/channel/' },
          { label: 'Telegram', value: 'https://t.me/' },
        ],
      },
    ],
  },
];

const ALL_CATEGORIES = CONNECTION_GROUPS.flatMap((g) => g.categories);

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalContext, setModalContext] = useState(null);

  const [formData, setFormData] = useState({
    label: '',
    type: 'Phone',
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

  const openAddModal = (targetType, preset = null, group = null) => {
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    setIsEditMode(false);
    setEditingItem(null);
    setValidationError('');
    setModalContext(group);
    setFormData({
      label: preset?.label || '',
      type: targetType,
      value: preset?.value || '',
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

    let renderValue = item.value;
    if (item.type === 'Email' && renderValue.startsWith('mailto:')) {
      renderValue = renderValue.replace('mailto:', '');
    }

    setFormData({
      label: item.label,
      type: item.type,
      value: renderValue,
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

    if (type === 'Phone') {
      const indianPhoneRegex = /^\+91\s?[6-9]\d{9}$/;
      if (!indianPhoneRegex.test(value.trim())) {
        setValidationError('Phone must be Indian format: +91 followed by 10 digits (e.g. +91 9876543210).');
        return false;
      }
    }

    if (type === 'Email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        setValidationError('Please enter a valid email address.');
        return false;
      }
    }

    if (type === 'Chat Link' || type === 'Social Channel') {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
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
      let finalValue = formData.value.trim();

      if (formData.type === 'Email' && !finalValue.startsWith('mailto:')) {
        finalValue = `mailto:${finalValue}`;
      }
      if (formData.type === 'Phone' && !finalValue.startsWith('tel:')) {
        finalValue = `tel:${finalValue.replace(/\s/g, '')}`;
      }

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
      case 'Phone':
        return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'Chat Link':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'Social Channel':
        return <Globe className="w-4 h-4 text-violet-400" />;
      default:
        return <Globe className="w-4 h-4 text-zinc-400" />;
    }
  };

  const modalCategory = ALL_CATEGORIES.find((c) => c.type === formData.type);

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 md:py-8 space-y-8 select-none">
      <ErrorBanner message={loadError} onDismiss={() => setLoadError(null)} />

      <div className="border-b border-zinc-800 pb-4 space-y-2">
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-500" /> Platform Connections
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-3xl leading-relaxed">
          Two separate purposes — don&apos;t mix them up.{' '}
          <strong className="text-zinc-400">Contact seller</strong> is for shoppers messaging you
          about a product. <strong className="text-zinc-400">Follow for updates</strong> is for
          public channels where you announce new listings.
        </p>
      </div>

      <div className="space-y-12 pb-12">
        {CONNECTION_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const groupTypes = group.categories.map((c) => c.type);
          const groupCount = connections.filter((c) => groupTypes.includes(c.type)).length;

          return (
            <div key={group.id} className={`rounded-2xl border p-5 sm:p-6 space-y-6 ${group.accent}`}>
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <GroupIcon className="w-5 h-5 text-zinc-300" />
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
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">{group.description}</p>
                    <p className="text-[11px] text-zinc-500">
                      Storefront: <span className="text-zinc-400">{group.storefrontHint}</span>
                    </p>
                  </div>
                </div>
              </div>

              {group.categories.map((cat) => {
                const catItems = connections.filter((item) => item.type === cat.type);

                return (
                  <div key={cat.type} className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-2">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                          {getIconForType(cat.type)} {cat.title}
                          <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-md">
                            {catItems.length}
                          </span>
                        </h4>
                        <p className="text-[11px] text-zinc-500">{cat.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openAddModal(cat.type, null, group)}
                        className="h-8 px-3 text-[11px] font-bold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>

                    {cat.presets?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {cat.presets.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => openAddModal(cat.type, preset, group)}
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-600 transition"
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {catItems.length === 0 ? (
                      <div className="py-6 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40 text-xs text-zinc-600 gap-1.5">
                        <Inbox className="w-4 h-4 text-zinc-700" /> None added yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
          );
        })}
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
                <p className="text-zinc-500 mt-1">{modalContext.description}</p>
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
                    formData.type === 'Phone'
                      ? 'e.g. Sales hotline'
                      : formData.type === 'Email'
                        ? 'e.g. Product inquiries'
                        : formData.type === 'Chat Link'
                          ? 'e.g. WhatsApp sales'
                          : 'e.g. Instagram — new arrivals'
                  }
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500 block mb-1">
                  {formData.type === 'Phone' ? 'Phone number' : formData.type === 'Email' ? 'Email' : 'Link URL'}
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
                    formData.type === 'Phone'
                      ? '+91 9876543210'
                      : formData.type === 'Email'
                        ? 'sales@rkelectronics.in'
                        : modalCategory?.presets?.[0]?.value || 'https://'
                  }
                />
                <span className="text-[9px] text-zinc-500 mt-1.5 block leading-relaxed">
                  {formData.type === 'Chat Link' && (
                    <>Use a <strong>direct chat</strong> link (wa.me/…) — not a WhatsApp Channel URL.</>
                  )}
                  {formData.type === 'Social Channel' && (
                    <>Use your <strong>public profile or channel</strong> where new products are announced.</>
                  )}
                  {formData.type === 'Phone' && <>Format: +91 followed by 10 digits.</>}
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
