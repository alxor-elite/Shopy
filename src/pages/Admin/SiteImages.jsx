import { useState, useEffect } from 'react'
import { Upload, Check, ImageIcon, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// All site images with descriptive labels, grouped by section
const DEFAULT_IMAGES = [
  // Home Page
  { key: 'hero_banner', label: 'Home Page — Hero Banner (main background image)', section: 'Home Page', image_url: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600' },
  { key: 'story_image_1', label: 'Home Page — "Our Story" Section Left Image', section: 'Home Page', image_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400' },
  { key: 'story_image_2', label: 'Home Page — "Our Story" Section Right Image', section: 'Home Page', image_url: 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=400' },
  // Products Page Banners
  { key: 'banner_all', label: 'Products Page — Banner for "All Products"', section: 'Products Page', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600' },
  { key: 'banner_tshirts', label: 'Products Page — Banner for "T-Shirts" category', section: 'Products Page', image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600' },
  { key: 'banner_shirts', label: 'Products Page — Banner for "Shirts" category', section: 'Products Page', image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1600' },
  { key: 'banner_jeans', label: 'Products Page — Banner for "Jeans" category', section: 'Products Page', image_url: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=1600' },
  { key: 'banner_cargos', label: 'Products Page — Banner for "Cargos" category', section: 'Products Page', image_url: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1600' },
]

const SECTIONS = ['Home Page', 'Products Page']

export default function AdminSiteImages() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState({})
  const [saved, setSaved] = useState({})
  const [seeding, setSeeding] = useState(false)
  const [tableExists, setTableExists] = useState(true)

  useEffect(() => { fetchImages() }, [])

  async function fetchImages() {
    const { data, error } = await supabase.from('site_images').select('*').order('key')
    if (error) {
      setTableExists(false)
      setLoading(false)
      return
    }
    setTableExists(true)
    setImages(data || [])
    setLoading(false)
  }

  async function seedDefaults() {
    setSeeding(true)
    for (const img of DEFAULT_IMAGES) {
      const exists = images.find(i => i.key === img.key)
      if (!exists) {
        await supabase.from('site_images').insert({ key: img.key, label: img.label, image_url: img.image_url })
      }
    }
    await fetchImages()
    setSeeding(false)
  }

  async function handleImageUpload(imageRecord, file) {
    if (!file) return
    setUploading(u => ({ ...u, [imageRecord.id]: true }))
    const fileName = `site/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) {
      alert(`Upload failed: ${error.message}`)
    } else if (data) {
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path)
      const { error: updateError } = await supabase.from('site_images').update({ image_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', imageRecord.id)
      if (updateError) {
        alert(`Image uploaded but failed to save URL: ${updateError.message}`)
      }
      setSaved(s => ({ ...s, [imageRecord.id]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [imageRecord.id]: false })), 2000)
      fetchImages()
    }
    setUploading(u => ({ ...u, [imageRecord.id]: false }))
  }


  async function handleUrlUpdate(imageRecord, url) {
    await supabase.from('site_images').update({ image_url: url, updated_at: new Date().toISOString() }).eq('id', imageRecord.id)
    setSaved(s => ({ ...s, [imageRecord.id]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [imageRecord.id]: false })), 2000)
    fetchImages()
  }

  async function handleLabelUpdate(imageRecord, label) {
    await supabase.from('site_images').update({ label }).eq('id', imageRecord.id)
    fetchImages()
  }



  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-lg" />)}
      </div>
    )
  }

  if (!tableExists) {
    return (
      <div className="text-center py-16">
        <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Site Images Table Not Found</h2>
        <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
          The <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">site_images</code> table doesn't exist yet.
          Run the SQL from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">supabase/schema.sql</code> in your Supabase SQL Editor to create it.
        </p>
      </div>
    )
  }

  // Group images by section
  const grouped = {}
  SECTIONS.forEach(s => { grouped[s] = [] })
  grouped['Other'] = []

  images.forEach(img => {
    // Skip mega menu images — those are managed internally
    if (img.key.startsWith('mega_image_')) return
    const defaultImg = DEFAULT_IMAGES.find(d => d.key === img.key)
    // Auto-group banner_ keys under Products Page
    const section = defaultImg?.section || (img.key.startsWith('banner_') ? 'Products Page' : 'Other')
    if (!grouped[section]) grouped[section] = []
    grouped[section].push(img)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Site Images</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all images used across the site — hero banners, category banners, story images, and more</p>
        </div>
        <div className="flex items-center gap-2">
          {images.length === 0 && (
            <button onClick={seedDefaults} disabled={seeding}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
              <RefreshCw size={16} className={seeding ? 'animate-spin' : ''} />
              {seeding ? 'Seeding...' : 'Load Default Images'}
            </button>
          )}
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg text-gray-500 mb-2">No site images configured</p>
          <p className="text-sm text-gray-400 mb-6">Click "Load Default Images" above to populate all default site images.</p>
          <button onClick={seedDefaults} disabled={seeding}
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
            <RefreshCw size={16} className={seeding ? 'animate-spin' : ''} />
            {seeding ? 'Loading...' : 'Load Default Images'}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([section, sectionImages]) => {
            if (sectionImages.length === 0) return null
            return (
              <div key={section}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">{section}</h2>
                <div className="space-y-3">
                  {sectionImages.map(img => (
                    <ImageCard
                      key={img.id}
                      image={img}
                      uploading={uploading[img.id]}
                      saved={saved[img.id]}
                      onUpload={(file) => handleImageUpload(img, file)}
                      onUrlUpdate={(url) => handleUrlUpdate(img, url)}
                      onLabelUpdate={(label) => handleLabelUpdate(img, label)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ImageCard({ image, uploading, saved, onUpload, onUrlUpdate, onLabelUpdate }) {
  const [editingLabel, setEditingLabel] = useState(false)
  const [labelInput, setLabelInput] = useState(image.label)
  const [urlInput, setUrlInput] = useState(image.image_url || '')
  const [showUrlInput, setShowUrlInput] = useState(!image.image_url)
  const hasImage = image.image_url && image.image_url.startsWith('http')

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-64 h-40 bg-gray-100 flex-shrink-0 relative overflow-hidden">
          {hasImage ? (
            <img src={image.image_url} alt={image.label} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {saved && (
            <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
              <Check size={32} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 p-4">
          <div>
            {editingLabel ? (
              <div className="flex gap-2 mb-1">
                <input value={labelInput} onChange={e => setLabelInput(e.target.value)}
                  className="flex-1 border rounded-lg px-2 py-1 text-sm" />
                <button onClick={() => { onLabelUpdate(labelInput); setEditingLabel(false) }}
                  className="bg-black text-white px-2 py-1 rounded-lg text-xs font-medium">Save</button>
                <button onClick={() => setEditingLabel(false)} className="text-xs text-gray-400">Cancel</button>
              </div>
            ) : (
              <h3 className="font-semibold text-sm cursor-pointer hover:text-blue-600" onClick={() => setEditingLabel(true)}>
                {image.label} <span className="text-gray-300 text-xs ml-1">✎</span>
              </h3>
            )}
            <p className="text-xs text-gray-400 mt-0.5">Key: <code className="bg-gray-100 px-1 rounded">{image.key}</code></p>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer transition text-sm">
                <Upload size={14} />
                <span>Upload File</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => onUpload(e.target.files[0])} />
              </label>
              <button onClick={() => setShowUrlInput(!showUrlInput)} className="text-xs text-blue-600 hover:underline">
                {showUrlInput ? 'Hide' : 'Paste URL'}
              </button>
            </div>

            {showUrlInput && (
              <div className="flex gap-2">
                <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-1.5 text-xs" placeholder="https://images.unsplash.com/..." />
                <button onClick={() => { onUrlUpdate(urlInput); setShowUrlInput(false) }}
                  className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800">Save</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
