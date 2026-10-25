import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the Aurora sparkle on the brand gradient. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5b8def, #3a6ad0)",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 32 32">
          <path
            fill="#fff"
            d="M15.3 6.9a.7.7 0 0 1 1.4 0l1 5.2a2 2 0 0 0 1.6 1.6l5.2 1a.7.7 0 0 1 0 1.4l-5.2 1a2 2 0 0 0-1.6 1.6l-1 5.2a.7.7 0 0 1-1.4 0l-1-5.2a2 2 0 0 0-1.6-1.6l-5.2-1a.7.7 0 0 1 0-1.4l5.2-1a2 2 0 0 0 1.6-1.6z"
          />
        </svg>
      </div>
    ),
    size
  );
}
