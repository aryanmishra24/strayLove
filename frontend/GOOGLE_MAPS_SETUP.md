# Google Maps API Setup for Straylove

## 🗺️ Setting Up Google Maps API Key

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (required for Maps API)

### Step 2: Enable Maps JavaScript API
1. In Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Maps JavaScript API"
3. Click on it and press "Enable"

### Step 3: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### Step 4: Restrict API Key (Recommended)
1. Click on the created API key
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain (e.g., `localhost:5173/*` for development)
4. Under "API restrictions", select "Restrict key"
5. Select "Maps JavaScript API" from the dropdown

### Step 5: Add API Key to Environment
Create a `.env` file in the frontend directory:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Step 6: Restart Development Server
```bash
npm run dev
```

## 💰 Pricing Information

### Free Tier (India)
- **$200/month credit** - Usually sufficient for development and small apps
- **Maps JavaScript API**: ~$5 per 1000 loads
- **Geocoding API**: ~$5 per 1000 requests

### Estimated Monthly Cost (India)
- **Development**: $0-10/month
- **Small community app**: $10-50/month
- **Large scale app**: $50-200/month

## 🚀 Features Available

### India-Specific Benefits
- ✅ **Better street coverage** for Indian cities and villages
- ✅ **Local language support** (Hindi, Tamil, Telugu, etc.)
- ✅ **Public transport integration** (Metro, buses, trains)
- ✅ **Traffic data** for major Indian cities
- ✅ **Street View** in many Indian cities
- ✅ **Accurate geocoding** for Indian addresses

### Map Features
- ✅ **Interactive markers** with custom icons
- ✅ **Health status color coding**
- ✅ **Species-specific emoji icons**
- ✅ **Rich info windows** with animal details
- ✅ **User location detection**
- ✅ **Responsive design** for mobile devices

## 🔧 Troubleshooting

### Common Issues
1. **"Google Maps JavaScript API error"**
   - Check if API key is correct
   - Verify API is enabled
   - Check billing is enabled

2. **"Referrer not allowed"**
   - Add your domain to API key restrictions
   - For development: add `localhost:5173/*`

3. **"Quota exceeded"**
   - Check usage in Google Cloud Console
   - Consider upgrading billing plan

### Support
- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Quotas and Pricing](https://developers.google.com/maps/pricing)

## 🌟 Why Google Maps for India?

1. **Superior Coverage**: Better mapping of Indian streets, especially in smaller towns
2. **Local Context**: Indian place names, landmarks, and neighborhoods
3. **Public Transport**: Metro, bus, and train information
4. **User Familiarity**: Most Indians use Google Maps daily
5. **Language Support**: Multiple Indian languages
6. **Emergency Services**: Better integration with local services 