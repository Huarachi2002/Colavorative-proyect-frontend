"use client";

import Image from "next/image";

interface SketchPreviewProps {
  imageUrl: string;
}

export function SketchPreview({ imageUrl }: SketchPreviewProps) {
  return (
    <div className='relative aspect-video overflow-hidden rounded-lg border bg-gray-50'>
      <Image
        src={imageUrl}
        alt='Vista previa del boceto'
        fill
        className='object-contain'
      />
    </div>
  );
}
