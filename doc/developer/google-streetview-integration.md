# Google Street View Static API Integration Guide

## Overview
This guide explains how to integrate the Google Street View Static API into Elite-Atomic-CRM to display street-level property views for service addresses and properties. It follows our frontend rules (@01-frontend-development.mdc), visual design system (@01a-visual-design.mdc), and domain customization guidelines (@05-customization.mdc).

Reference: Google Street View Static API overview: https://developers.google.com/maps/documentation/streetview/overview

## Prerequisites
- Google Cloud project with billing enabled
- “Street View Static API” enabled
- Environment:
  - `VITE_GOOGLE_API_KEY` already configured (given)
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` already configured
- Properties module with address fields (`address`, `city`, `state`, `zipcode`)

## UX Goals (aligned with @05-customization.mdc)
- Help landscapers visualize the service location before a visit.
- Show a tasteful, branded static Street View image on:
  - Property details (`PropertyShow`)
  - Contact service address section (optional)
- Offer quick angle toggles (N/E/S/W) to preview the site from multiple directions.

## Component Architecture (aligned with @01-frontend-development.mdc)
Create minimal, reusable components; prefer RA layout constructs.

File structure:


## Core Component (StreetViewImage)
Guidelines:
- No hard-coded colors. Use MUI theme tokens (@01a-visual-design.mdc).
- Respect motion guidance (transform/opacity-only; short durations).
- Provide skeleton loading and graceful fallback state.

Example: `src/misc/StreetViewImage.tsx`
```tsx
import React, { useMemo, useState } from 'react';
import { Box, Card, CardMedia, Typography, IconButton, Skeleton } from '@mui/material';
import { Refresh as RefreshIcon, Fullscreen as FullscreenIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

type StreetViewImageProps = {
  address: string;
  city?: string;
  state?: string;
  zipcode?: string;
  size?: { width: number; height: number };
  fov?: number;      // 10–120
  heading?: number;  // 0–360
  pitch?: number;    // -90–90
  className?: string;
  onError?: (message: string) => void;
};

export const StreetViewImage: React.FC<StreetViewImageProps> = ({
  address,
  city,
  state,
  zipcode,
  size = { width: 600, height: 400 },
  fov = 90,
  heading = 0,
  pitch = 0,
  className,
  onError,
}) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fullAddress = [address, city, state, zipcode].filter(Boolean).join(', ');

  const streetViewUrl = useMemo(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
    if (!fullAddress || !apiKey) return null;

    const params = new URLSearchParams({
      size: `${size.width}x${size.height}`,
      location: fullAddress,
      fov: String(fov),
      heading: String(heading),
      pitch: String(pitch),
      key: apiKey,
    });

    return `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
  }, [fullAddress, size.width, size.height, fov, heading, pitch, refreshKey]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.('Street View not available for this address');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setRefreshKey(k => k + 1);
  };

  const handleFullscreen = () => {
    if (streetViewUrl) window.open(streetViewUrl, '_blank');
  };

  if (!streetViewUrl) {
    return (
      <Card className={className} sx={{ bgcolor: theme.palette.action.hover, borderRadius: theme.shape.borderRadius }}>
        <Box sx={{ height: size.height, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Raleway' }} textAlign="center">
            Street View not available
            {!import.meta.env.VITE_GOOGLE_API_KEY && <><br/>Google API key not configured</>}
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      className={className}
      sx={{
        position: 'relative',
        boxShadow: theme.shadows[2],
        borderRadius: theme.shape.borderRadius,
        transition: 'box-shadow 150ms ease-out, transform 150ms ease-out',
        '&:hover': { boxShadow: theme.shadows[4] },
      }}
    >
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width={size.width}
          height={size.height}
          sx={{ position: 'absolute', inset: 0, zIndex: 1, borderRadius: theme.shape.borderRadius }}
        />
      )}
      {hasError ? (
        <Box
          sx={{
            height: size.height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: theme.palette.action.hover,
            p: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Raleway' }}>
            Street View unavailable for this address
          </Typography>
        </Box>
      ) : (
        <CardMedia
          component="img"
          image={streetViewUrl}
          alt={`Street View of ${fullAddress}`}
          sx={{ width: size.width, height: size.height }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={handleRefresh}
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, transform: 'scale(1.05)' },
          }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleFullscreen}
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: theme.palette.secondary.main, color: theme.palette.secondary.contrastText, transform: 'scale(1.05)' },
          }}
        >
          <FullscreenIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};
```

(Optional) Preload hook: `src/misc/useStreetView.ts`
```tsx
import { useEffect, useState } from 'react';

export const useStreetView = (fullAddress?: string, size = { width: 600, height: 400 }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
    if (!fullAddress || !apiKey) {
      setImageUrl(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      size: `${size.width}x${size.height}`,
      location: fullAddress,
      fov: '90',
      heading: '0',
      pitch: '0',
      key: apiKey,
    });

    const url = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
    const img = new Image();
    img.onload = () => { setImageUrl(url); setIsLoading(false); };
    img.onerror = () => { setError('Street View not available'); setIsLoading(false); };
    img.src = url;
  }, [fullAddress, size.width, size.height]);

  return { imageUrl, isLoading, error };
};
```

## Property Integration
Embed Street View in `PropertyShow`:

Example section: `src/properties/PropertyStreetView.tsx`
```tsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { StreetViewImage } from '../misc/StreetViewImage';

export const PropertyStreetView = () => {
  const record = useRecordContext<any>();
  const theme = useTheme();

  if (!record?.address) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 600, color: theme.palette.text.primary }}>
        Street View
      </Typography>
      <StreetViewImage
        address={record.address}
        city={record.city}
        state={record.state}
        zipcode={record.zipcode}
        size={{ width: 600, height: 400 }}
        fov={90}
        heading={0}
        pitch={0}
      />
    </Box>
  );
};
```

(Optional) Multi-angle gallery: `src/properties/PropertyStreetViewGallery.tsx`
```tsx
import React, { useState } from 'react';
import { Box, Button, ButtonGroup, Typography, useTheme } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { StreetViewImage } from '../misc/StreetViewImage';

const ANGLES = [
  { label: 'Front', heading: 0 },
  { label: 'Right', heading: 90 },
  { label: 'Back', heading: 180 },
  { label: 'Left', heading: 270 },
];

export const PropertyStreetViewGallery = () => {
  const record = useRecordContext<any>();
  const theme = useTheme();
  const [selected, setSelected] = useState(0);
  if (!record?.address) return null;

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 600, color: theme.palette.text.primary }}>
        Street View - {ANGLES[selected].label}
      </Typography>
      <ButtonGroup size="small" sx={{ mb: 2 }}>
        {ANGLES.map((a, i) => (
          <Button
            key={a.label}
            variant={selected === i ? 'contained' : 'outlined'}
            onClick={() => setSelected(i)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {a.label}
          </Button>
        ))}
      </ButtonGroup>
      <StreetViewImage
        address={record.address}
        city={record.city}
        state={record.state}
        zipcode={record.zipcode}
        heading={ANGLES[selected].heading}
        size={{ width: 600, height: 400 }}
        fov={90}
        pitch={0}
      />
    </Box>
  );
};
```

## Contact Service Address Integration (Optional)
In Contact show view, add a small section:
```tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { StreetViewImage } from '../misc/StreetViewImage';

export const ContactServiceLocationView = () => {
  const record = useRecordContext<any>();
  if (!record?.service_address) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>Service Location</Typography>
      <StreetViewImage
        address={record.service_address}
        city={record.service_city}
        state={record.service_state}
        zipcode={record.service_zipcode}
        size={{ width: 400, height: 250 }}
        fov={80}
      />
    </Box>
  );
};
```

## Visual Design Compliance (@01a-visual-design.mdc)
- Colors: use `theme.palette.*` only (no hardcoded hex).
- Typography: Montserrat (headings 600), Raleway (body 400).
- Elevation: `theme.shadows[2]`; add a subtle increase on hover.
- Radius: `theme.shape.borderRadius` (12–16px).
- Motion: short duration (120–180ms), transform/opacity only, respect reduced motion.

## API Parameters (from Google docs)
- `location`: full address string or `lat,lng` (required)
- `size`: `widthxheight` (max 640x640 for free tier)
- `fov`: 10–120 (default 90)
- `heading`: 0–360 (direction)
- `pitch`: -90 to 90 (tilt)
- `key`: your API key

## Security
- Restrict API key to Street View Static API only.
- Restrict to your domains; add quotas and budget alerts.
- Always use HTTPS requests.

## Performance
- Lazy load/in-view loading of images in detail pages.
- Basic caching of generated URLs (e.g., in component state or a simple map).
- Prefer smaller sizes for previews, larger for detail views.

## Accessibility
- Provide meaningful `alt` text (e.g., “Street View of 123 Main St, Springfield, IL”).
- Keyboard focusable interactive controls; visible focus ring using accent color.
- Respect `prefers-reduced-motion`.

## Testing
- Unit tests for URL composition and fallback states.
- Integration tests in `PropertyShow`.
- Test a variety of real addresses: complete, partial, invalid.

## Implementation Checklist
- [ ] Create `StreetViewImage.tsx`
- [ ] (Optional) Create `useStreetView.ts`
- [ ] Embed in `PropertyShow` (and optionally in Contact service addresses)
- [ ] Add skeleton loading & fallback UI
- [ ] Validate theming (typography, colors, shadows)
- [ ] Add tests (unit & integration)
- [ ] Verify API key restrictions in GCP
- [ ] Monitor API usage/cost

## Cost Considerations
Street View Static API is billed per request. To control costs:
- Cache URLs and lazy load.
- Only render Street View for fully specified addresses.
- Monitor usage in Google Cloud Console.
