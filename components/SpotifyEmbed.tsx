import React from 'react';

interface SpotifyEmbedProps {
  trackId: string;
  height?: number | string;
  compact?: boolean;
}

const SpotifyEmbed: React.FC<SpotifyEmbedProps> = ({ trackId, height = 352, compact = false }) => {
  if (!trackId) return null;

  // Ensure we only have the ID, not the full URI or URL
  const cleanId = trackId.includes(':') ? trackId.split(':').pop() : trackId;

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-black/20 backdrop-blur-sm border border-white/5">
      <iframe
        src={`https://open.spotify.com/embed/track/${cleanId}?utm_source=generator&theme=0`}
        width="100%"
        height={compact ? 80 : height}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-2xl"
        title="Spotify Player"
      />
    </div>
  );
};

export default SpotifyEmbed;
