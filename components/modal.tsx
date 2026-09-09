"use client";
import { useI18n } from "@/i18n/use-i18n";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      const previous = document.activeElement as HTMLElement | null;
      d.showModal();
      const old = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        d.close();
        document.body.style.overflow = old;
        previous?.focus();
      };
    } else d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-label={tr(title)}
      onCancel={(e) => {
        e.preventDefault();
        closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === ref.current) closeRef.current();
      }}
    >
      <div className="modal-surface">
        <div className="modal-head">
          <h2>{tr(title)}</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label={tr("بستن")}
          >
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
