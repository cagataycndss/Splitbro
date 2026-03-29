const fs = require('fs');
const path = 'splitbro-frontend/src/pages/GroupDetail.jsx';
let content = fs.readFileSync(path, 'utf-8');

// Add delete button after Bölüştür button closing
const oldStr = `                                )}
                              </div>
                          </div>
                       ))}`;

const newStr = `                                )}
                                <button onClick={(e) => handleDeleteExpense(e, expense._id)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }} title="Sil"><Trash2 size={16} /></button>
                              </div>
                          </div>
                       ))}`;

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync(path, content, 'utf-8');
  console.log('SUCCESS: Delete button added to expense cards');
} else {
  // Try with \r\n
  const oldStrCRLF = oldStr.replace(/\n/g, '\r\n');
  const newStrCRLF = newStr.replace(/\n/g, '\r\n');
  if (content.includes(oldStrCRLF)) {
    content = content.replace(oldStrCRLF, newStrCRLF);
    fs.writeFileSync(path, content, 'utf-8');
    console.log('SUCCESS (CRLF): Delete button added to expense cards');
  } else {
    console.log('FAILED: Could not find target string');
    // Debug: find the nearby text
    const idx = content.indexOf('openQuickSplit');
    if (idx > 0) {
      console.log('Context around openQuickSplit:', JSON.stringify(content.substring(idx + 50, idx + 300)));
    }
  }
}
