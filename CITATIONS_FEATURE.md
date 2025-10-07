# Citations & Publications Feature for Mentors

## Overview
Mentors can now add and edit their **Citations & Publications** alongside their qualifications. This feature allows mentors to showcase their research papers, publications, and academic contributions.

---

## 🎯 Feature Highlights

- ✅ **Side-by-side Layout**: Qualifications and Citations displayed beside each other
- ✅ **Editable by Mentor**: Mentors can edit their own citations
- ✅ **Admin Control**: Admins can also manage mentor citations
- ✅ **Demo Data**: Pre-populated with sample citations for the demo account
- ✅ **Responsive Design**: Works perfectly on all screen sizes
- ✅ **Dark Mode Support**: Fully styled for both light and dark themes

---

## 📋 Changes Made

### 1. **Backend - Mentor Model** (`server/models/Mentor.js`)

Added new `citations` field to the Mentor schema:

```javascript
citations: {
    type: String,
    default: ''
}
```

**Features:**
- Stores citations as a text string
- Optional field (can be empty)
- Supports multi-line text with line breaks

---

### 2. **Backend - Mentor Routes** (`server/routes/mentorRoutes.js`)

Updated the `PUT /api/mentors/profile` endpoint to include citations:

```javascript
const { email, phone, qualifications, citations } = req.body;

// Update mentor fields
if (citations !== undefined) mentor.citations = citations;
```

**Endpoint:** `PUT /api/mentors/profile`

**Request Body:**
```json
{
  "email": "mentor@example.com",
  "phone": "+1-555-0123",
  "qualifications": "PhD in Computer Science, M.Sc in Mathematics",
  "citations": "Johnson, S. (2023). 'Advanced ML Algorithms'..."
}
```

---

### 3. **Backend - Seed Script** (`server/scripts/seed.js`)

Added sample citations for the demo mentor account:

```javascript
citations: 'Johnson, S. (2023). "Advanced Machine Learning Algorithms in Education." Journal of Educational Technology, 45(2), 123-145.

Johnson, S., & Smith, R. (2022). "Innovative Teaching Methods in Computer Science." ACM SIGCSE Bulletin, 54(1), 89-102.

Johnson, S. (2021). "Data Structures and Algorithm Design for Modern Applications." IEEE Transactions on Education, 64(3), 201-215.'
```

**Demo Account:**
- Email: `mentor@example.com`
- Password: `password123`
- Comes with 3 sample citations pre-populated

---

### 4. **Frontend - Profile Page** (`client/src/pages/ProfilePage.jsx`)

**Layout Changes:**
- Changed from single-column to **2-column grid** layout for Qualifications and Citations
- Both sections are now side-by-side on larger screens
- Stack vertically on mobile devices

**Added Citations Section:**
```jsx
{/* Citations */}
<div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
        Citations & Publications
    </h3>
    <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
        {editMode ? (
            <textarea
                value={formData.citations}
                onChange={(e) => handleInputChange('citations', e.target.value)}
                rows="6"
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-600/50 border border-slate-300 dark:border-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white resize-none"
                placeholder="Enter your citations, publications, research papers..."
            />
        ) : (
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                {profile.citations || 'No citations or publications listed'}
            </p>
        )}
    </div>
</div>
```

**Features:**
- 6-row textarea in edit mode
- Preserves line breaks with `whitespace-pre-line`
- Smaller text size for better readability
- Placeholder text for guidance
- Empty state message when no citations exist

---

### 5. **Frontend - Admin Edit User** (`client/src/pages/AdminEditUser.jsx`)

Added citations field to the admin user edit form:

**Form Field:**
```jsx
<div className="sm:col-span-2">
    <label className="block text-sm font-medium text-gray-700">
        Citations & Publications
    </label>
    <textarea
        {...register('citations')}
        rows="4"
        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
        placeholder="Research papers, publications, citations..."
    />
</div>
```

**Admin Capabilities:**
- View all mentor citations
- Edit any mentor's citations
- Add citations for new mentors
- Full control over publication records

---

## 🎨 Visual Layout

### **Before (Old Layout):**
```
+---------------------------+
|   Contact Information     |
+---------------------------+
| Professional Information  |
+---------------------------+
|      Qualifications       |
|   (Full Width Section)    |
+---------------------------+
```

### **After (New Layout):**
```
+---------------------------+
|   Contact Information     |
+---------------------------+
| Professional Information  |
+---------------------------+
| Qualifications | Citations|
|                |          |
| (Side by Side Layout)    |
+---------------------------+
```

---

## 📱 Responsive Behavior

### **Desktop (lg and above):**
- Qualifications and Citations side-by-side (2 columns)
- Each section takes 50% width
- Equal spacing between sections

### **Tablet & Mobile:**
- Sections stack vertically (1 column)
- Full width for each section
- Maintains consistent spacing

---

## 🔧 Citation Format Examples

### **Academic Paper Citation:**
```
Smith, J., & Johnson, A. (2023). "Title of Paper." 
Journal Name, 45(2), 123-145.
```

### **Conference Paper:**
```
Johnson, S. (2022). "Innovative Teaching Methods." 
Proceedings of ACM SIGCSE, pp. 89-102.
```

### **Book Chapter:**
```
Johnson, S. (2021). "Advanced Algorithms." 
In: Computer Science Education (pp. 201-215). 
IEEE Press.
```

### **Multiple Citations:**
Simply separate each citation with a blank line for better readability.

---

## ✨ User Experience Flow

### **For Mentors:**

1. **View Citations:**
   - Navigate to Profile page
   - See "Citations & Publications" section beside Qualifications
   - Citations displayed with preserved formatting

2. **Edit Citations:**
   - Click "Edit Profile" button
   - Scroll to Citations section
   - Edit in the textarea (supports multi-line)
   - Click "Save" to update

3. **Success:**
   - Toast notification confirms save
   - Citations immediately visible in read-only mode
   - Line breaks and formatting preserved

### **For Admins:**

1. **Edit Any Mentor's Citations:**
   - Go to Admin Dashboard
   - Click on a mentor to edit
   - Scroll to "Citations & Publications" field
   - Update as needed
   - Save changes

---

## 🔒 Security & Validation

### **Access Control:**
- ✅ Only authenticated mentors can edit their own citations
- ✅ Admins can edit any mentor's citations
- ✅ Role-based middleware protection
- ✅ No access for mentees or unauthorized users

### **Data Validation:**
- Text field (unlimited length)
- No HTML injection (plain text only)
- Preserved line breaks for formatting
- Optional field (can be empty)

---

## 🧪 Testing the Feature

### **Test as Mentor:**

1. **Login:**
   ```
   Email: mentor@example.com
   Password: password123
   ```

2. **View Pre-populated Citations:**
   - Go to Profile
   - See 3 sample citations already added

3. **Edit Citations:**
   - Click "Edit Profile"
   - Modify citations text
   - Add new publications
   - Click "Save"
   - Verify changes appear immediately

4. **Test Empty State:**
   - Delete all citations
   - Save
   - Should show: "No citations or publications listed"

### **Test as Admin:**

1. **Login as Admin:**
   ```
   Email: admin@example.com
   Password: admin123
   ```

2. **Edit Mentor Citations:**
   - Go to Admin Dashboard
   - Click on mentor card
   - Edit citations field
   - Save changes

3. **Create New Mentor with Citations:**
   - Add new mentor user
   - Fill in citations during creation
   - Verify saved correctly

---

## 📊 Database Schema

### **Mentor Collection:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  fullName: String,
  employeeId: String,
  department: String,
  phone: String,
  subjects: [String],
  qualifications: String,
  citations: String,        // ← NEW FIELD
  experience: Number,
  profilePhoto: String,
  officeHours: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 API Endpoints

### **Get Mentor Profile:**
```
GET /api/mentors/profile
Authorization: Bearer <token>
Role: mentor

Response:
{
  "_id": "...",
  "fullName": "Dr. Sarah Johnson",
  "qualifications": "PhD in Computer Science",
  "citations": "Johnson, S. (2023)...",
  ...
}
```

### **Update Mentor Profile:**
```
PUT /api/mentors/profile
Authorization: Bearer <token>
Role: mentor

Body:
{
  "email": "mentor@example.com",
  "phone": "+1-555-0123",
  "qualifications": "PhD in Computer Science",
  "citations": "Johnson, S. (2023)..."
}

Response:
{
  "message": "Profile updated successfully",
  "mentor": { ... }
}
```

---

## 🎓 Sample Citations (Demo Data)

The demo mentor account includes these sample citations:

1. **Journal Article:**
   ```
   Johnson, S. (2023). "Advanced Machine Learning Algorithms in Education." 
   Journal of Educational Technology, 45(2), 123-145.
   ```

2. **Conference Paper:**
   ```
   Johnson, S., & Smith, R. (2022). "Innovative Teaching Methods in Computer Science." 
   ACM SIGCSE Bulletin, 54(1), 89-102.
   ```

3. **IEEE Publication:**
   ```
   Johnson, S. (2021). "Data Structures and Algorithm Design for Modern Applications." 
   IEEE Transactions on Education, 64(3), 201-215.
   ```

---

## 💡 Future Enhancements (Optional)

1. **Citation Formatting:**
   - Auto-format citations (APA, MLA, Chicago styles)
   - Citation validator/parser
   - Import from Google Scholar or other platforms

2. **Rich Text Editor:**
   - Bold, italic formatting
   - Links to papers
   - DOI integration

3. **Citation Count:**
   - Track number of publications
   - Display citation statistics
   - Research impact metrics

4. **File Attachments:**
   - Attach PDF copies of papers
   - Link to external publications
   - Create a publications library

5. **Search & Filter:**
   - Search mentors by publications
   - Filter by research area
   - Find mentors with specific expertise

---

## 📁 File Locations

### **Backend:**
- Model: `server/models/Mentor.js` (line ~27)
- Routes: `server/routes/mentorRoutes.js` (line ~30)
- Seed: `server/scripts/seed.js` (line ~61)

### **Frontend:**
- Profile Page: `client/src/pages/ProfilePage.jsx` (line ~223)
- Admin Edit: `client/src/pages/AdminEditUser.jsx` (line ~330)
- Auth Context: `client/src/context/AuthContext.jsx` (refreshProfile function)

---

## ✅ Feature Status

**Status:** ✅ **COMPLETE AND READY TO USE**

**Tested:**
- ✅ Mentor can view citations
- ✅ Mentor can edit citations
- ✅ Admin can edit mentor citations
- ✅ Data persists correctly
- ✅ Responsive layout works
- ✅ Dark mode styling
- ✅ Empty state handling
- ✅ Line breaks preserved

---

## 🆘 Troubleshooting

### **Issue: Citations not showing**
**Solution:** 
- Check if mentor is logged in
- Verify profile data loaded
- Check browser console for errors

### **Issue: Can't edit citations**
**Solution:**
- Click "Edit Profile" button first
- Ensure you're logged in as mentor
- Check authentication token

### **Issue: Formatting lost**
**Solution:**
- Use line breaks between citations
- The `whitespace-pre-line` CSS preserves formatting
- Avoid using HTML tags (plain text only)

### **Issue: Save not working**
**Solution:**
- Check network tab for API errors
- Verify MongoDB is running
- Check server logs for errors

---

## 🎉 Summary

The Citations feature is now fully integrated into MMSpace! Mentors can showcase their research contributions and academic achievements alongside their qualifications, providing a more complete professional profile.

**Key Benefits:**
- 📚 Showcase research and publications
- 🎓 Build credibility and expertise
- 🔍 Help students find research mentors
- 📊 Track academic contributions
- 🤝 Foster research collaboration

---

**Created:** October 7, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
