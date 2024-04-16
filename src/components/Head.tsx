export default function Head() {
  return (
    <>
      <style>
        {`
      .dcs-rotate {
        animation: dcsrotate 1s infinite cubic-bezier(0.46, 0.03, 0.52, 0.96);
      }

      @keyframes dcsrotate {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(359deg);
        }
      }
    `}
      </style>
    </>
  );
}
