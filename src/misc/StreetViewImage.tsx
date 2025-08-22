import React, { useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardMedia,
    IconButton,
    Skeleton,
    Typography,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

type StreetViewImageProps = {
    address: string;
    city?: string;
    state?: string;
    zipcode?: string;
    size?: { width: number; height: number };
    fov?: number; // 10–120
    heading?: number; // 0–360
    pitch?: number; // -90–90
    className?: string;
    onError?: (message: string) => void;
};

const StreetViewImage: React.FC<StreetViewImageProps> = ({
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

    const fullAddress = [address, city, state, zipcode]
        .filter(Boolean)
        .join(', ');

    const streetViewUrl = useMemo(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as
            | string
            | undefined;
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
        onError?.('Street View not available');
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
            <Card
                className={className}
                sx={{
                    bgcolor: theme.palette.action.hover,
                    borderRadius: theme.shape.borderRadius,
                }}
            >
                <Box
                    sx={{
                        height: size.height,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                    >
                        Street View not available
                        {!import.meta.env.VITE_GOOGLE_API_KEY && (
                            <>
                                <br />
                                Google API key not configured
                            </>
                        )}
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
                transition:
                    'box-shadow 150ms ease-out, transform 150ms ease-out',
                '&:hover': { boxShadow: theme.shadows[4] },
            }}
        >
            {isLoading && (
                <Skeleton
                    variant="rectangular"
                    width={size.width}
                    height={size.height}
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        borderRadius: theme.shape.borderRadius,
                    }}
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
                    <Typography variant="body2" color="text.secondary">
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

            <Box
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 0.5,
                }}
            >
                <IconButton
                    size="small"
                    onClick={handleRefresh}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': {
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            transform: 'scale(1.05)',
                        },
                    }}
                >
                    <RefreshIcon fontSize="small" />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={handleFullscreen}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': {
                            bgcolor: theme.palette.secondary.main,
                            color: theme.palette.secondary.contrastText,
                            transform: 'scale(1.05)',
                        },
                    }}
                >
                    <FullscreenIcon fontSize="small" />
                </IconButton>
            </Box>
        </Card>
    );
};

export default StreetViewImage;
