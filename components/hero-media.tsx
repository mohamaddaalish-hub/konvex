/** High-priority AVIF with a WebP fallback; dimensions reserve the same hero layout. */
export function HeroMedia({ alt }: { alt: string }) {
  const sizes =
    "(max-width: 768px) calc(100vw - 32px), (max-width: 1392px) calc(50vw - 32px), 670px";
  const avif =
    "/images/green/hero-small.avif 400w, /images/green/hero-medium.avif 800w, /images/green/hero.avif 1264w";
  return (
    <>
      <link
        rel="preload"
        as="image"
        type="image/avif"
        imageSrcSet={avif}
        imageSizes={sizes}
        fetchPriority="high"
      />
      <picture className="hero-picture">
        <source type="image/avif" srcSet={avif} sizes={sizes} />
        <img
          src="/images/green/hero.webp"
          srcSet="/images/green/hero-small.webp 400w, /images/green/hero-medium.webp 800w, /images/green/hero.webp 1264w"
          sizes={sizes}
          width={1264}
          height={848}
          alt={alt}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    </>
  );
}
