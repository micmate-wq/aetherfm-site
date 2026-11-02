# QR code → https://aetherfm.xyz/

- `aetherfm-qr.svg`: on-brand ink on cream, for screens and slides.
- `aetherfm-qr-print.svg`: pure black on white, for print (vector, so it scales to any size).
- `aetherfm-qr-1200.png`: black on white raster, for tools that won't take SVG.

QR version 3, error correction H, 4-module quiet zone. Keep the white margin when placing it.

Tested by decoding with OpenCV: the screen sizes 300, 200, 120, 90 and 72px all decode, and so do camera simulations (blur, noise, slight tilt) of 3cm, 5cm and A5 prints. A 2cm print failed.
**Print it at least 3cm wide.** Before printing in bulk, do one real phone-camera scan of a test print.
