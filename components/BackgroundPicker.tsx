"use client";

export type BackgroundOption = {
  id: string;
  label: string;
  thumb: string;
  full: string;
};

const OPTIONS: Record<"midnight" | "royal-gold", BackgroundOption[]> = {
  midnight: [
    {
      id: "midnight-1",
      label: "Gece Bahçesi",
      thumb: "/templates/midnight-thumb.jpg",
      full: "/templates/midnight-bg.jpg",
    },
    {
      id: "midnight-2",
      label: "Karanlık Güller",
      thumb: "/templates/midnight-2-thumb.jpg",
      full: "/templates/midnight-2.jpg",
    },
    {
      id: "midnight-3",
      label: "Bokeh Işıklar",
      thumb: "/templates/midnight-3-thumb.jpg",
      full: "/templates/midnight-3.jpg",
    },
  ],
  "royal-gold": [
    {
      id: "royal-gold-1",
      label: "Mumlu Salon",
      thumb: "/templates/royal-gold-thumb.jpg",
      full: "/templates/royal-gold-bg.jpg",
    },
    {
      id: "royal-gold-2",
      label: "Bahçe Gazebo",
      thumb: "/templates/royal-gold-2-thumb.jpg",
      full: "/templates/royal-gold-2.jpg",
    },
    {
      id: "royal-gold-3",
      label: "Altın Mürekkep",
      thumb: "/templates/royal-gold-3-thumb.jpg",
      full: "/templates/royal-gold-3.jpg",
    },
  ],
};

export function getBackgroundPath(template: string, backgroundImage: string | null): string {
  const key = template === "midnight" ? "midnight" : "royal-gold";
  const options = OPTIONS[key];
  const found = options.find((o) => o.id === backgroundImage);
  return (found ?? options[0]).full;
}

export default function BackgroundPicker({
  template,
  value,
  onChange,
}: {
  template: "midnight" | "royal-gold";
  value: string | null;
  onChange: (id: string) => void;
}) {
  const options = OPTIONS[template];
  const selected = value ?? options[0].id;

  return (
    <div className="bg-picker">
      <p className="bg-picker__label">Arka plan fotoğrafı</p>
      <div className="bg-picker__grid">
        {options.map((opt) => (
          <button
            type="button"
            key={opt.id}
            className={`bg-picker__item ${selected === opt.id ? "bg-picker__item--selected" : ""}`}
            onClick={() => onChange(opt.id)}
            style={{ backgroundImage: `url(${opt.thumb})` }}
          >
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
