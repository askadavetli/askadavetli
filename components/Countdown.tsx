"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown({
  eventDate,
  eventTime,
}: {
  eventDate: string;
  eventTime: string | null;
}) {
  const target = new Date(`${eventDate}T${eventTime || "00:00"}:00`);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft(target));

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDate, eventTime]);

  if (!mounted) return null;

  if (!timeLeft) {
    return <p className="countdown countdown--today">Bugün! 🎉</p>;
  }

  return (
    <div className="countdown">
      <div className="countdown__item">
        <span className="countdown__number">{timeLeft.days}</span>
        <span className="countdown__label">gün</span>
      </div>
      <div className="countdown__item">
        <span className="countdown__number">{timeLeft.hours}</span>
        <span className="countdown__label">saat</span>
      </div>
      <div className="countdown__item">
        <span className="countdown__number">{timeLeft.minutes}</span>
        <span className="countdown__label">dakika</span>
      </div>
      <div className="countdown__item">
        <span className="countdown__number">{timeLeft.seconds}</span>
        <span className="countdown__label">saniye</span>
      </div>
    </div>
  );
}
