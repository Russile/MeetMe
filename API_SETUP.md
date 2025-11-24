# Google Maps API Setup Guide

To make the Meeting Point app work, you need a Google Cloud Project with a valid API Key. This key must have the following **3 specific APIs enabled**:

## Required APIs

1.  **Maps JavaScript API**
    *   **Why?** Renders the interactive map on the screen.
    *   **Cost:** Free tier covers a generous amount of loads.

2.  **Places API (New)**
    *   **Why?**
        *   Used for the **Address Autocomplete** (finding "Address A" and "Address B").
        *   Used for **Nearby Search** (finding restaurants/cafes near the midpoint).
    *   **Note:** Ensure you enable "Places API (New)" or just "Places API" in the Google Cloud Console.

3.  **Directions API**
    *   **Why?** Calculates the driving route, time, and distance between the two addresses to find the midpoint.

## Billing & Costs (Important)

**Yes, you must enable billing.** Google requires a credit card on file to prevent abuse and verify identity.

**Will I be charged?**
*   **Likely No.** Google provides a **$200 monthly free credit** for Maps Platform.
*   This credit is enough for:
    *   ~28,000 map loads per month
    *   ~40,000 directions calls per month
    *   ~100,000 places calls per month
*   For a personal project or demo, you will almost certainly stay within the free tier.
*   You can set **Budget Alerts** in the Google Cloud Console to notify you if you ever approach a spending limit.

## How to Get Your Key

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., "Meeting Point App").
3.  **Enable Billing** for the project.
4.  Go to **APIs & Services > Library**.
5.  Search for and **ENABLE** each of the 3 APIs listed above.
6.  Go to **APIs & Services > Credentials**.
7.  Click **Create Credentials > API Key**.
8.  Copy this key.

## Securing Your Key (Recommended)

*   In the Credentials page, click on your new API Key to edit it.
*   Under "API restrictions", select **Restrict key**.
*   Check the boxes for **Maps JavaScript API**, **Places API**, and **Directions API**.
*   Save.

## Adding to App

1.  Open the `.env` file in your project root.
2.  Paste your key:
    ```
    VITE_GOOGLE_MAPS_API_KEY=AIzaSy...YourKeyHere...
    ```
3.  **Restart the dev server** (`Ctrl+C` then `npm run dev`) for the changes to take effect.
