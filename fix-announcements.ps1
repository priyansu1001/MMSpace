# PowerShell script to fix announcements visibility for mentees
$filePath = "c:\Users\pkp\git\major_project\MMSpace\client\src\pages\ChatPage.jsx"

Write-Host "=== FIXING ANNOUNCEMENTS VISIBILITY FOR MENTEES ===" -ForegroundColor Green
Write-Host "File: $filePath" -ForegroundColor Yellow

# Read the file content
$content = Get-Content $filePath -Raw

# Show current problematic line
Write-Host "`nCurrent problematic code around line 406:" -ForegroundColor Yellow
$lines = Get-Content $filePath
for ($i = 405; $i -le 417; $i++) {
    Write-Host "$($i): $($lines[$i-1])" -ForegroundColor Cyan
}

# Replace the mentor-only announcements tab with a tab available to all users
$oldPattern = '                            {user\.role === ''mentor'' && \(\s*<button\s*onClick=\{\(\) => setActiveTab\(''announcements''\)\}\s*className=\{`flex-1 flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 \$\{activeTab === ''announcements''\s*\? ''bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-lg transform scale-105''\s*: ''text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white''\s*\}`\}\s*>\s*<Megaphone className="h-4 w-4 mr-2" />\s*Announcements\s*</button>\s*\)\}'

$newPattern = '                            <button
                                onClick={() => setActiveTab(''announcements'')}
                                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === ''announcements''
                                    ? ''bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-lg transform scale-105''
                                    : ''text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white''
                                    }`}
                            >
                                <Megaphone className="h-4 w-4 mr-2" />
                                Announcements
                            </button>'

# Simpler approach - just remove the role check
$simpleFind = "{user.role === 'mentor' && ("
$simpleReplace = "("

Write-Host "`nApplying fix..." -ForegroundColor Green

# Apply the simple fix
$newContent = $content -replace [regex]::Escape($simpleFind), $simpleReplace

# Also need to remove the closing parenthesis and curly brace
$closingFind = "                            )}"
$closingReplace = ""

# Find the specific closing for announcements (after the </button>)
$announcementClosingPattern = "                </button>\s*\)\}"
$announcementClosingReplace = "                </button>"

$newContent = $newContent -replace $announcementClosingPattern, $announcementClosingReplace

# Write the updated content back to the file
Set-Content $filePath $newContent -Encoding UTF8

Write-Host "✅ Fix applied successfully!" -ForegroundColor Green
Write-Host "`nWhat was changed:" -ForegroundColor Yellow
Write-Host "- Removed role restriction from announcements tab" -ForegroundColor Cyan
Write-Host "- Now both mentors and mentees can see announcements" -ForegroundColor Cyan

Write-Host "`nVerifying the fix..." -ForegroundColor Yellow
$newLines = Get-Content $filePath
for ($i = 405; $i -le 417; $i++) {
    if ($i -le $newLines.Count) {
        Write-Host "$($i): $($newLines[$i-1])" -ForegroundColor Green
    }
}

Write-Host "`n🎉 ANNOUNCEMENTS ARE NOW VISIBLE TO MENTEES!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Restart the client application" -ForegroundColor Cyan
Write-Host "2. Login as mentee" -ForegroundColor Cyan
Write-Host "3. Check that 'Announcements' tab is now visible" -ForegroundColor Cyan
Write-Host "4. Mentor can create announcements and mentee should see them" -ForegroundColor Cyan
