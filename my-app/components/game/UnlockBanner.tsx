interface UnlockBannerProps {
  message: string | null;
}

export function UnlockBanner({ message }: UnlockBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="unlock-banner" role="status" aria-live="polite">
      {message}
    </div>
  );
}
