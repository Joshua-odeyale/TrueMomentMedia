# Videos

This folder is for your **own licensed video files**.

The portfolio currently uses short, publicly hosted sample clips (Google's
sample video bucket) purely as placeholders so the video modal works out of
the box. They are **not** TrueMoment Media projects.

## How to use your own videos

1. Export your films as web-friendly **MP4 (H.264 + AAC)**.
   - 1080p is a good balance of quality and size.
   - Keep preview clips short (15–60 seconds) for fast loading.
   - Compress with HandBrake or FFmpeg, e.g.:
     `ffmpeg -i input.mov -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k output.mp4`
2. Drop the `.mp4` files into this folder.
3. In `index.html`, find each portfolio `<article class="portfolio-item">`
   and replace its `data-video` URL, e.g.:

   ```html
   <article class="portfolio-item" data-category="weddings"
            data-title="Adaeze & Tunde"
            data-category-label="Weddings"
            data-video="assets/videos/adaeze-tunde-highlight.mp4">
   ```

4. Optionally add a `poster` attribute to the `<video id="modalVideo">` tag
   in `index.html` if you want a custom frame before playback.

You can also embed YouTube/Vimeo links instead — see the README for how to
swap the `<video>` element for an `<iframe>` in the modal.
