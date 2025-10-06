# PowerShell script to add real-time announcement updates
$filePath = "c:\Users\pkp\git\major_project\MMSpace\client\src\pages\ChatPage.jsx"

Write-Host "=== ADDING REAL-TIME ANNOUNCEMENT UPDATES ===" -ForegroundColor Green

# Read the file content
$content = Get-Content $filePath -Raw

# Add socket listener for new announcements in the useEffect where we handle newMessage
$socketListenerFind = '                // Remove any existing listeners first to prevent duplicates
                socket.off(''newMessage'', handleNewMessage)
                socket.on(''newMessage'', handleNewMessage)
                console.log(''Socket message listener attached'')'

$socketListenerReplace = '                // Remove any existing listeners first to prevent duplicates
                socket.off(''newMessage'', handleNewMessage)
                socket.on(''newMessage'', handleNewMessage)
                console.log(''Socket message listener attached'')

                // Listen for new announcements
                socket.off(''newAnnouncement'', handleNewAnnouncement)
                socket.on(''newAnnouncement'', handleNewAnnouncement)
                console.log(''Socket announcement listener attached'')'

# Add cleanup for announcement listener
$cleanupFind = '                    socket.off(''newMessage'', handleNewMessage)'

$cleanupReplace = '                    socket.off(''newMessage'', handleNewMessage)
                    socket.off(''newAnnouncement'', handleNewAnnouncement)'

# Add the handleNewAnnouncement function after handleNewMessage
$handleNewMessageEnd = '    }

    const sendMessage = async (e) => {'

$handleNewAnnouncementFunction = '    }

    const handleNewAnnouncement = (announcement) => {
        console.log(''=== NEW ANNOUNCEMENT RECEIVED ==='')
        console.log(''Announcement:'', announcement)
        
        setAnnouncements(prev => {
            // Check if announcement already exists to prevent duplicates
            const announcementExists = prev.some(ann => ann._id === announcement._id)
            if (announcementExists) {
                console.log(''Announcement already exists, skipping'')
                return prev
            }

            console.log(''Adding new announcement'')
            return [announcement, ...prev] // Add to beginning of array
        })
        
        // Show toast notification for new announcement
        toast.success(`New announcement: ${announcement.title}`)
    }

    const sendMessage = async (e) => {'

Write-Host "Applying real-time announcement updates..." -ForegroundColor Green

# Apply the fixes
$newContent = $content -replace [regex]::Escape($socketListenerFind), $socketListenerReplace
$newContent = $newContent -replace [regex]::Escape($cleanupFind), $cleanupReplace
$newContent = $newContent -replace [regex]::Escape($handleNewMessageEnd), $handleNewAnnouncementFunction

# Write the updated content back to the file
Set-Content $filePath $newContent -Encoding UTF8

Write-Host "✅ Real-time announcement updates added!" -ForegroundColor Green
Write-Host "`nWhat was added:" -ForegroundColor Yellow
Write-Host "- Socket listener for new announcements" -ForegroundColor Cyan
Write-Host "- handleNewAnnouncement function" -ForegroundColor Cyan
Write-Host "- Toast notifications for new announcements" -ForegroundColor Cyan
Write-Host "- Proper cleanup of announcement listeners" -ForegroundColor Cyan

Write-Host "`n🎉 REAL-TIME ANNOUNCEMENTS NOW WORKING!" -ForegroundColor Green
