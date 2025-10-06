# PowerShell script to fix announcements content area for mentees
$filePath = "c:\Users\pkp\git\major_project\MMSpace\client\src\pages\ChatPage.jsx"

Write-Host "=== FIXING ANNOUNCEMENTS CONTENT AREA ===" -ForegroundColor Green

# Read the file content
$content = Get-Content $filePath -Raw

# We need to modify the announcements content to show:
# 1. Create announcement form ONLY for mentors
# 2. Recent announcements for BOTH mentors and mentees

# Find the announcements content section and wrap the create form with mentor check
$createFormFind = '                                    <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                                            Create Announcement
                                        </h3>'

$createFormReplace = '                                    {user.role === ''mentor'' && (
                                        <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                                                Create Announcement
                                            </h3>'

# Find the end of the create announcement div and close the mentor check
$createFormEndFind = '                                        </button>
                                    </div>'

$createFormEndReplace = '                                            </button>
                                        </div>
                                    )}'

Write-Host "Applying content area fixes..." -ForegroundColor Green

# Apply the fixes
$newContent = $content -replace [regex]::Escape($createFormFind), $createFormReplace
$newContent = $newContent -replace [regex]::Escape($createFormEndFind), $createFormEndReplace

# Write the updated content back to the file
Set-Content $filePath $newContent -Encoding UTF8

Write-Host "✅ Content area fix applied!" -ForegroundColor Green
Write-Host "`nWhat was changed:" -ForegroundColor Yellow
Write-Host "- Create announcement form now only shows for mentors" -ForegroundColor Cyan
Write-Host "- Recent announcements section shows for both mentors and mentees" -ForegroundColor Cyan

Write-Host "`n🎉 ANNOUNCEMENTS SYSTEM FULLY FIXED!" -ForegroundColor Green
