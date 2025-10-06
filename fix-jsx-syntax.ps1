# PowerShell script to fix JSX syntax errors in ChatPage.jsx
$filePath = "c:\Users\pkp\git\major_project\MMSpace\client\src\pages\ChatPage.jsx"

Write-Host "=== FIXING JSX SYNTAX ERRORS ===" -ForegroundColor Green
Write-Host "File: $filePath" -ForegroundColor Yellow

# Read the file content
$content = Get-Content $filePath -Raw

Write-Host "`nAnalyzing JSX structure around line 495..." -ForegroundColor Yellow

# The issue is likely with the announcements content area structure
# We need to ensure proper JSX fragment wrapping

# Fix 1: Ensure the announcements content is properly wrapped
$problematicPattern1 = '                                    {user\.role === ''mentor'' && \(\s*<div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">\s*<h3 className="font-semibold text-slate-800 dark:text-white mb-3">\s*Create Announcement\s*</h3>'

$fixedPattern1 = '                                    {user.role === ''mentor'' && (
                                        <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                                                Create Announcement
                                            </h3>'

# Fix 2: Ensure proper closing of the mentor check
$problematicPattern2 = '                                            </button>\s*</div>\s*\)\}\s*<div className="space-y-3">'

$fixedPattern2 = '                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-3">'

# Fix 3: Wrap the entire announcements content in a fragment if needed
$announcementsContentStart = '                        ) : (
                            <div className="p-4">
                                <div className="space-y-4">'

$announcementsContentStartFixed = '                        ) : (
                            <div className="p-4">
                                <div className="space-y-4">
                                    <>'

$announcementsContentEnd = '                                </div>
                            </div>
                        )}'

$announcementsContentEndFixed = '                                    </>
                                </div>
                            </div>
                        )}'

Write-Host "Applying JSX syntax fixes..." -ForegroundColor Green

# Apply the fixes
$newContent = $content -replace $problematicPattern1, $fixedPattern1
$newContent = $newContent -replace $problematicPattern2, $fixedPattern2

# Alternative approach: Fix the specific JSX structure issue
# Look for adjacent JSX elements and wrap them properly

# Find the problematic area around announcements
$adjacentJSXPattern = '(\s*\)\}\s*)(\s*<div className="space-y-3">)'
$adjacentJSXFix = '$1' + "`n`n" + '$2'

$newContent = $newContent -replace $adjacentJSXPattern, $adjacentJSXFix

# Ensure proper React Fragment syntax if needed
$fragmentPattern = '<>\s*{user\.role === ''mentor'''
$fragmentFix = '<>{user.role === ''mentor'''

$newContent = $newContent -replace $fragmentPattern, $fragmentFix

Write-Host "Checking for common JSX issues..." -ForegroundColor Yellow

# Fix any double closing tags or missing opening tags
$doubleClosingPattern = '\)\}\s*\)\}'
$doubleClosingFix = ')}'

$newContent = $newContent -replace $doubleClosingPattern, $doubleClosingFix

# Write the updated content back to the file
Set-Content $filePath $newContent -Encoding UTF8

Write-Host "✅ JSX syntax fixes applied!" -ForegroundColor Green

# Verify the fix by checking the structure around line 495
Write-Host "`nVerifying fix around line 495..." -ForegroundColor Yellow
$lines = Get-Content $filePath
$startLine = [Math]::Max(1, 490)
$endLine = [Math]::Min($lines.Count, 505)

for ($i = $startLine; $i -le $endLine; $i++) {
    if ($i -le $lines.Count) {
        $lineContent = $lines[$i-1]
        if ($i -eq 495) {
            Write-Host "$($i): $lineContent" -ForegroundColor Red
        } else {
            Write-Host "$($i): $lineContent" -ForegroundColor Cyan
        }
    }
}

Write-Host "`n🎉 JSX SYNTAX ERRORS SHOULD BE FIXED!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Try starting the client again: npm run dev" -ForegroundColor Cyan
Write-Host "2. If there are still errors, check the console output" -ForegroundColor Cyan
Write-Host "3. The announcements functionality should now work properly" -ForegroundColor Cyan
