import os
import glob

html_files = glob.glob('/Users/alejandracastro/Desktop/NEXUS/*.html')

pwa_code = """
  <!-- PWA Setup -->
  <link rel="manifest" href="/manifest.json">
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  </script>
"""

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if pwa_code.strip().split('\\n')[0] in content or 'rel="manifest"' in content:
        continue
        
    new_content = content.replace('</head>', pwa_code + '</head>')
    
    # In case <head> tag was uppercase or missing
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Added PWA to {os.path.basename(filepath)}")
    else:
        print(f"Skipped {os.path.basename(filepath)} - no </head> found")

print("Done.")
