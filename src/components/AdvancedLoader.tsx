import React from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';

interface AdvancedLoaderProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'morphing' | 'pulse' | 'breathe' | 'gradient';
}

export const AdvancedLoader: React.FC<AdvancedLoaderProps> = ({
  text = 'جاري التحميل...',
  size = 'medium',
  variant = 'morphing'
}) => {
  const theme = useTheme();

  const sizeMap = {
    small: { width: 24, height: 24, fontSize: '0.875rem' },
    medium: { width: 40, height: 40, fontSize: '1rem' },
    large: { width: 60, height: 60, fontSize: '1.25rem' }
  };

  const currentSize = sizeMap[size];

  const getLoaderElement = () => {
    switch (variant) {
      case 'morphing':
        return (
          <Box
            className="morphing-loader gpu-accelerated"
            sx={{
              width: currentSize.width,
              height: currentSize.height,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
            }}
          />
        );

      case 'pulse':
        return (
          <Box
            className="pulse-wave gpu-accelerated"
            sx={{
              width: currentSize.width,
              height: currentSize.height,
              backgroundColor: '#667eea',
              borderRadius: '50%',
              position: 'relative',
            }}
          />
        );

      case 'breathe':
        return (
          <Box
            className="breathe-animation gpu-accelerated"
            sx={{
              width: currentSize.width,
              height: currentSize.height,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
            }}
          />
        );

      case 'gradient':
        return (
          <Box
            className="moving-gradient gpu-accelerated"
            sx={{
              width: currentSize.width,
              height: currentSize.height,
              borderRadius: '50%',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 2,
                left: 2,
                right: 2,
                bottom: 2,
                background: theme.palette.background.paper,
                borderRadius: '50%',
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
      }}
    >
      {getLoaderElement()}

      {text && (
        <Typography
          variant="body2"
          className="text-glow"
          sx={{
            fontSize: currentSize.fontSize,
            fontWeight: 600,
            color: theme.palette.primary.main,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'movingGradient 3s ease infinite',
          }}
        >
          {text}
        </Typography>
      )}

      {/* Floating particles around loader */}
      <Box
        sx={{
          position: 'absolute',
          width: currentSize.width * 3,
          height: currentSize.width * 3,
          pointerEvents: 'none',
        }}
      >
        {[...Array(6)].map((_, index) => (
          <Box
            key={index}
            className={`particle-${(index % 3) + 1} gpu-accelerated`}
            sx={{
              position: 'absolute',
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#667eea', 0.6)}, transparent)`,
              top: `${20 + Math.sin(index * 60 * Math.PI / 180) * 40}%`,
              left: `${50 + Math.cos(index * 60 * Math.PI / 180) * 40}%`,
              animationDelay: `${index * 0.5}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};