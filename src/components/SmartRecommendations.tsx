import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Grid,
  Paper,
  useTheme,
  alpha,
  Fade,
  Slide,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  TrendingUp as TrendingIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
  Star as StarIcon,
  LocalFireDepartment as FireIcon,
  NewReleases as NewIcon,
  PersonalVideo as PersonalIcon,
} from '@mui/icons-material';
import { ItemWithAccess } from '../types/database.types';

interface SmartRecommendationsProps {
  items: ItemWithAccess[];
  userAccessList: string[];
  subscriptions: string[];
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  items,
  userAccessList,
  subscriptions,
}) => {
  const theme = useTheme();

  // AI-powered recommendation engine
  const recommendations = useMemo(() => {
    // Get user's access patterns
    const accessedItems = items.filter(item => userAccessList.includes(item.id));
    const subscribedItems = items.filter(item => subscriptions.includes(item.id));

    // Analyze user preferences by category
    const categoryPreferences = accessedItems.reduce((acc, item) => {
      const categoryId = item.category_id;
      acc[categoryId] = (acc[categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const subscribedCategories = subscribedItems.reduce((acc, item) => {
      const categoryId = item.category_id;
      acc[categoryId] = (acc[categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Smart recommendation algorithms
    const algorithms = {
      // Items you might like based on your access pattern
      basedOnAccess: items
        .filter(item =>
          !userAccessList.includes(item.id) &&
          item.status === 'active' &&
          categoryPreferences[item.category_id] > 0
        )
        .sort((a, b) =>
          (categoryPreferences[b.category_id] || 0) - (categoryPreferences[a.category_id] || 0)
        )
        .slice(0, 3),

      // Trending items (most subscribed)
      trending: items
        .filter(item => item.status === 'active')
        .sort((a, b) => {
          // Mock trending score based on category popularity
          const aScore = items.filter(i => i.category_id === a.category_id).length;
          const bScore = items.filter(i => i.category_id === b.category_id).length;
          return bScore - aScore;
        })
        .slice(0, 3),

      // New releases
      newReleases: items
        .filter(item => item.status === 'active')
        .sort((a, b) =>
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        )
        .slice(0, 3),

      // Similar to your subscriptions
      similarToSubscribed: items
        .filter(item =>
          !subscriptions.includes(item.id) &&
          item.status === 'active' &&
          subscribedCategories[item.category_id] > 0
        )
        .sort((a, b) =>
          (subscribedCategories[b.category_id] || 0) - (subscribedCategories[a.category_id] || 0)
        )
        .slice(0, 3),
    };

    return algorithms;
  }, [items, userAccessList, subscriptions]);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'basedOnAccess':
        return <PersonalIcon />;
      case 'trending':
        return <FireIcon />;
      case 'newReleases':
        return <NewIcon />;
      case 'similarToSubscribed':
        return <StarIcon />;
      default:
        return <AIIcon />;
    }
  };

  const getRecommendationTitle = (type: string) => {
    switch (type) {
      case 'basedOnAccess':
        return 'مقترح لك شخصياً';
      case 'trending':
        return 'الأكثر رواجاً';
      case 'newReleases':
        return 'إضافات جديدة';
      case 'similarToSubscribed':
        return 'مشابه لاشتراكاتك';
      default:
        return 'مقترحات ذكية';
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'basedOnAccess':
        return 'linear-gradient(135deg, #667eea, #764ba2)';
      case 'trending':
        return 'linear-gradient(135deg, #fa709a, #fee140)';
      case 'newReleases':
        return 'linear-gradient(135deg, #43e97b, #38f9d7)';
      case 'similarToSubscribed':
        return 'linear-gradient(135deg, #4facfe, #00f2fe)';
      default:
        return 'linear-gradient(135deg, #a8edea, #fed6e3)';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Fade in timeout={1000}>
        <Paper
          elevation={0}
          className="glass-effect neon-glow"
          sx={{
            borderRadius: 6,
            p: 4,
            mb: 4,
            background: 'rgba(102, 126, 234, 0.05)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar
              className="pulse-animation"
              sx={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                width: 60,
                height: 60,
                boxShadow: '0 15px 45px rgba(102, 126, 234, 0.4)',
              }}
            >
              <PsychologyIcon sx={{ fontSize: '2rem', color: 'white' }} />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #fff, #e2e8f0)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                توصيات ذكية مخصصة لك
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255,255,255,0.8)' }}
              >
                مدعومة بالذكاء الاصطناعي لتحليل تفضيلاتك وسلوكك
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Chip
              icon={<LightbulbIcon />}
              label="مدعوم بالذكاء الاصطناعي"
              sx={{
                background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                color: '#0f0f23',
                fontWeight: 700,
                px: 2,
                py: 1,
                '& .MuiChip-icon': { color: '#0f0f23' },
              }}
            />
          </Box>

          <Grid container spacing={3}>
            {Object.entries(recommendations).map(([type, items], index) => (
              items.length > 0 && (
                <Grid size={{ xs: 12, md: 6, lg: 3 }} key={type}>
                  <Slide direction="up" in timeout={800 + index * 200}>
                    <Card
                      className="magnetic-hover gpu-accelerated"
                      sx={{
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          background: 'rgba(255,255,255,0.1)',
                          boxShadow: '0 25px 80px rgba(102, 126, 234, 0.3)',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: getRecommendationColor(type),
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <Avatar
                            sx={{
                              background: getRecommendationColor(type),
                              width: 48,
                              height: 48,
                            }}
                          >
                            {getRecommendationIcon(type)}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              color="white"
                              sx={{ mb: 0.5 }}
                            >
                              {getRecommendationTitle(type)}
                            </Typography>
                            <Chip
                              label={`${items.length} عنصر`}
                              size="small"
                              sx={{
                                background: 'rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.8)',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          {items.slice(0, 2).map((item, itemIndex) => (
                            <Box
                              key={item.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                borderRadius: 3,
                                background: 'rgba(255,255,255,0.05)',
                                mb: itemIndex < items.length - 1 ? 1 : 0,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'rgba(255,255,255,0.1)',
                                  transform: 'translateX(8px)',
                                },
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  background: getRecommendationColor(type),
                                  fontSize: '0.8rem',
                                }}
                              >
                                {item.title.charAt(0)}
                              </Avatar>
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  color="white"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {item.title}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="rgba(255,255,255,0.6)"
                                >
                                  {item.category?.name}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>

                        <Button
                          variant="outlined"
                          fullWidth
                          className="elastic-hover"
                          sx={{
                            borderColor: 'rgba(255,255,255,0.3)',
                            color: 'white',
                            borderRadius: 3,
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: 'rgba(255,255,255,0.5)',
                              background: 'rgba(255,255,255,0.1)',
                            },
                          }}
                        >
                          عرض الكل ({items.length})
                        </Button>
                      </CardContent>

                      {/* Floating decoration */}
                      <Box
                        className="card-floating-particles"
                        sx={{
                          position: 'absolute',
                          top: -15,
                          right: -15,
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
                          opacity: 0.6,
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </Card>
                  </Slide>
                </Grid>
              )
            ))}
          </Grid>

          {/* AI Intelligence Indicator */}
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 4,
              background: 'rgba(67, 233, 123, 0.1)',
              border: '1px solid rgba(67, 233, 123, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar
              className="glow-animation"
              sx={{
                background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                width: 40,
                height: 40,
              }}
            >
              <AIIcon sx={{ color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={600} color="#43e97b">
                نظام التوصيات الذكي نشط
              </Typography>
              <Typography variant="body2" color="rgba(67, 233, 123, 0.8)">
                يتم تحديث التوصيات باستمرار بناءً على تفاعلك وتفضيلاتك
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};