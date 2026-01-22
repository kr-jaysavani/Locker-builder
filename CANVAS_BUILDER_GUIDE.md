# 🎨 Canvas Page Builder - Mobile App

A powerful, intuitive mobile canvas builder app that lets you create beautiful landing pages with drag-and-drop elements. Think of it as a Linktree alternative with unlimited creative freedom!

## ✨ What's Built

### Core Canvas Features
- **Drag & Drop Interface** - Place elements anywhere on the canvas
- **All Elements Resizable** - Every element has resize handles (top, right, bottom, left)
- **Layer Management** - Bring elements to front or send to back (z-index control)
- **Undo/Redo System** - Full history tracking with 50-step memory
- **Save & Load** - Persistent storage with MongoDB

### Element Types

#### 📷 Images
- Upload from device gallery
- Stored as base64 (no cloud storage needed)
- Drag, resize, and position anywhere

#### 📝 Text
- Custom text content
- **6 Font Options**: System, Arial, Times New Roman, Courier, Georgia, Verdana
- **10 Font Sizes**: 12, 14, 16, 18, 20, 24, 28, 32, 40, 48
- **Color Picker**: 10+ colors for text
- Edit anytime after creation

#### 🔷 Shapes
- Rectangles and circles
- Background color customization
- Fully resizable

#### 🔗 Link Buttons
- Create clickable link buttons
- Perfect for social media links
- Custom text, URL, and colors
- Linktree alternative!

#### 👥 Friend Buttons
- Display friend links
- Customizable appearance
- Add URLs to friend profiles

### Customization Tools

#### 🎨 Color Pickers
- **Background Colors**: 15+ options including white, black, vibrant colors
- **Text Colors**: 10+ options for text elements
- **Button Colors**: Background and text colors for buttons

#### ✏️ Element Editing
Every element can be edited after creation:
- Select element by tapping
- Edit button opens modal with options
- Change colors, fonts, sizes, content
- Modify URLs for links

#### 📏 Resize System
- All elements show 4 resize handles when selected
- Press and hold handle to resize
- Minimum size: 50x50 pixels
- Works for images, text, shapes, and buttons

### Page Management
- **New Page** - Start fresh (with unsaved warning)
- **Save Page** - Create or update with custom title
- **Load Pages** - Browse all saved designs
- **Delete Pages** - Remove unwanted pages
- Auto-save detection (updates existing pages)

## 🚀 How to Use

### Getting Started
1. Open the app
2. You'll see an empty white canvas
3. Use the toolbar at the top to add elements

### Adding Elements
1. **Add Image**: Tap Image → Select from gallery → Image appears on canvas
2. **Add Text**: Tap Text → Enter text → Choose font, size, color → Add
3. **Add Shape**: Tap Shape (rectangle) or Circle → Shape appears
4. **Add Link**: Tap Link → Button appears → Edit to customize
5. **Add Friend**: Tap Friend → Button appears → Edit to add URL

### Editing Elements
1. **Select**: Tap any element to select it
2. **Move**: Drag element to new position
3. **Resize**: Use the 4 handles (top, right, bottom, left) on selected element
4. **Edit**: Tap edit icon (pencil) in control panel
5. **Layer**: Tap up/down arrows to change z-index
6. **Delete**: Tap trash icon (with confirmation)

### Canvas Controls
- **Background**: Tap BG button → Choose color
- **Undo**: Tap undo arrow (when available)
- **Redo**: Tap redo arrow (when available)
- **New Page**: Tap + icon in header
- **Save**: Tap Save → Enter title → Save
- **Load**: Tap Load → Select page from list

## 🛠️ Technical Stack

### Frontend
- **Expo** - Cross-platform mobile framework
- **React Native** - Native mobile UI
- **Zustand** - State management
- **React Native Gesture Handler** - Touch interactions
- **React Native Reanimated** - Smooth animations
- **Expo Image Picker** - Gallery access

### Backend
- **FastAPI** - Python REST API
- **MongoDB** - Document database
- **Motor** - Async MongoDB driver

### Key Features
- ✅ Base64 image storage (no cloud services needed)
- ✅ Full CRUD API for pages
- ✅ Cross-platform (iOS, Android, Web)
- ✅ Touch-optimized UI
- ✅ Permission handling (camera, gallery)
- ✅ Safe area support
- ✅ Responsive design

## 📱 Accessing the App

### Web Preview
Your app is live at: [Check your Expo preview URL]

### Mobile (Expo Go)
1. Install Expo Go app on your phone
2. Scan the QR code in the terminal
3. App will load on your device

### Testing
- Web: Works in browser with mouse drag
- Mobile: Full touch support with native gestures

## 🎯 Use Cases

1. **Personal Landing Page** - Like Linktree but customizable
2. **Social Media Hub** - Link all your profiles in one place
3. **Digital Business Card** - Professional contact page
4. **Event Page** - Create event info with images and links
5. **Portfolio** - Showcase work with custom layout
6. **Link-in-Bio** - Instagram/TikTok link page

## 🎨 Design Tips

### Creating Great Pages
1. **Start with Background** - Choose a color that matches your brand
2. **Add Hero Image** - Large image at top for visual impact
3. **Add Text** - Heading with your name or brand
4. **Add Links** - Social media and important links
5. **Arrange Layers** - Use z-index to create depth
6. **Test Resize** - Make sure everything looks good at different sizes

### Color Combinations
- **Professional**: White background, black text, teal buttons
- **Vibrant**: Blue background, white text, orange buttons
- **Minimal**: Light gray background, dark text, subtle shapes
- **Bold**: Black background, white text, colorful shapes

## 🔒 Permissions

The app requests:
- **Gallery Access** - To upload images (iOS & Android)
- **Camera** - For taking photos (future feature)

Permissions are requested only when needed (when you tap Image button).

## 💾 Data Storage

### Where Data is Stored
- **Pages**: MongoDB database (persistent)
- **Images**: Base64 in MongoDB (no separate file storage)
- **Undo History**: In-memory (cleared on page load)

### Storage Format
Each page contains:
- Title
- Elements array (all your content)
- Background color
- Canvas dimensions
- Timestamps (created, updated)

## 🚧 Current Features vs Future Plans

### ✅ Completed (All Working!)
- Drag & drop canvas
- All element types (image, text, shape, link, friend)
- Resizable elements (all types)
- Color pickers (background, text)
- Font selection (6 fonts)
- Font size selection (10 sizes)
- Undo/Redo system
- Save/Load pages
- Layer management (z-index)
- Element editing
- Delete functionality
- Base64 image storage
- Mobile-optimized UI
- Permission handling

### 🎯 Templates (You mentioned "later")
Templates can be added when you're ready!

## 🐛 Known Issues

None! All core features are working:
- ✅ Backend API functional
- ✅ Frontend rendering correctly
- ✅ Drag and drop working
- ✅ Resize handles working
- ✅ Save/Load working
- ✅ All modals functional
- ✅ Color pickers working
- ✅ Undo/Redo working

## 📞 Support

If something doesn't work:
1. Check the console logs
2. Verify backend is running (port 8001)
3. Verify frontend is running (port 3000)
4. Check MongoDB connection
5. Let me know what's not working!

## 🎉 Ready to Use!

Your Canvas Page Builder is **fully functional** and ready to use! 

Start creating beautiful landing pages with unlimited customization. No templates needed - you have complete creative freedom!

---

**Built with ❤️ using Expo + FastAPI + MongoDB**
