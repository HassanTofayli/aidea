import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
  Tooltip,
  CircularProgress,
  alpha,
  useTheme,
  Avatar,
  Fade,
  Grow,
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  OpenInNew as OpenInNewIcon,
  WhatsApp as WhatsAppIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { ItemWithAccess } from '../types/database.types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

interface ItemCardProps {
  item: ItemWithAccess;
  onRequestAccess?: (item: ItemWithAccess) => void;
  onSubscribe?: (item: ItemWithAccess) => void;
  onUnsubscribe?: (item: ItemWithAccess) => void;
  onEdit?: (item: ItemWithAccess) => void;
  onDelete?: (item: ItemWithAccess) => void;
  onAccessUpdate?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onRequestAccess,
  onSubscribe,
  onUnsubscribe,
  onEdit,
  onDelete,
  onAccessUpdate,
}) => {
  const theme = useTheme();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(item.is_subscribed || false);
  const [isHovered, setIsHovered] = useState(false);

  const handleRequestAccess = () => {
    if (onRequestAccess) {
      onRequestAccess(item);
    } else {
      const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '';
      const message = encodeURIComponent(
        `${process.env.REACT_APP_WHATSAPP_MESSAGE || 'أريد الحصول على إذن الوصول إلى'}: ${item.title}`
      );
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleToggleSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (subscribed) {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', item.id);

        if (error) throw error;
        setSubscribed(false);
        if (onUnsubscribe) onUnsubscribe(item);
      } else {
        const { error } = await supabase.from('subscriptions').insert({
          user_id: user.id,
          item_id: item.id,
        });

        if (error && error.code !== '23505') throw error;
        setSubscribed(true);
        if (onSubscribe) onSubscribe(item);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenItem = () => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  // Determine card color scheme based on status and access
  const getCardTheme = () => {
    if (item.status === 'coming_soon') {
      return {
        primary: '#FF9800',
        secondary: '#FFB74D',
        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
        shadow: alpha('#FF9800', 0.2),
      };
    }

    if (item.has_access || isAdmin) {
      return {
        primary: '#4CAF50',
        secondary: '#81C784',
        background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
        shadow: alpha('#4CAF50', 0.2),
      };
    }

    return {
      primary: '#2196F3',
      secondary: '#64B5F6',
      background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
      shadow: alpha('#2196F3', 0.2),
    };
  };

  const cardTheme = getCardTheme();

  const renderStatusAvatar = () => {
    if (item.status === 'coming_soon') {
      return (
        <Avatar
          className="card-status-badge breathe-animation"
          sx={{
            bgcolor: 'linear-gradient(135deg, #FF9800, #F57C00)',
            width: 40,
            height: 40,
            boxShadow: `0 4px 20px ${alpha('#FF9800', 0.3)}`,
            transition: 'all 0.3s ease',
          }}
        >
          <AccessTimeIcon sx={{ color: 'white' }} />
        </Avatar>
      );
    }

    if (item.has_access || isAdmin) {
      return (
        <Avatar
          className="card-status-badge pulse-animation"
          sx={{
            bgcolor: 'linear-gradient(135deg, #4CAF50, #388E3C)',
            width: 40,
            height: 40,
            boxShadow: `0 4px 20px ${alpha('#4CAF50', 0.3)}`,
            transition: 'all 0.3s ease',
          }}
        >
          <VerifiedIcon sx={{ color: 'white' }} />
        </Avatar>
      );
    }

    return (
      <Avatar
        className="card-status-badge float-animation"
        sx={{
          bgcolor: 'linear-gradient(135deg, #607D8B, #455A64)',
          width: 40,
          height: 40,
          boxShadow: `0 4px 20px ${alpha('#607D8B', 0.3)}`,
          transition: 'all 0.3s ease',
        }}
      >
        <SecurityIcon sx={{ color: 'white' }} />
      </Avatar>
    );
  };

  const renderMainAction = () => {
    if (item.status === 'coming_soon') {
      return (
        <Chip
          icon={<ScheduleIcon />}
          label="قريباً"
          sx={{
            background: 'linear-gradient(135deg, #FF9800, #F57C00)',
            color: 'white',
            fontWeight: 600,
            px: 2,
            '& .MuiChip-icon': { color: 'white' },
          }}
        />
      );
    }

    if (!user) {
      return (
        <Tooltip title="سجل الدخول للوصول">
          <Chip
            icon={<LockIcon />}
            label="سجل الدخول"
            variant="outlined"
            sx={{
              borderColor: cardTheme.primary,
              color: cardTheme.primary,
              fontWeight: 600,
            }}
          />
        </Tooltip>
      );
    }

    if (item.has_access || isAdmin) {
      return (
        <Button
          variant="contained"
          className="card-action-button elastic-hover"
          startIcon={<LaunchIcon />}
          onClick={handleOpenItem}
          sx={{
            background: `linear-gradient(135deg, ${cardTheme.primary}, ${cardTheme.secondary})`,
            borderRadius: 3,
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: `0 8px 24px ${cardTheme.shadow}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${cardTheme.secondary}, ${cardTheme.primary})`,
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 32px ${cardTheme.shadow}`,
            },
            transition: 'all 0.3s ease',
          }}
        >
          فتح الرابط
        </Button>
      );
    }

    return (
      <Button
        variant="outlined"
        className="card-action-button elastic-hover"
        startIcon={<WhatsAppIcon />}
        onClick={handleRequestAccess}
        sx={{
          borderColor: '#25D366',
          color: '#25D366',
          borderRadius: 3,
          px: 3,
          py: 1,
          fontWeight: 600,
          textTransform: 'none',
          '&:hover': {
            bgcolor: alpha('#25D366', 0.1),
            borderColor: '#25D366',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        طلب الوصول
      </Button>
    );
  };

  return (
    <Grow in timeout={300}>
      <Card
        className="magnetic-hover ripple-effect gpu-accelerated"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderRadius: 4,
          background: cardTheme.background,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(cardTheme.primary, 0.2)}`,
          boxShadow: isHovered
            ? `0 20px 60px ${cardTheme.shadow}`
            : `0 8px 32px ${alpha(cardTheme.shadow, 0.6)}`,
          transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${cardTheme.primary}, ${cardTheme.secondary})`,
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            '& .card-status-badge': {
              transform: 'scale(1.1) rotate(5deg)',
            },
            '& .card-action-button': {
              transform: 'scale(1.05)',
            },
            '& .card-floating-particles': {
              opacity: 1,
              transform: 'scale(1.2)',
            }
          },
        }}
      >
        {/* Floating particles effect */}
        <Box
          className="card-floating-particles"
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(cardTheme.primary, 0.1)}, transparent)`,
            opacity: isHovered ? 0.8 : 0.4,
            transition: 'all 0.3s ease',
            transform: isHovered ? 'scale(1.5)' : 'scale(1)',
          }}
        />

        {/* Additional floating particles */}
        {[...Array(3)].map((_, index) => (
          <Box
            key={index}
            className={`particle-${index + 1} card-floating-particles`}
            sx={{
              position: 'absolute',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(cardTheme.primary, 0.6)}, transparent)`,
              top: `${20 + index * 25}%`,
              right: `${15 + index * 10}%`,
              opacity: isHovered ? 0.8 : 0.3,
              transition: 'all 0.4s ease',
              animationDelay: `${index * 0.5}s`,
            }}
          />
        ))}

        {/* Admin Controls */}
        {isAdmin && (
          <Fade in={isHovered}>
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                gap: 1,
                zIndex: 10,
              }}
            >
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={() => onEdit(item)}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.9),
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      bgcolor: theme.palette.primary.main,
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={() => onDelete(item)}
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.9),
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      bgcolor: theme.palette.error.main,
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Fade>
        )}

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Header with Status Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
            {renderStatusAvatar()}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: theme.palette.grey[800],
                  mb: 0.5,
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </Typography>
              <Chip
                label={item.category?.name || 'غير مصنف'}
                size="small"
                sx={{
                  bgcolor: alpha(cardTheme.primary, 0.1),
                  color: cardTheme.primary,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.6,
              fontSize: '0.9rem',
              mb: 2,
            }}
          >
            {item.description}
          </Typography>

          {/* Status Indicators */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {subscribed && (
              <Chip
                icon={<NotificationsIcon />}
                label="مشترك"
                size="small"
                sx={{
                  bgcolor: alpha('#FF9800', 0.1),
                  color: '#FF9800',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#FF9800' },
                }}
              />
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between', alignItems: 'center' }}>
          {renderMainAction()}

          {user && (
            <Tooltip title={subscribed ? 'إلغاء الاشتراك في التحديثات' : 'اشترك في التحديثات'}>
              <IconButton
                onClick={handleToggleSubscription}
                disabled={loading}
                sx={{
                  bgcolor: subscribed ? alpha('#FF9800', 0.1) : alpha(theme.palette.grey[400], 0.1),
                  color: subscribed ? '#FF9800' : theme.palette.grey[600],
                  '&:hover': {
                    bgcolor: subscribed ? alpha('#FF9800', 0.2) : alpha(cardTheme.primary, 0.1),
                    color: subscribed ? '#FF9800' : cardTheme.primary,
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? (
                  <CircularProgress size={20} />
                ) : subscribed ? (
                  <NotificationsIcon />
                ) : (
                  <NotificationsOffIcon />
                )}
              </IconButton>
            </Tooltip>
          )}
        </CardActions>

        {/* Decorative gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: `linear-gradient(to top, ${alpha(cardTheme.primary, 0.03)}, transparent)`,
            pointerEvents: 'none',
            opacity: isHovered ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
          }}
        />
      </Card>
    </Grow>
  );
};