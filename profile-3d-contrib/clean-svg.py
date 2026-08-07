import os
import xml.etree.ElementTree as ET

# Register SVGs namespace to prevent outputting ns0: prefixes
ET.register_namespace('', 'http://www.w3.org/2000/svg')

folder = 'profile-3d-contrib'

if os.path.exists(folder):
    for filename in os.listdir(folder):
        if filename.endswith('.svg'):
            filepath = os.path.join(folder, filename)
            try:
                tree = ET.parse(filepath)
                root = tree.getroot()
                
                # Find all top-level <g> tags
                g_elements = [child for child in root if child.tag.endswith('g')]
                
                to_remove = []
                
                # Double-safe removal: by index and by content verification
                for idx, g in enumerate(g_elements):
                    xml_str = ET.tostring(g, encoding='utf-8').decode('utf-8')
                    
                    # Radar chart is usually index 1 and contains "Commit"
                    if idx == 1 or 'Commit' in xml_str or 'PullReq' in xml_str:
                        to_remove.append(g)
                        
                    # Language chart is usually index 2 and contains language tags
                    elif idx == 2 or any(lang in xml_str for lang in ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Node', 'Vite']):
                        to_remove.append(g)
                
                # Remove the identified groups
                for g in to_remove:
                    if g in root:
                        root.remove(g)
                
                # Write back the modified SVG
                tree.write(filepath, encoding='utf-8', xml_declaration=True)
                print(f"Successfully cleaned: {filename}")
            except Exception as e:
                print(f"Error cleaning {filename}: {e}")
else:
    print(f"Folder {folder} not found.")
