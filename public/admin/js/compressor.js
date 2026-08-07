/**
 * compressor.js - Premium Client-Side Image Compression & Upload Utility
 * Resizes and compresses images using browser Canvas API to keep page loads fast and minimize storage size.
 */

window.compressAndUpload = function (file, options = {}, onStart, onProgress, onSuccess, onError) {
  const defaults = {
    maxWidth: 1200,
    maxHeight: 900,
    quality: 0.75,
    category: 'gallery'
  };
  const settings = Object.assign({}, defaults, options);

  // Apply predefined dimension constraints based on asset category
  if (settings.category === 'logo') {
    settings.maxWidth = 300;
    settings.maxHeight = 300;
    settings.quality = 0.8;
  } else if (settings.category === 'banner') {
    settings.maxWidth = 1200;
    settings.maxHeight = 400;
    settings.quality = 0.75;
  } else if (settings.category === 'blog') {
    settings.maxWidth = 800;
    settings.maxHeight = 500;
    settings.quality = 0.75;
  }

  if (onStart) onStart();

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (event) {
    const img = new Image();
    img.src = event.target.result;
    img.onload = function () {
      // Calculate optimized dimensions
      let width = img.width;
      let height = img.height;

      if (width > settings.maxWidth || height > settings.maxHeight) {
        const ratio = Math.min(settings.maxWidth / width, settings.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Draw to offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed WebP data URL
      // Fallback to image/jpeg if webp encoding is not supported in old browsers
      let compressedDataUrl;
      try {
        compressedDataUrl = canvas.toDataURL('image/webp', settings.quality);
      } catch (e) {
        compressedDataUrl = canvas.toDataURL('image/jpeg', settings.quality);
      }

      if (onProgress) onProgress(50); // Simulating compression complete

      // Send via AJAX fetch to the backend upload endpoint
      fetch('/admin/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: compressedDataUrl,
          name: file.name
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (onProgress) onProgress(100);
          if (onSuccess) onSuccess(data.url);
        } else {
          if (onError) onError(data.message || 'Upload failed.');
        }
      })
      .catch(err => {
        if (onError) onError(err.message || 'Network upload error.');
      });
    };
    img.onerror = function () {
      if (onError) onError('Failed to load image file.');
    };
  };
  reader.onerror = function () {
    if (onError) onError('Failed to read local file.');
  };
};

/**
 * Automatically binds file upload widget behaviors to a form input group
 */
window.setupImageUpload = function (fileInputId, hiddenUrlInputId, previewImgId, progressId, category) {
  const fileInput = document.getElementById(fileInputId);
  const hiddenInput = document.getElementById(hiddenUrlInputId);
  const previewImg = document.getElementById(previewImgId);
  const progressBar = document.getElementById(progressId);

  if (!fileInput) return;

  fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    // Direct client compression and upload flow
    window.compressAndUpload(
      file,
      { category: category },
      // onStart
      () => {
        if (progressBar) {
          progressBar.classList.remove('hidden');
          progressBar.style.width = '15%';
          progressBar.textContent = 'Compressing...';
        }
        fileInput.disabled = true;
      },
      // onProgress
      (percent) => {
        if (progressBar) {
          progressBar.style.width = percent + '%';
          if (percent === 100) {
            progressBar.textContent = 'Upload Complete!';
          } else {
            progressBar.textContent = 'Uploading...';
          }
        }
      },
      // onSuccess
      (url) => {
        if (hiddenInput) hiddenInput.value = url;
        if (previewImg) {
          previewImg.src = url;
          previewImg.classList.remove('hidden');
        }
        fileInput.disabled = false;
        setTimeout(() => {
          if (progressBar) progressBar.classList.add('hidden');
        }, 3000);
      },
      // onError
      (errMsg) => {
        alert('Upload Error: ' + errMsg);
        fileInput.disabled = false;
        if (progressBar) {
          progressBar.classList.add('hidden');
        }
      }
    );
  });
};
