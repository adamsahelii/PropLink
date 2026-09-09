import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoCloudUploadOutline, IoCloseOutline, IoStarSharp,
  IoStarOutline, IoAlertCircleOutline,
} from 'react-icons/io5'
import { uploadListingImages } from '../../utils/api'

// Mirrors the limits enforced in server/middleware/upload.js
export const MAX_IMAGES = 10
const MAX_FILE_MB = 5
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif'

/**
 * Uploads photos to the server (which forwards them to Cloudinary) and hands
 * the resulting { url, publicId } references back to the form.
 *
 * Nothing is faked: if the server has no Cloudinary configuration it returns
 * 503 and that message is shown as-is.
 *
 * The first image in the array is the cover — reordering is how the cover is set.
 */
export default function ImageUploader({ images, onChange, disabled }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const remaining = MAX_IMAGES - images.length

  async function handleFiles(fileList) {
    const files = Array.from(fileList || [])
    if (files.length === 0) return

    setError('')

    if (files.length > remaining) {
      setError(`You can add ${remaining} more image${remaining === 1 ? '' : 's'} (${MAX_IMAGES} max).`)
      return
    }

    const tooBig = files.find((f) => f.size > MAX_FILE_MB * 1024 * 1024)
    if (tooBig) {
      setError(`"${tooBig.name}" is larger than ${MAX_FILE_MB} MB.`)
      return
    }

    setUploading(true)
    try {
      const uploaded = await uploadListingImages(files)
      onChange([...images, ...uploaded])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = '' // allow re-picking the same file
    }
  }

  const removeAt = (i) => onChange(images.filter((_, idx) => idx !== i))

  /** Promotes an image to position 0 — the cover the cards and detail page use. */
  const makeCover = (i) => {
    if (i === 0) return
    const next = [...images]
    const [picked] = next.splice(i, 1)
    onChange([picked, ...next])
  }

  return (
    <div>
      <label className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase block mb-1.5">
        Photos
      </label>
      <p className="text-xs text-charcoal/45 mb-3 leading-relaxed">
        Up to {MAX_IMAGES} images, {MAX_FILE_MB} MB each (JPEG, PNG, WebP, GIF).
        The first photo is the cover buyers see first.
      </p>

      {/* ── Drop / pick zone ───────────────────────────────────────────── */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (!disabled && !uploading && remaining > 0) handleFiles(e.dataTransfer.files)
        }}
        className="rounded-2xl border-2 border-dashed border-black/10 bg-ivory/60 px-6 py-8 text-center transition-colors duration-200 hover:border-gold/45"
      >
        <input
          ref={inputRef}
          id="listing-images"
          type="file"
          accept={ACCEPTED}
          multiple
          className="sr-only"
          disabled={disabled || uploading || remaining <= 0}
          onChange={(e) => handleFiles(e.target.files)}
        />

        <IoCloudUploadOutline className="w-8 h-8 text-forest/30 mx-auto mb-3" aria-hidden="true" />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading || remaining <= 0}
          className="btn-gold text-[11px] py-2.5 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Uploading…
            </span>
          ) : (
            'Choose images'
          )}
        </button>

        <p className="text-xs text-charcoal/40 mt-3">
          {remaining > 0
            ? `or drag and drop — ${remaining} slot${remaining === 1 ? '' : 's'} left`
            : `Maximum of ${MAX_IMAGES} images reached`}
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <IoAlertCircleOutline className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      {/* ── Previews ───────────────────────────────────────────────────── */}
      {images.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence initial={false}>
            {images.map((img, i) => (
              <motion.li
                key={img.publicId}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-2xl overflow-hidden border border-black/[0.06] bg-white shadow-sm group"
              >
                <img src={img.url} alt="" className="w-full h-28 object-cover" />

                {i === 0 && (
                  <span className="absolute top-2 left-2 bg-gold text-white text-[9px] font-semibold tracking-widest uppercase px-2 py-1 rounded-full">
                    Cover
                  </span>
                )}

                <div className="flex items-center justify-between px-2 py-2 border-t border-black/[0.05]">
                  <button
                    type="button"
                    onClick={() => makeCover(i)}
                    disabled={i === 0}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-charcoal/50 hover:text-gold-dark disabled:text-gold disabled:cursor-default transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                    aria-label={i === 0 ? 'This is the cover image' : `Make image ${i + 1} the cover`}
                  >
                    {i === 0
                      ? <IoStarSharp className="w-3.5 h-3.5" aria-hidden="true" />
                      : <IoStarOutline className="w-3.5 h-3.5" aria-hidden="true" />}
                    {i === 0 ? 'Cover' : 'Set cover'}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-charcoal/40 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    aria-label={`Remove image ${i + 1}`}
                  >
                    <IoCloseOutline className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
