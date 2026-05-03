import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0908',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="120"
          height="150"
          viewBox="0 0 80 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M44 4 C48 16, 60 26, 66 40 C72 56, 70 76, 56 88 C46 96, 30 96, 20 86 C10 74, 10 56, 18 42 C24 30, 32 22, 38 12 C40 8, 42 6, 44 4 Z"
            fill="#E8551C"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
