import glob

for filepath in glob.glob("*.html"):
    with open(filepath, "r") as f:
        content = f.read()

    idx = content.find("OCTYPE html>")
    if idx != -1:
        # Since 'OCTYPE html>' starts at `content[3:]`, it means the file was duplicated.
        # Let's slice it right before "OCTYPE html>"
        # But wait, did I lose the end of the first file?
        # The script did: new_content = content[:start_idx] + replacement_block + content[end_idx:]
        # So content[:start_idx] is fine. replacement_block is:
        # """                premiumElements.forEach(el => {
        # ...
        #                });"""
        # Then instead of the original ending, I inserted `content[3:]` (the whole file from OCTYPE).
        # Which means the original ending (which was simply:
        #            }
        #        });
        #    </script>
        # </body>
        # </html> 
        # ) was lost.
        # I can just rebuild the end of the file from what I know.
        repaired = content[:idx] + """           }
        });
    </script>
</body>
</html>
"""
        with open(filepath, "w") as f:
            f.write(repaired)
        print(f"Repaired {filepath}")

