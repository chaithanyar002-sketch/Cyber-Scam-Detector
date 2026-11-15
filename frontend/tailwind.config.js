export default { content: ["./index.html", "./src/**/*.{js,jsx}"], theme: { extend: {
  colors: { neon: "#22d3ee", violet: "#8b5cf6" },
  keyframes: { fadeUp: { "0%": { opacity: 0, transform: "translateY(12px)" }, "100%": { opacity: 1, transform: "none" } } },
  animation: { fadeUp: "fadeUp .5s ease both" } } }, plugins: [] };
