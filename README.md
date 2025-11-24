# Meet Me 📍

A beautiful, modern web application that finds the perfect halfway meeting point between two locations and recommends nearby places to visit.

![Meeting Point App](https://img.shields.io/badge/React-19.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.17-blue)

## ✨ Features

- 🗺️ **Smart Midpoint Calculation** - Calculates the actual halfway point along driving routes (not just straight-line distance)
- 📍 **Current Location Support** - Use your device's GPS to automatically fill in your location
- 🔍 **Place Recommendations** - Discover restaurants, cafes, parks, and more near the midpoint
- 📏 **Flexible Search Radius** - Choose from 1, 3, 5, or 10-mile search radius
- 🧭 **Get Directions** - One-click directions to any recommended place via Google Maps
- ⚡ **Time vs Distance** - Optimize for equal travel time or equal distance
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations

## 🚀 Demo

[Add your deployed URL here]

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Maps**: Google Maps Platform APIs
  - Maps JavaScript API
  - Places API
  - Directions API
  - Geocoding API
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Google Maps API Key with the following APIs enabled:
  - Maps JavaScript API
  - Places API
  - Directions API
  - Geocoding API

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/meet-me.git
   cd meet-me
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## 🎯 Usage

1. **Enter Locations**
   - Type an address in "Your Location" or click "Use Current Location"
   - Enter your friend's address in "Friend's Location"

2. **Configure Settings**
   - Choose optimization mode: Time or Distance
   - Select place category: Restaurant, Cafe, Bar, Park, or Shopping
   - Set search radius: 1, 3, 5, or 10 miles

3. **Find Midpoint**
   - Click "Find Midpoint" to calculate the route and halfway point
   - View the route on the map with markers for both locations and the midpoint

4. **Explore Places**
   - Browse recommended places near the midpoint
   - Click "Directions" on any place to open Google Maps navigation

## 📁 Project Structure

```
meeting-point/
├── src/
│   ├── components/
│   │   ├── AddressInput.tsx    # Autocomplete address input
│   │   └── Map.tsx             # Google Maps display
│   ├── hooks/
│   │   ├── useMidpoint.ts      # Midpoint calculation logic
│   │   └── usePlaces.ts        # Places search logic
│   ├── App.tsx                 # Main application
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── .env                        # Environment variables (not in git)
└── package.json
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `VITE_GOOGLE_MAPS_API_KEY` to environment variables
4. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to [Netlify](https://netlify.com)
3. Add environment variables in Netlify dashboard

## 🔐 API Keys & Security

⚠️ **Important**: Never commit your `.env` file to git. The `.gitignore` file ensures it stays local.

### Getting a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable required APIs (Maps JavaScript, Places, Directions, Geocoding)
4. Create credentials → API Key
5. Restrict the key (HTTP referrers for production)

### API Key Restrictions (Production)

For production, restrict your API key to your domain:
- Add your domain to HTTP referrer restrictions
- Enable only required APIs
- Consider setting usage quotas

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Google Maps Platform for mapping services
- [vis.gl](https://vis.gl) for React Google Maps components
- [Lucide](https://lucide.dev) for beautiful icons

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/YOUR_USERNAME/meet-me](https://github.com/YOUR_USERNAME/meet-me)

---

Made with ❤️ and React
