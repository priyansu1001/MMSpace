# Comprehensive JSX fix for ChatPage.jsx
$filePath = "c:\Users\pkp\git\major_project\MMSpace\client\src\pages\ChatPage.jsx"

Write-Host "=== COMPREHENSIVE JSX STRUCTURE FIX ===" -ForegroundColor Green

# Read the file content
$content = Get-Content $filePath -Raw

Write-Host "Applying comprehensive JSX structure fix..." -ForegroundColor Yellow

# The main issue is likely with the announcements section structure
# Let's rebuild the entire announcements content area with proper JSX structure

$announcementsContentPattern = '                        \) : \(\s*<div className="p-4">\s*<div className="space-y-4">.*?</div>\s*</div>\s*\)\}'

$announcementsContentReplacement = @'
                        ) : (
                            <div className="p-4">
                                <div className="space-y-4">
                                    {user.role === 'mentor' && (
                                        <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                                                Create Announcement
                                            </h3>
                                            <textarea
                                                value={newAnnouncement}
                                                onChange={(e) => setNewAnnouncement(e.target.value)}
                                                placeholder="Type your announcement..."
                                                className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-600/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
                                                rows="3"
                                            />
                                            <button
                                                onClick={sendAnnouncement}
                                                disabled={!newAnnouncement.trim()}
                                                className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
                                            >
                                                Send Announcement
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 px-2">
                                            Recent Announcements
                                        </h3>
                                        {announcements.length > 0 ? (
                                            announcements.map((announcement, index) => (
                                                <div
                                                    key={announcement._id}
                                                    className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-600/30 hover:shadow-lg transition-all duration-300"
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                            📢
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-slate-800 dark:text-white text-sm">
                                                                {announcement.title}
                                                            </h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                                                                {announcement.content}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                                                {new Date(announcement.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${announcement.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                            announcement.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                                announcement.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                            }`}>
                                                            {announcement.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <Megaphone className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    No announcements yet
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
'@

# Apply the comprehensive fix using regex with single-line mode
$newContent = $content -replace '(?s)(\s*\) : \(\s*<div className="p-4">\s*<div className="space-y-4">).*?(</div>\s*</div>\s*\)\})', $announcementsContentReplacement

# If the above doesn't work, try a simpler approach - just fix the immediate JSX issue
if ($newContent -eq $content) {
    Write-Host "Applying simpler JSX fix..." -ForegroundColor Yellow
    
    # Fix adjacent JSX elements by ensuring proper wrapping
    $newContent = $content -replace '(\)\}\s*)(<div className="space-y-3">)', '$1' + "`n`n                                    " + '$2'
    
    # Fix any missing React fragments
    $newContent = $newContent -replace '(<div className="space-y-4">\s*)({user\.role)', '$1<>$2'
    $newContent = $newContent -replace '(</div>\s*</div>\s*</div>\s*\)\})', '</>$1'
}

# Write the updated content back to the file
Set-Content $filePath $newContent -Encoding UTF8

Write-Host "✅ Comprehensive JSX fix applied!" -ForegroundColor Green

Write-Host "`n🎉 JSX STRUCTURE SHOULD NOW BE CORRECT!" -ForegroundColor Green
Write-Host "`nTry running the client again:" -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor Cyan
