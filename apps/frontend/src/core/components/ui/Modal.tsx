'use client';

import { useEffect, useId, useRef, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/core/components/ui/button';

type Props = PropsWithChildren<{
  closeLabel: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}>;

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal = ({ children, closeLabel, description, isOpen, onClose, title }: Props) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement = document.activeElement;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    const previousRootOverscrollBehavior = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements.item(0);
      const lastElement = focusableElements.item(focusableElements.length - 1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      document.documentElement.style.overscrollBehavior = previousRootOverscrollBehavior;
      document.removeEventListener('keydown', handleKeyDown);

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-card shadow-xl outline-none"
        tabIndex={-1}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b px-6 py-6 sm:px-8 sm:py-8">
          <div>
            <h2 id={titleId} className="text-xl font-semibold tracking-tight">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label={closeLabel}>
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </Button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-6 pt-6 pb-6 sm:px-8 sm:pb-8">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
