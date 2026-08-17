"use client";

import { useState } from "react";
import { VariantLightbox } from "@/components/VariantLightbox";

interface Props {
  src: string;
  alt: string;
  /** Texto mostrado en el lightbox. Por defecto usa `alt`. */
  label?: string;
  className?: string;
  /** Clases del contenedor (el botón de lupa se posiciona sobre él). */
  wrapperClassName?: string;
}

export function ZoomableImage({
  src,
  alt,
  label,
  className,
  wrapperClassName,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`group relative ${wrapperClassName ?? ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={className}
          onClick={() => setOpen(true)}
          style={{ cursor: "zoom-in" }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          aria-label={`Ver ${label ?? alt} en grande`}
          className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 focus:opacity-100"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
      </div>

      {open && (
        <VariantLightbox
          imageUrl={src}
          label={label ?? alt}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
