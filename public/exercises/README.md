# Exercise Images Directory

This directory contains static exercise demonstration images.

## Current Status

✅ **default-workout.svg** - Generic workout placeholder (included)

## Adding Real Exercise Images

To replace the generic placeholder with actual exercise photos, add images with these exact filenames:

### Required Image Files

- `barbell-bench-press.jpg` - Bench press
- `bent-over-rows.jpg` - Bent-over rows
- `overhead-press.jpg` - Overhead/shoulder press
- `bicep-curls.jpg` - Bicep curls
- `barbell-squats.jpg` - Squats
- `romanian-deadlifts.jpg` - Deadlifts
- `leg-press.jpg` - Leg press
- `plank.jpg` - Plank
- `incline-dumbbell-press.jpg` - Incline press
- `lat-pulldowns.jpg` - Lat pulldowns
- `dumbbell-lateral-raises.jpg` - Lateral raises
- `triceps-pushdowns.jpg` - Triceps pushdowns

## Image Specifications

- **Format**: JPG, PNG, or SVG
- **Dimensions**: 512x512px (square) recommended
- **Content**: Professional fitness photography showing proper form
- **Free Sources**:
  - [Unsplash](https://unsplash.com/s/photos/gym-exercise)
  - [Pexels](https://pexels.com/search/fitness/)
  - [Pixabay](https://pixabay.com/images/search/workout/)

## How It Works

1. User clicks "Generate image"
2. System looks for `/exercises/[exercise-name].jpg`
3. If not found, shows `default-workout.svg`
4. Images are served instantly (no external API calls)

## Quick Setup

```bash
# Example: Download and add an image
# 1. Download exercise image from Unsplash/Pexels
# 2. Rename to match exercise name (e.g., barbell-bench-press.jpg)
# 3. Place in this directory
# 4. Refresh the app - image appears instantly!
```

No external APIs, no broken images, 100% reliable! 🎯
