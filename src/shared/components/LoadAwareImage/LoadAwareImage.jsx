import { useEffect, useRef, useState } from "react";
import { warmImage } from "../../images/imageCache";
import "./LoadAwareImage.css";

function imageHasLoaded(imageElement) {
  return Boolean(imageElement?.complete && imageElement.naturalWidth > 0);
}

function LoadAwareImage({
  src,
  alt = "",
  className = "",
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  onLoad,
  onError,
  ...props
}) {
  const imageRef = useRef(null);
  const [status, setStatus] = useState(src ? "loading" : "error");

  useEffect(() => {
    const imageElement = imageRef.current;

    if (!src) {
      setStatus("error");
      return undefined;
    }

    if (imageHasLoaded(imageElement)) {
      setStatus("loaded");
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");

    warmImage(src, { fetchPriority, decoding }).then((loaded) => {
      if (cancelled) return;

      if (loaded || imageHasLoaded(imageRef.current)) {
        setStatus("loaded");
      }
    });

    const checkComplete = window.setTimeout(() => {
      if (!cancelled && imageHasLoaded(imageRef.current)) {
        setStatus("loaded");
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(checkComplete);
    };
  }, [src, fetchPriority, decoding]);

  if (!src) return null;

  return (
    <img
      {...props}
      ref={imageRef}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      className={`hs-load-aware-image ${status === "loaded" ? "is-loaded" : "is-loading"} ${status === "error" ? "is-error" : ""} ${className}`.trim()}
      onLoad={(event) => {
        setStatus("loaded");
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus("error");
        onError?.(event);
      }}
    />
  );
}

export default LoadAwareImage;
