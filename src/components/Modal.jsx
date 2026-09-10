import { useEffect, useRef } from "react";

/**
 * Modal générique réutilisable (fond assombri + carte centrée).
 * Ferme au clic sur le fond ou sur le bouton "X".
 *
 * Autofocus : cherche le premier champ focusable dans le contenu (children)
 * au montage et lui donne le focus, sans rien changer aux formulaires
 * qui utilisent cette Modal.
 *
 * v2 -- remplace le setTimeout(50ms) par un double requestAnimationFrame :
 * le setTimeout à durée fixe peut tenter le focus avant que le navigateur
 * ait fini de peindre la modal (surtout si une transition/animation CSS
 * est en cours), ce qui fait échouer .focus() silencieusement sur
 * certains navigateurs. requestAnimationFrame x2 garantit qu'on attend
 * bien la frame suivant le premier paint avant d'agir.
 */
export default function Modal({ title, onClose, children }) {
  const contentRef = useRef(null);

  useEffect(() => {
    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const focusable = contentRef.current?.querySelector(
          "input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled])"
        );
        focusable?.focus();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col rounded-2xl bg-white shadow-xl
                   ring-1 ring-[#bdc9c1]"
        style={{
          maxHeight: "calc(100vh - 6rem - env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex shrink-0 items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-[#141e1a]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-full
                       text-[#6e7a72] transition hover:bg-[#ebf6ef] hover:text-[#141e1a]"
          >
            ✕
          </button>
        </div>
        <div ref={contentRef} className="min-h-0 overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}