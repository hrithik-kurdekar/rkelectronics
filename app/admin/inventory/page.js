// app/admin/inventory/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { revalidateStorefront } from '@/app/actions/revalidate-storefront';
import { CONDITION_FILTER_OPTIONS } from '@/lib/product-conditions';
import {
  getMediaLimits,
  storagePathFromPublicUrl,
  truncateText,
} from '@/lib/media-limits';
import { compressImageToWebp } from '@/lib/compress-image';
import {
  isDemoMode,
  DEMO_WRITE_MESSAGE,
  fetchCategories,
  fetchCategoryById,
  fetchProductsForBrand as loadProductsForBrand,
  searchProducts,
} from '@/lib/data';
import { Star, Edit3, Trash2, X, ImagePlus, Inbox, GripVertical, AlertCircle, Search, Filter, Plus } from 'lucide-react';
import ErrorBanner from '@/app/components/ErrorBanner';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-media';
const MEDIA_LIMITS = getMediaLimits();

async function removeStorageUrls(urls) {
  const paths = (urls || [])
    .map((url) => storagePathFromPublicUrl(url, BUCKET_NAME))
    .filter(Boolean);
  if (!paths.length) return;
  await supabase.storage.from(BUCKET_NAME).remove(paths);
}

export default function InventoryPage() {
  // --- Hierarchy Matrices ---
  const [roots, setRoots] = useState([]);
  const [subs, setSubs] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);

  // Active Highlighted Trackers (UUID Strings)
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // --- Mobile Active Column Tracker ---
  const [activeTab, setActiveTab] = useState('roots'); // 'roots' | 'subs' | 'brands' | 'products'

  // --- Filtering & Smart Search States ---
  const [rootFilter, setRootFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearchScope, setProductSearchScope] = useState('brand'); // 'brand' | 'all'
  const [conditionFilter, setConditionFilter] = useState('All'); 
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isSearchingGlobally, setIsSearchingGlobally] = useState(false);
  
  const dropdownRef = useRef(null);

  // --- Modal Overlay Framework ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'root' | 'sub' | 'brand' | 'product'
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [pendingStorageRemovals, setPendingStorageRemovals] = useState([]);

  // --- Product Detailed View Dialog State ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [activeViewPhotoIndex, setActiveViewPhotoIndex] = useState(0);

  // --- Dynamic Category Context Helpers for Brand & Product Modals ---
  const [modalRootId, setModalRootId] = useState('');
  const [modalSubsList, setModalSubsList] = useState([]);
  const [modalBrandsList, setModalBrandsList] = useState([]);

  // Form Fields mirroring DB Schema cleanly
  const [formData, setFormData] = useState({
    name: '',          
    price: 0,          
    condition: 'New',  
    description: '',   
    defect_notes: '',  
    is_featured: false,
    photos: [],        
    root_category_id: '',
    sub_category_id: '',
    brand_id: '',
    parent_id: null
  });

  // --- Drag and Drop Tracker States ---
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetchInitialHierarchy();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (productSearchScope === 'all' && searchQuery.trim().length > 0) {
      handleGlobalSearch(searchQuery);
      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
        setActiveTab('products');
      }
    } else {
      setIsSearchingGlobally(false);
      setGlobalSearchResults([]);
    }
  }, [searchQuery, productSearchScope]);

  const matchesNameFilter = (name, query) => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return true;
    return String(name || '').toLowerCase().includes(q);
  };

  const matchesProductQuery = (item, query) => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return true;
    return (
      String(item.title || '').toLowerCase().includes(q) ||
      String(item.sku_code || '').toLowerCase().includes(q)
    );
  };

  const fetchInitialHierarchy = async () => {
    const { data: rootData, error } = await fetchCategories({ type: 'root' });
    if (error) {
      setLoadError('Could not load inventory categories. Please refresh the page.');
      return;
    }
    setLoadError(null);
    setRoots(rootData || []);
    
    if (rootData && rootData.length > 0) {
      const firstRoot = rootData[0];
      setSelectedRoot(firstRoot.id);
      await refreshSubColumn(firstRoot.id, true);
    }
  };

  const refreshSubColumn = async (rootId, selectDefault = false) => {
    const { data: subData, error } = await fetchCategories({ type: 'sub', parentId: rootId });
    if (error) {
      console.error('Failed fetching sub matrix:', error.message);
      return;
    }
    setSubs(subData || []);

    if (subData && subData.length > 0) {
      const targetSubId = selectDefault ? subData[0].id : (selectedSub && subData.some(s => s.id === selectedSub) ? selectedSub : subData[0].id);
      setSelectedSub(targetSubId);
      await refreshBrandColumn(targetSubId, selectDefault);
    } else {
      setSubs([]); setBrands([]); setProducts([]); setSelectedSub(null); setSelectedBrand(null);
    }
  };

  const refreshBrandColumn = async (subId, selectDefault = false) => {
    const { data: brandData, error } = await fetchCategories({ type: 'brand', parentId: subId });
    if (error) {
      console.error('Failed fetching brand matrix:', error.message);
      return;
    }
    setBrands(brandData || []);

    if (brandData && brandData.length > 0) {
      const targetBrandId = selectDefault ? brandData[0].id : (selectedBrand && brandData.some(b => b.id === selectedBrand) ? selectedBrand : brandData[0].id);
      setSelectedBrand(targetBrandId);
      if (!isSearchingGlobally) await fetchProductsForBrand(targetBrandId);
    } else {
      setBrands([]); setProducts([]); setSelectedBrand(null);
    }
  };

  const fetchProductsForBrand = async (brandId) => {
    const { data: prodData, error } = await loadProductsForBrand(brandId);
    if (error) {
      console.error('Failed fetching products:', error.message);
      return;
    }
    setProducts(prodData || []);
  };

  const handleGlobalSearch = async (query) => {
    setIsSearchingGlobally(true);
    const { data, error } = await searchProducts(query);
    if (!error) setGlobalSearchResults(data || []);
  };

  const handleSelectSearchedProduct = async (product) => {
    if (!product.root_category_id || !product.sub_category_id || !product.brand_id) return;

    setSearchQuery('');
    setIsSearchingGlobally(false);
    setProductSearchScope('brand');
    setSelectedRoot(product.root_category_id);
    
    const { data: subData } = await fetchCategories({ type: 'sub', parentId: product.root_category_id });
    setSubs(subData || []);
    setSelectedSub(product.sub_category_id);

    const { data: brandData } = await fetchCategories({ type: 'brand', parentId: product.sub_category_id });
    setBrands(brandData || []);
    setSelectedBrand(product.brand_id);

    await fetchProductsForBrand(product.brand_id);
  };

  const handleRootSelect = async (rootId) => {
    setSearchQuery('');
    setIsSearchingGlobally(false);
    setSubFilter('');
    setBrandFilter('');
    setSelectedRoot(rootId); setSelectedSub(null); setSelectedBrand(null); setProducts([]);
    await refreshSubColumn(rootId, true);
  };

  const handleSubSelect = async (subId) => {
    setSearchQuery('');
    setIsSearchingGlobally(false);
    setBrandFilter('');
    setSelectedSub(subId); setSelectedBrand(null); setProducts([]);
    await refreshBrandColumn(subId, true);
  };

  const handleBrandSelect = async (brandId) => {
    setSearchQuery('');
    setIsSearchingGlobally(false);
    setProductSearchScope('brand');
    setSelectedBrand(brandId);
    await fetchProductsForBrand(brandId);
  };

  const handleDragStart = (item) => setDraggedItem(item);
  const handleDragOver = (e) => e.preventDefault();

  const handleDropOnItem = async (targetItem, currentArray, typeStr) => {
    if (!draggedItem || draggedItem.id === targetItem.id || draggedItem.type !== typeStr) return;
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      setDraggedItem(null);
      return;
    }

    let localList = [...currentArray];
    const draggedIdx = localList.findIndex(i => i.id === draggedItem.id);
    const targetIdx = localList.findIndex(i => i.id === targetItem.id);

    localList.splice(draggedIdx, 1);
    localList.splice(targetIdx, 0, draggedItem);

    const updates = localList.map((item, index) => 
      supabase.from('categories').update({ sort_order: index + 1 }).eq('id', item.id)
    );
    
    await Promise.all(updates);
    setDraggedItem(null);
    
    if (typeStr === 'root') {
      const { data } = await fetchCategories({ type: 'root' });
      setRoots(data || []);
    } else if (typeStr === 'sub') {
      await refreshSubColumn(selectedRoot, false);
    } else if (typeStr === 'brand') {
      await refreshBrandColumn(selectedSub, false);
    }
  };

  // Image compression lives in lib/compress-image.js (uses MEDIA_LIMITS)

  const handleMultipleImagesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = MEDIA_LIMITS.productMaxImages - formData.photos.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${MEDIA_LIMITS.productMaxImages} images per product.`);
      e.target.value = '';
      return;
    }

    const accepted = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} more image(s) allowed (max ${MEDIA_LIMITS.productMaxImages}).`);
    }

    const uploadedSlots = accepted.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      url: '',
    }));

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...uploadedSlots],
    }));
    e.target.value = '';
  };

  const removePhotoSlot = (index) => {
    const targetPhoto = formData.photos[index];
    if (targetPhoto?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(targetPhoto.preview);
    }
    if (targetPhoto?.url) {
      setPendingStorageRemovals((prev) => [...prev, targetPhoto.url]);
    }
    setFormData((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const clearModalPhotoPreviews = () => {
    formData.photos.forEach(photo => {
      if (photo.preview && photo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(photo.preview);
      }
    });
  };

  const handleModalRootChange = async (rootId) => {
    setModalRootId(rootId);
    const { data: subData } = await fetchCategories({ type: 'sub', parentId: rootId });
    setModalSubsList(subData || []);
    setModalBrandsList([]);
    
    setFormData(prev => ({ 
      ...prev, 
      root_category_id: rootId,
      sub_category_id: subData?.[0]?.id || '',
      brand_id: '',
      parent_id: modalType === 'sub' ? rootId : (subData?.[0]?.id || '')
    }));

    if (subData && subData.length > 0 && modalType === 'product') {
      const { data: brandData } = await fetchCategories({ type: 'brand', parentId: subData[0].id });
      setModalBrandsList(brandData || []);
      setFormData(prev => ({ ...prev, sub_category_id: subData[0].id, brand_id: brandData?.[0]?.id || '' }));
    }
  };

  const handleModalSubChange = async (subId) => {
    const { data: brandData } = await fetchCategories({ type: 'brand', parentId: subId });
    setModalBrandsList(brandData || []);
    
    setFormData(prev => ({ 
      ...prev, 
      sub_category_id: subId, 
      brand_id: brandData?.[0]?.id || '',
      parent_id: modalType === 'brand' ? subId : null
    }));
  };

  const openAddModal = async (type) => {
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    setModalType(type); 
    setIsEditMode(false);
    setPendingStorageRemovals([]);
    
    let defaultParent = null;
    if (type === 'sub') defaultParent = selectedRoot;
    if (type === 'brand') defaultParent = selectedSub;

    setFormData({
      name: '', price: 0, condition: 'New', description: '', defect_notes: '', is_featured: false,
      photos: [], parent_id: defaultParent,
      root_category_id: selectedRoot || '',
      sub_category_id: selectedSub || '',
      brand_id: selectedBrand || ''
    });

    setModalRootId(selectedRoot || '');
    const { data: subData } = await fetchCategories({ type: 'sub', parentId: selectedRoot });
    setModalSubsList(subData || []);

    if (selectedSub) {
      const { data: brandData } = await fetchCategories({ type: 'brand', parentId: selectedSub });
      setModalBrandsList(brandData || []);
    } else {
      setModalBrandsList([]);
    }

    setIsModalOpen(true);
  };

  const openEditModal = async (type, item) => {
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    setModalType(type); 
    setIsEditMode(true); 
    setEditingItem(item);
    setPendingStorageRemovals([]);
    
    setFormData({
      name: item.name || item.title || '',
      description: item.description || '',
      price: item.price || 0,
      condition: item.condition || 'New',
      defect_notes: item.defect_notes || '',
      is_featured: item.is_featured || false,
      photos: item.image_urls ? item.image_urls.map(url => ({ file: null, preview: url, url })) : [],
      parent_id: item.parent_id || null,
      root_category_id: item.root_category_id || selectedRoot || '',
      sub_category_id: item.sub_category_id || selectedSub || '',
      brand_id: item.brand_id || selectedBrand || ''
    });

    if (type === 'sub' && item.parent_id) {
      setModalRootId(item.parent_id);
    }

    if (type === 'brand' && item.parent_id) {
      const { data: parentSub } = await fetchCategoryById(item.parent_id);
      if (parentSub) {
        setModalRootId(parentSub.parent_id);
        const { data: subData } = await fetchCategories({ type: 'sub', parentId: parentSub.parent_id });
        setModalSubsList(subData || []);
      }
    }

    if (type === 'product') {
      setModalRootId(item.root_category_id || selectedRoot || '');
      const { data: subData } = await fetchCategories({
        type: 'sub',
        parentId: item.root_category_id || selectedRoot,
      });
      setModalSubsList(subData || []);
      const { data: brandData } = await fetchCategories({
        type: 'brand',
        parentId: item.sub_category_id || selectedSub,
      });
      setModalBrandsList(brandData || []);
    }

    setIsModalOpen(true);
  };

  const openProductViewDialog = (product, e) => {
    if (e.target.closest('.action-btn')) return;
    setViewingProduct(product);
    setActiveViewPhotoIndex(0);
    setIsViewModalOpen(true);
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    setLoading(true);

    try {
      if (modalType !== 'product') {
        const assignedParent = modalType === 'sub' ? modalRootId : modalType === 'brand' ? formData.parent_id : null;
        const payload = { name: formData.name, type: modalType, parent_id: assignedParent };

        if (isEditMode) {
          const { error } = await supabase.from('categories').update(payload).eq('id', editingItem.id);
          if (error) throw error;
        } else {
          payload.sort_order = 0;
          const { data: insertedData, error } = await supabase.from('categories').insert([payload]).select().single();
          if (error) throw error;

          if (modalType === 'root') setSelectedRoot(insertedData.id);
          if (modalType === 'sub') setSelectedSub(insertedData.id);
          if (modalType === 'brand') setSelectedBrand(insertedData.id);
        }
      } else {
        let uploadedUrls = formData.photos.filter((p) => p.url).map((p) => p.url);
        const pendingUploadSlots = formData.photos.filter((p) => p.file);

        if (uploadedUrls.length + pendingUploadSlots.length > MEDIA_LIMITS.productMaxImages) {
          throw new Error(`Maximum ${MEDIA_LIMITS.productMaxImages} images per product.`);
        }

        if (pendingUploadSlots.length > 0) {
          const uploadPromises = pendingUploadSlots.map(async (photo) => {
            const compressedFileBlob = await compressImageToWebp(photo.file, MEDIA_LIMITS);
            const filename = `${crypto.randomUUID()}.webp`;

            const { error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(filename, compressedFileBlob, {
                contentType: 'image/webp',
                cacheControl: '3600',
              });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);
            return publicUrlData.publicUrl;
          });

          const newUrls = await Promise.all(uploadPromises);
          uploadedUrls = [...uploadedUrls, ...newUrls];
        }

        const previousUrls = isEditMode ? editingItem?.image_urls || [] : [];
        const orphanedUrls = previousUrls.filter((url) => !uploadedUrls.includes(url));
        const urlsToDelete = [...new Set([...pendingStorageRemovals, ...orphanedUrls])];

        const generatedSku = isEditMode
          ? editingItem.sku_code
          : `SKU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        const productPayload = {
          title: formData.name,
          sku_code: generatedSku,
          description: truncateText(formData.description, MEDIA_LIMITS.descriptionMaxLength),
          price: parseFloat(formData.price) || 0,
          condition: formData.condition,
          defect_notes:
            formData.condition !== 'New'
              ? truncateText(formData.defect_notes, MEDIA_LIMITS.defectNotesMaxLength)
              : null,
          is_featured: formData.is_featured,
          image_urls: uploadedUrls,
          root_category_id: formData.root_category_id || selectedRoot,
          sub_category_id: formData.sub_category_id || selectedSub,
          brand_id: formData.brand_id || selectedBrand,
        };

        if (isEditMode) {
          const { error } = await supabase.from('products').update(productPayload).eq('id', editingItem.id);
          if (error) throw error;

          if (viewingProduct && viewingProduct.id === editingItem.id) {
            setViewingProduct({ ...viewingProduct, ...productPayload });
          }
        } else {
          const { error: insertError } = await supabase.from('products').insert([productPayload]);
          if (insertError) throw insertError;
        }

        if (urlsToDelete.length > 0) {
          await removeStorageUrls(urlsToDelete);
        }
        setPendingStorageRemovals([]);
      }

      clearModalPhotoPreviews();
      setIsModalOpen(false);

      if (modalType === 'root') {
        const { data } = await fetchCategories({ type: 'root' });
        setRoots(data || []);
        if (!isEditMode && data && data.length > 0) await refreshSubColumn(selectedRoot || data[0].id, true);
      } else if (modalType === 'sub') {
        await refreshSubColumn(selectedRoot, false);
      } else if (modalType === 'brand') {
        await refreshBrandColumn(selectedSub, false);
      } else if (modalType === 'product') {
        if (selectedBrand) await fetchProductsForBrand(selectedBrand);
      }

      await revalidateStorefront();

    } catch (err) {
      alert(`Transaction Halted: ${err.message}`);
    } finally { 
      setLoading(false); 
    }
  };

  const toggleProductFeatured = async (product, e) => {
    e.stopPropagation();
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    const nextState = !product.is_featured;
    const { error } = await supabase.from('products').update({ is_featured: nextState }).eq('id', product.id);
    if (!error) { 
      const updatedProduct = { ...product, is_featured: nextState };
      if (viewingProduct && viewingProduct.id === product.id) {
        setViewingProduct(updatedProduct);
      }
      if (isSearchingGlobally) {
        handleGlobalSearch(searchQuery);
      } else if (selectedBrand) {
        await fetchProductsForBrand(selectedBrand); 
      }
      await revalidateStorefront();
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (isDemoMode()) {
      alert(DEMO_WRITE_MESSAGE);
      return;
    }
    if (confirm("Permanently drop item entry record?")) {
      let imageUrlsToRemove = [];
      if (type === 'product') {
        const { data: existing } = await supabase
          .from('products')
          .select('image_urls')
          .eq('id', id)
          .single();
        imageUrlsToRemove = existing?.image_urls || [];
      }

      const table = type === 'product' ? 'products' : 'categories';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        alert(`Deletion Failed: ${error.message}`);
        return;
      }

      if (type === 'product' && imageUrlsToRemove.length > 0) {
        await removeStorageUrls(imageUrlsToRemove);
      }
      
      if (type === 'product' && viewingProduct?.id === id) {
        setIsViewModalOpen(false);
      }

      if (type === 'root') { fetchInitialHierarchy(); }
      else if (type === 'sub') { await refreshSubColumn(selectedRoot, false); }
      else if (type === 'brand') { await refreshBrandColumn(selectedSub, false); }
      else if (type === 'product') { 
        if (isSearchingGlobally) handleGlobalSearch(searchQuery);
        else if (selectedBrand) await fetchProductsForBrand(selectedBrand); 
      }
      await revalidateStorefront();
    }
  };

  const filteredRoots = roots.filter((item) => matchesNameFilter(item.name, rootFilter));
  const filteredSubs = subs.filter((item) => matchesNameFilter(item.name, subFilter));
  const filteredBrands = brands.filter((item) => matchesNameFilter(item.name, brandFilter));

  const displayedProducts = (
    isSearchingGlobally
      ? globalSearchResults
      : products.filter((item) => matchesProductQuery(item, searchQuery))
  ).filter((item) => {
    if (conditionFilter === 'All') return true;
    return item.condition === conditionFilter;
  });

  const renderColumnSearch = (value, onChange, placeholder) => (
    <div className="relative flex-1 min-w-[4.5rem] mx-1 max-w-full">
      <Search className="w-3 h-3 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 bg-zinc-950 text-[11px] text-zinc-200 pl-7 pr-7 border border-zinc-800 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
          aria-label="Clear search"
        >
          <X className="w-3 h-3" />
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden">
      <ErrorBanner message={loadError} onDismiss={() => setLoadError(null)} className="mx-4 mt-2 shrink-0" />
    <div className="flex-1 min-h-0 w-full p-4 flex flex-col md:grid md:grid-cols-10 md:grid-rows-1 gap-4 items-stretch overflow-hidden select-none relative">
      
      {/* Sticky Mobile Navigation Controls Wrapper Layer */}
      <div className="z-30 col-span-1 md:hidden flex shrink-0 border border-zinc-800 bg-zinc-950 p-1 rounded-xl gap-1 h-11 items-center w-full shadow-lg">
        {['roots', 'subs', 'brands', 'products'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-center py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition ${
              activeTab === tab
                ? 'bg-zinc-900 text-orange-400 border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Column 1: Roots */}
      <div className={`col-span-1 md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col flex-1 min-h-0 max-h-full overflow-hidden w-full justify-start items-stretch ${activeTab === 'roots' ? 'flex' : 'hidden md:flex'}`}>
        <div className="h-8 mb-2.5 flex items-center gap-1 px-0.5 flex-shrink-0 w-full min-w-0">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex-shrink-0">Roots</h3>
          {renderColumnSearch(rootFilter, setRootFilter, 'Filter…')}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="bg-emerald-950 text-emerald-400 px-1.5 rounded text-[10px] font-mono h-8 min-w-8 flex items-center justify-center border border-emerald-900/30">{filteredRoots.length}</span>
            <button onClick={() => openAddModal('root')} className="h-8 w-8 flex items-center justify-center rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/40 transition" title="Add Root">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full">
          {roots.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-zinc-600 border border-zinc-800 border-dashed rounded-xl gap-2 w-full"><Inbox className="w-4 h-4" /> <span className="text-xs">No Roots</span></div>
          ) : filteredRoots.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl gap-2 w-full"><Inbox className="w-4 h-4" /><span className="text-xs">No matches</span></div>
          ) : (
            filteredRoots.map(item => (
              <div key={item.id} draggable onDragStart={() => handleDragStart(item)} onDragOver={handleDragOver} onDrop={() => handleDropOnItem(item, roots, 'root')} onClick={() => handleRootSelect(item.id)} className={`p-2 rounded-lg flex items-center justify-between cursor-pointer border transition group w-full min-w-0 overflow-hidden ${selectedRoot === item.id ? 'bg-emerald-950/20 border-emerald-500/60 text-emerald-300' : 'bg-zinc-950 border-zinc-800/50 hover:bg-zinc-900'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab group-hover:text-zinc-400 flex-shrink-0" />
                  <span className="text-xs font-medium truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 pl-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEditModal('root', item)} className="text-zinc-500 hover:text-blue-400"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteItem('root', item.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Column 2: Subs */}
      <div className={`col-span-1 md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col flex-1 min-h-0 max-h-full overflow-hidden w-full justify-start items-stretch ${activeTab === 'subs' ? 'flex' : 'hidden md:flex'}`}>
        <div className="h-8 mb-2.5 flex items-center gap-1 px-0.5 flex-shrink-0 w-full min-w-0">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex-shrink-0">Subs</h3>
          {renderColumnSearch(subFilter, setSubFilter, 'Filter…')}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="bg-blue-950 text-blue-400 px-1.5 rounded text-[10px] font-mono h-8 min-w-8 flex items-center justify-center border border-blue-900/30">{filteredSubs.length}</span>
            <button disabled={!selectedRoot} onClick={() => openAddModal('sub')} className="h-8 w-8 flex items-center justify-center rounded bg-blue-950/60 hover:bg-blue-900 text-blue-400 border border-blue-800/40 disabled:opacity-20 disabled:hover:bg-blue-950/60 transition" title="Add Sub Category">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full">
          {!selectedRoot ? (
            <div className="h-32 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800/50 rounded-xl p-4 text-center gap-1.5 w-full"><AlertCircle className="w-4 h-4 text-zinc-500" /><span className="text-[11px]">Select a Root Category first</span></div>
          ) : subs.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl gap-2 w-full"><Inbox className="w-4 h-4" /><span className="text-xs">No Subs found</span></div>
          ) : filteredSubs.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl gap-2 w-full"><Inbox className="w-4 h-4" /><span className="text-xs">No matches</span></div>
          ) : (
            filteredSubs.map(item => (
              <div key={item.id} draggable onDragStart={() => handleDragStart(item)} onDragOver={handleDragOver} onDrop={() => handleDropOnItem(item, subs, 'sub')} onClick={() => handleSubSelect(item.id)} className={`p-2 rounded-lg flex items-center justify-between cursor-pointer border transition group w-full min-w-0 overflow-hidden ${selectedSub === item.id ? 'bg-blue-950/20 border-blue-500/60 text-blue-300' : 'bg-zinc-950 border-zinc-800/50 hover:bg-zinc-900'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab group-hover:text-zinc-400 flex-shrink-0" />
                  <span className="text-xs font-medium truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 pl-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEditModal('sub', item)} className="text-zinc-500 hover:text-blue-400"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteItem('sub', item.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Column 3: Brands */}
      <div className={`col-span-1 md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col flex-1 min-h-0 max-h-full overflow-hidden w-full justify-start items-stretch ${activeTab === 'brands' ? 'flex' : 'hidden md:flex'}`}>
        <div className="h-8 mb-2.5 flex items-center gap-1 px-0.5 flex-shrink-0 w-full min-w-0">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex-shrink-0">Brands</h3>
          {renderColumnSearch(brandFilter, setBrandFilter, 'Filter…')}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="bg-purple-950 text-purple-400 px-1.5 rounded text-[10px] font-mono h-8 min-w-8 flex items-center justify-center border border-purple-900/30">{filteredBrands.length}</span>
            <button disabled={!selectedSub} onClick={() => openAddModal('brand')} className="h-8 w-8 flex items-center justify-center rounded bg-purple-950/60 hover:bg-purple-900 text-purple-400 border border-purple-800/40 disabled:opacity-20 disabled:hover:bg-purple-950/60 transition" title="Add Brand Context">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full">
          {!selectedSub ? (
            <div className="h-32 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800/50 rounded-xl p-4 text-center gap-1.5 w-full"><AlertCircle className="w-4 h-4 text-zinc-500" /><span className="text-[11px]">Select a Sub Category first</span></div>
          ) : brands.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl gap-2 w-full"><Inbox className="w-4 h-4" /><span className="text-xs">No Brands found</span></div>
          ) : filteredBrands.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl gap-2 w-full"><Inbox className="w-4 h-4" /><span className="text-xs">No matches</span></div>
          ) : (
            filteredBrands.map(item => (
              <div key={item.id} draggable onDragStart={() => handleDragStart(item)} onDragOver={handleDragOver} onDrop={() => handleDropOnItem(item, brands, 'brand')} onClick={() => handleBrandSelect(item.id)} className={`p-2 rounded-lg flex items-center justify-between cursor-pointer border transition group w-full min-w-0 overflow-hidden ${selectedBrand === item.id ? 'bg-purple-950/20 border-purple-500/60 text-purple-300' : 'bg-zinc-950 border-zinc-800/50 hover:bg-zinc-900'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab group-hover:text-zinc-400 flex-shrink-0" />
                  <span className="text-xs font-medium truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 pl-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEditModal('brand', item)} className="text-zinc-500 hover:text-blue-400"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteItem('brand', item.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Column 4: Products Grid View */}
      <div className={`col-span-1 md:col-span-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col flex-1 min-h-0 max-h-full overflow-hidden w-full justify-start items-stretch ${activeTab === 'products' ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Header Controls Line */}
        <div className="h-8 mb-2.5 flex items-center gap-1 px-0.5 flex-shrink-0 select-none w-full min-w-0">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-orange-400 whitespace-nowrap flex-shrink-0">
            <span className="md:hidden">Prod</span>
            <span className="hidden md:inline">Products</span>
          </h3>

          <button
            type="button"
            onClick={() => {
              if (productSearchScope === 'all') {
                if (selectedBrand) setProductSearchScope('brand');
              } else {
                setProductSearchScope('all');
              }
            }}
            disabled={productSearchScope === 'all' && !selectedBrand}
            className={`h-8 min-w-[2.25rem] px-1.5 flex-shrink-0 rounded-md border text-[9px] font-bold uppercase tracking-wide transition disabled:opacity-30 ${
              productSearchScope === 'all'
                ? 'border-orange-500/40 bg-orange-950/40 text-orange-400'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
            }`}
            title={
              productSearchScope === 'all'
                ? 'Searching all products — click for brand only'
                : 'Searching this brand — click for all products'
            }
          >
            {productSearchScope === 'all' ? 'All' : 'Br'}
          </button>

          {renderColumnSearch(
            searchQuery,
            setSearchQuery,
            productSearchScope === 'all' ? 'All…' : 'Brand…'
          )}

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`rounded-md border text-zinc-400 hover:text-zinc-200 bg-zinc-950 transition flex items-center justify-center h-8 w-8 ${conditionFilter !== 'All' ? 'border-orange-500/40 text-orange-400' : 'border-zinc-800'}`}
              >
                <Filter className="w-3.5 h-3.5" />
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-30">
                  <div className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 px-2.5 py-1">Condition</div>
                  {CONDITION_FILTER_OPTIONS.map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => {
                        setConditionFilter(cond);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1 text-xs font-medium transition ${conditionFilter === cond ? 'bg-zinc-800 text-orange-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="bg-orange-950 text-orange-400 px-1.5 rounded text-[10px] font-mono h-8 min-w-8 flex items-center justify-center border border-orange-900/30">{displayedProducts.length}</span>
            <button disabled={!selectedBrand && !isSearchingGlobally} onClick={() => openAddModal('product')} className="h-8 w-8 flex items-center justify-center rounded bg-orange-950/60 hover:bg-orange-900 text-orange-400 border border-orange-800/40 disabled:opacity-20 disabled:hover:bg-orange-950/60 transition" title="Add New Product Item">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isSearchingGlobally && (
          <p className="text-[10px] text-orange-400/80 mb-2 px-0.5 flex-shrink-0">
            Searching all products — select a result to jump to its brand.
          </p>
        )}
        
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full">
          {!selectedBrand && !isSearchingGlobally ? (
            <div className="h-32 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800/50 rounded-xl p-4 text-center gap-1.5 w-full"><AlertCircle className="w-4 h-4 text-zinc-500" /><span className="text-[11px]">Select a Brand or search All above</span></div>
          ) : displayedProducts.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl gap-2 w-full"><Inbox className="w-4 h-4" /><span className="text-xs">No Products found</span></div>
          ) : (
            /* Standardized Compact Responsive E-commerce Grid Matrix */
            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(145px,1fr))] gap-3 pb-2 w-full min-w-0">
              {displayedProducts.map(item => (
                <div 
                  key={item.id} 
                  onClick={(e) => {
                    if (isSearchingGlobally) {
                      handleSelectSearchedProduct(item);
                    } else {
                      openProductViewDialog(item, e);
                    }
                  }}
                  className={`bg-zinc-950 border rounded-xl flex flex-col overflow-hidden relative transition-all duration-200 group/card cursor-pointer shadow-sm hover:shadow-md w-full min-w-0 max-w-[165px] mx-auto ${isSearchingGlobally ? 'hover:border-blue-500' : ''} ${item.is_featured ? 'border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.04)]' : 'border-zinc-800/90 hover:border-zinc-700/80'}`}
                >
                  
                  {/* Image Square Asset Content Frame */}
                  <div className="w-full aspect-square bg-zinc-900/60 relative overflow-hidden flex items-center justify-center border-b border-zinc-900/80">
                    {item.image_urls?.[0] ? (
                      <img src={item.image_urls[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                    ) : (
                      <div className="text-[9px] tracking-widest font-mono text-zinc-600 uppercase">No Media</div>
                    )}

                    {/* Badge Indicator Layers */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 select-none z-20">
                      <button 
                        type="button"
                        onClick={(e) => toggleProductFeatured(item, e)} 
                        className="action-btn p-1 rounded-lg shadow-md border transition-all duration-150 transform active:scale-95 bg-zinc-950/90 text-zinc-500 hover:text-amber-400 border-zinc-800/80 backdrop-blur-md"
                      >
                        <Star className={`w-3 h-3 ${item.is_featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      
                      <span className={`text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md shadow-md border backdrop-blur-md ${item.condition === 'New' ? 'bg-blue-600/80 border-blue-500/40 text-white' : 'bg-amber-600/80 border-amber-500/40 text-white'}`}>
                        {item.condition}
                      </span>
                    </div>

                    {/* Actions Slide-Up Hover Panel Block */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 flex items-center justify-end gap-1.5 translate-y-full group-hover/card:translate-y-0 transition-transform duration-200 ease-out z-20" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEditModal('product', item)} className="action-btn p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-blue-400 transition shadow-sm" title="Edit Product"><Edit3 className="w-3 h-3" /></button>
                      <button onClick={() => handleDeleteItem('product', item.id)} className="action-btn p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 transition shadow-sm" title="Delete Product"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>

                  {/* Description Details Layout Container */}
                  <div className="p-2.5 bg-zinc-950/40 flex flex-col gap-1.5 flex-1 justify-center">
                    {/* Aligned SKU Block directly centered inside header */}
                    <div className="text-[9px] font-mono font-bold tracking-wide text-zinc-500 text-center select-all bg-zinc-900/40 py-0.5 px-1 rounded border border-zinc-900/40 truncate">
                      {item.sku_code}
                    </div>
                    {/* Balanced Bottom Baseline Split Row (Name Left | Price Right) */}
                    <div className="flex items-center justify-between gap-2 border-t border-zinc-900/60 pt-1.5 min-w-0">
                      <h4 className="text-[10px] font-medium text-zinc-300 truncate leading-tight flex-1 text-left" title={item.title}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-400 font-mono text-right flex-shrink-0">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- E-commerce Professional Product Deep-Dive View Dialog --- */}
      {isViewModalOpen && viewingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-40 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl p-5 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
            
            {/* TOP ROW: Inline Circle Actions Panel Header (No Border Partitions) */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono tracking-wide">
                <span className="text-zinc-500 font-semibold">Product Code:</span>
                <span className="text-orange-400 font-bold tracking-widest select-all">{viewingProduct.sku_code}</span>
              </div>
              
              {/* Circular Action Controls Wrapper Block (Partition lines dropped) */}
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => openEditModal('product', viewingProduct)}
                  className="action-btn p-2 text-zinc-400 hover:text-blue-400 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800 rounded-full transition shadow-sm"
                  title="Modify Entry"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  type="button" 
                  onClick={() => handleDeleteItem('product', viewingProduct.id)}
                  className="action-btn p-2 text-zinc-400 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-zinc-800 rounded-full transition shadow-sm"
                  title="Purge Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsViewModalOpen(false)} 
                  className="p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800 rounded-full transition"
                  title="Dismiss View"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* BOTTOM ROW: Split Media Workspace & Info Segment Panels */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-y-auto min-h-0 pr-1 md:divide-x md:divide-zinc-800/80">
              
              {/* Left Column Media Area Frame */}
              <div className="md:col-span-5 flex flex-col gap-4 min-h-0 justify-start items-center">
                {/* Standardized Square Asset Preview Container */}
                <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden flex items-center justify-center relative aspect-square w-full max-h-[320px] shadow-inner flex-shrink-0">
                  {viewingProduct.image_urls?.[activeViewPhotoIndex] ? (
                    <img src={viewingProduct.image_urls[activeViewPhotoIndex]} alt="" className="w-full h-full object-cover transition duration-300" />
                  ) : (
                    <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">No Product Image Available</span>
                  )}
                </div>

                {/* Multiple Thumbnail Strip Grid Layout Centered */}
                {viewingProduct.image_urls && viewingProduct.image_urls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto justify-center items-center pb-1 max-h-16 w-full mx-auto flex-shrink-0 scrollbar-thin">
                    {viewingProduct.image_urls.map((url, index) => (
                      <button 
                        key={index} 
                        type="button"
                        onClick={() => setActiveViewPhotoIndex(index)}
                        className="w-12 h-12 rounded-lg border-2 flex-shrink-0 overflow-hidden transition bg-zinc-950 p-0.5"
                        style={{ borderColor: index === activeViewPhotoIndex ? '#f97316' : '#27272a' }}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover rounded-md" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Left-Aligned Continuous Layout Panel Block (Price Container Removed) */}
              <div className="md:col-span-7 flex flex-col justify-start min-h-0 text-left md:pl-6 pt-2 md:pt-0">
                <div className="space-y-4">
                  
                  {/* Badges Horizon Line */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md shadow-sm border backdrop-blur-md inline-block ${viewingProduct.condition === 'New' ? 'bg-blue-600/80 border-blue-500/40 text-white' : 'bg-amber-600/80 border-amber-500/40 text-white'}`}>
                      {viewingProduct.condition}
                    </span>
                    
                    {viewingProduct.is_featured && (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> FEATURED
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Product Name</h4>
                    <h2 className="text-base md:text-lg font-bold tracking-tight text-white leading-snug">
                      {viewingProduct.title}
                    </h2>
                  </div>

                  {/* Clean Left-Aligned Pricing Metric Segment (Stripped Background Container Rules) */}
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Price</h4>
                    <div className="text-base font-mono font-extrabold text-emerald-400">
                      ₹{viewingProduct.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Description Layer */}
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Description</h4>
                    <p className="text-xs md:text-sm text-zinc-400 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto pr-1">
                      {viewingProduct.description || "No description logs available for this configuration entry."}
                    </p>
                  </div>

                  {/* Defect Reports */}
                  {viewingProduct.condition !== 'New' && viewingProduct.defect_notes && (
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Defect Logs</h4>
                      <p className="text-xs md:text-sm text-amber-400/90 leading-relaxed whitespace-pre-line">
                        {viewingProduct.defect_notes}
                      </p>
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- Global Overlay Configuration Modals Template Framework --- */}
      {isModalOpen && (
        <form onSubmit={handleSaveForm} className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-4 shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2.5 flex-shrink-0">
              <h3 className="text-xs font-bold tracking-tight text-white capitalize">{isEditMode ? 'Modify' : 'Create New'} {modalType} Template</h3>
              <button type="button" onClick={() => { clearModalPhotoPreviews(); setIsModalOpen(false); }} className="p-1 text-zinc-500 hover:text-zinc-200 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5 min-h-0">
              
              {/* Hierarchical Tree Blueprint Mappings Engine for Products */}
              {modalType === 'product' && (
                <div className="p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-xl text-[10px] space-y-2">
                  <span className="font-extrabold tracking-wider uppercase block text-zinc-500 text-[8px]">Categorical Node Allocation Matrix</span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Root</label>
                      <select 
                        required
                        value={formData.root_category_id || ''} 
                        onChange={(e) => handleModalRootChange(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-zinc-700"
                      >
                        <option value="">Select Root...</option>
                        {roots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Sub</label>
                      <select 
                        required
                        value={formData.sub_category_id || ''} 
                        onChange={(e) => handleModalSubChange(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-zinc-700"
                      >
                        <option value="">Select Sub...</option>
                        {modalSubsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Brand</label>
                      <select 
                        required
                        value={formData.brand_id || ''} 
                        onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-zinc-700"
                      >
                        <option value="">Select Brand...</option>
                        {modalBrandsList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Editable Root Matrix Selection for Sub-Categories */}
              {modalType === 'sub' && (
                <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] space-y-2">
                  <label className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Root Anchor Assignment</label>
                  <select 
                    required
                    value={modalRootId || ''} 
                    onChange={(e) => handleModalRootChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-zinc-700"
                  >
                    <option value="">Select Root Node...</option>
                    {roots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              )}

              {/* Linked Blueprint Mappings Engine for Brands */}
              {modalType === 'brand' && (
                <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] space-y-2">
                  <span className="font-extrabold tracking-wider uppercase block text-zinc-500 text-[8px]">Linked Category Node Framework</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Root Anchor</label>
                      <select 
                        value={modalRootId} 
                        onChange={(e) => handleModalRootChange(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-zinc-700"
                      >
                        <option value="">Select Root Node...</option>
                        {roots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Sub Category Base</label>
                      <select 
                        value={formData.parent_id || ''} 
                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-zinc-700"
                      >
                        <option value="">Select Sub Node...</option>
                        {modalSubsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[9px] font-extrabold tracking-wider uppercase text-zinc-400 block mb-1">
                  {modalType === 'product' ? 'Product Name/Title' : `${modalType} Matrix Label`}
                </label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder-zinc-700" placeholder="Insert configuration metric title..."/>
              </div>

              {modalType === 'product' && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[9px] font-extrabold tracking-wider uppercase text-zinc-400 block mb-1">Storefront Value (INR)</label>
                      <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono" />
                    </div>
                    <div>
                      <label className="text-[9px] font-extrabold tracking-wider uppercase text-zinc-400 block mb-1">Item State Condition</label>
                      <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700">
                        <option value="New">New</option>
                        <option value="Refurbished">Refurbished</option>
                        <option value="Used">Used / Pre-Owned</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-extrabold tracking-wider uppercase text-zinc-400 block mb-1">
                      Product Description
                      <span className="ml-1 font-mono text-zinc-600 normal-case tracking-normal">
                        ({(formData.description || '').length}/{MEDIA_LIMITS.descriptionMaxLength})
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      maxLength={MEDIA_LIMITS.descriptionMaxLength}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 resize-none placeholder-zinc-700"
                      placeholder="Provide product feature entry context logs..."
                    />
                  </div>

                  {formData.condition !== 'New' && (
                    <div>
                      <label className="text-[9px] font-extrabold tracking-wider uppercase text-amber-400 block mb-1">
                        Defect Logs
                        <span className="ml-1 font-mono text-amber-700/80 normal-case tracking-normal">
                          ({(formData.defect_notes || '').length}/{MEDIA_LIMITS.defectNotesMaxLength})
                        </span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        maxLength={MEDIA_LIMITS.defectNotesMaxLength}
                        value={formData.defect_notes}
                        onChange={(e) => setFormData({ ...formData, defect_notes: e.target.value })}
                        className="w-full bg-zinc-950 border border-amber-900/30 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-700 resize-none placeholder-amber-950/50"
                        placeholder="State structural or physical breakdown defects..."
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-0.5">
                    <input type="checkbox" id="featured_checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="rounded bg-zinc-950 border-zinc-800 text-amber-500 focus:ring-0 w-3.5 h-3.5" />
                    <label htmlFor="featured_checkbox" className="text-xs font-semibold text-zinc-300 cursor-pointer select-none">Pin as Featured Template</label>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="border-b border-zinc-800 pb-1">
                      <label className="text-[9px] font-extrabold tracking-wider uppercase text-zinc-400 block">
                        Product images ({formData.photos.length}/{MEDIA_LIMITS.productMaxImages})
                        <span className="ml-1 font-normal normal-case tracking-normal text-zinc-600">
                          {MEDIA_LIMITS.imageMaxEdge}px WebP @ {MEDIA_LIMITS.imageWebpQuality}
                        </span>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square border border-zinc-800/80 rounded-lg bg-zinc-950 overflow-hidden group">
                          <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removePhotoSlot(index)} className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-600 text-white p-0.5 rounded transition opacity-0 group-hover:opacity-100"><X className="w-2.5 h-2.5" /></button>
                        </div>
                      ))}

                      {formData.photos.length < MEDIA_LIMITS.productMaxImages && (
                        <label className="cursor-pointer aspect-square border border-dashed border-zinc-800 hover:border-zinc-600 rounded-lg flex flex-col items-center justify-center bg-zinc-950/40 text-zinc-500 hover:text-zinc-300 transition">
                          <ImagePlus className="w-4 h-4 mb-0.5" />
                          <span className="text-[8px] font-bold uppercase tracking-wider">Upload</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleMultipleImagesUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-2.5 border-t border-zinc-800 flex-shrink-0">
              <button type="button" onClick={() => { clearModalPhotoPreviews(); setPendingStorageRemovals([]); setIsModalOpen(false); }} className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition">Dismiss</button>
              <button type="submit" disabled={loading} className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50">
                {loading ? 'Processing...' : 'Save Layout'}
              </button>
            </div>

          </div>
        </form>
      )}
    </div>
    </div>
  );
}