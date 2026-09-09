"use client";
import { useI18n } from "@/i18n/use-i18n";

import { useEffect, useState } from "react";
import {
  Expand,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { ProductImage as ImageType } from "@/lib/types";
import { ProductImage } from "./ui";
import { Modal } from "./modal";
import { faNumber, brandImageSource } from "@/lib/format";
export function ProductGallery({
  images,
  name,
  sample,
}: {
  images: ImageType[];
  name: string;
  sample: boolean;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const [index, setIndex] = useState(0),
    [fullscreen, setFullscreen] = useState(false),
    [zoom, setZoom] = useState(false);
  const image = images[index] || images[0];
  useEffect(() => {
    if (!fullscreen) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const forward =
          e.key === (locale === "en" ? "ArrowRight" : "ArrowLeft");
        setIndex(
          (v) => (v + (forward ? 1 : images.length - 1)) % images.length,
        );
        setZoom(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [fullscreen, images.length, locale]);
  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <ProductImage
          src={image.url}
          alt={tr(image.alt)}
          eager
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <button
          className="icon-button gallery-expand"
          aria-label={tr("بزرگ‌نمایی تصویر {v0}", { v0: tr(name) })}
          onClick={() => {
            setZoom(false);
            setFullscreen(true);
          }}
        >
          <Expand size={21} />
        </button>
        <span className="gallery-index" dir="ltr">
          {tr(String(index + 1).padStart(2, "0"))} /{" "}
          {tr(String(images.length).padStart(2, "0"))}
        </span>
        {sample && <span className="gallery-sample">{tr("تصویر نمونه")}</span>}
      </div>
      <div className="gallery-bottom">
        <div className="gallery-thumbnails">
          {images.map((im, i) => (
            <button
              key={im.url}
              className={i === index ? "active" : ""}
              aria-label={tr("تصویر {v0}: {v1}", {
                v0: tr(fmtNumber(i + 1)),
                v1: tr(im.alt),
              })}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              <ProductImage src={im.url} alt="" sizes="80px" />
            </button>
          ))}
        </div>
        <span>
          {tr("جزئیات را از نزدیک ببینید.")}
          <br />
          <button
            onClick={() => {
              setZoom(false);
              setFullscreen(true);
            }}
          >
            {tr("نمایش تمام‌صفحه")}
            <Expand size={12} />
          </button>
        </span>
      </div>
      <Modal
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title={tr(name)}
        className="gallery-modal"
      >
        {fullscreen && (
          <>
            <div className={`gallery-fullscreen ${zoom ? "zoomed" : ""}`}>
              <button
                className="icon-button gallery-prev"
                aria-label={tr("تصویر قبلی")}
                onClick={() => {
                  setIndex((v) => (v + images.length - 1) % images.length);
                  setZoom(false);
                }}
              >
                <ChevronRight size={24} />
              </button>
              <div className="zoom-image-stage">
                <button
                  className="zoom-image-button"
                  onClick={() => setZoom((v) => !v)}
                  aria-label={tr(
                    zoom ? tr("کوچک کردن تصویر") : tr("بزرگ کردن تصویر"),
                  )}
                >
                  <img
                    src={brandImageSource(image.url)}
                    alt={tr(image.alt)}
                    width={1200}
                    height={1200}
                  />
                </button>
              </div>
              <button
                className="icon-button gallery-next"
                aria-label={tr("تصویر بعدی")}
                onClick={() => {
                  setIndex((v) => (v + 1) % images.length);
                  setZoom(false);
                }}
              >
                <ChevronLeft size={24} />
              </button>
            </div>
            <div className="gallery-fullscreen-footer">
              <span>
                {fmtNumber(index + 1)}
                {tr(" از ")}
                {fmtNumber(images.length)} — {tr(image.alt)}
              </span>
              <button
                className="button secondary small"
                onClick={() => setZoom((v) => !v)}
              >
                {zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}{" "}
                {tr(zoom ? tr("اندازه اصلی") : tr("بزرگ‌نمایی"))}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
export function ProductTabs() {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const [active, setActive] = useState("overview");
  const tabs = [
    ["overview", tr("معرفی محصول")],
    ["specifications", tr("مشخصات فنی")],
    ["applications", tr("کاربرد و سازگاری")],
    ["documents", tr("اسناد و ضمانت")],
    ["faq", tr("پرسش‌های متداول")],
  ];
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    tabs.forEach(([id]) => {
      const e = document.getElementById(id);
      if (e) observer.observe(e);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <nav className="product-tabs" aria-label={tr("بخش‌های اطلاعات محصول")}>
      {tabs.map(([id, label]) => (
        <a
          className={active === id ? "active" : ""}
          href={"#" + id}
          key={id}
          aria-current={active === id ? "location" : undefined}
          onClick={() => setActive(id)}
        >
          {tr(label)}
        </a>
      ))}
    </nav>
  );
}
