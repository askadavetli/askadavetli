"use client";

import { useState } from "react";

export type TemplateId = "klasik" | "midnight" | "royal-gold";

const TEMPLATES: { id: TemplateId; name: string; premium: boolean }[] = [
  { id: "klasik", name: "Klasik", premium: false },
  { id: "midnight", name: "Midnight", premium: true },
  { id: "royal-gold", name: "Royal Gold", premium: true },
];

export default function TemplatePicker({
  value,
  onChange,
  isPremium = false,
}: {
  value: string;
  onChange: (id: TemplateId) => void;
  isPremium?: boolean;
}) {
  const [premiumNotice, setPremiumNotice] = useState<string | null>(null);

  function handleClick(t: (typeof TEMPLATES)[number]) {
    if (t.premium && !isPremium) {
      setPremiumNotice(
        `${t.name} bir premium şablon. Sınırsız medya, sınırsız anı defteri ve tüm şablonlara erişmek için Premium'a geç (çok yakında).`
      );
      return;
    }
    setPremiumNotice(null);
    onChange(t.id);
  }

  return (
    <div className="template-picker">
      <div className="template-picker__grid">
        {TEMPLATES.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`template-card ${value === t.id ? "template-card--selected" : ""} ${
              t.premium && !isPremium ? "template-card--locked" : ""
            }`}
            onClick={() => handleClick(t)}
          >
            <span className={`template-swatch template-swatch--${t.id}`}>
              <span className="template-swatch__sample">A &amp; B</span>
              {t.premium && !isPremium && (
                <span className="template-swatch__lock">🔒</span>
              )}
            </span>
            <span className="template-card__name">{t.name}</span>
            <span
              className={`template-card__tag ${
                t.premium ? "template-card__tag--premium" : ""
              }`}
            >
              {t.premium ? "Premium" : "Ücretsiz"}
            </span>
          </button>
        ))}
      </div>

      {premiumNotice && <p className="template-picker__notice">{premiumNotice}</p>}
    </div>
  );
}
