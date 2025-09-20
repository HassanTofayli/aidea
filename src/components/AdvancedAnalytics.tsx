import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Paper,
  LinearProgress,
  useTheme,
  alpha,
  Fade,
  Grow,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  BarChart as BarChartIcon,
  DonutLarge as DonutIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  DataUsage as DataUsageIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { ItemWithAccess, Category } from '../types/database.types';

interface AdvancedAnalyticsProps {
  items: ItemWithAccess[];
  categories: Category[];
  userAccessList: string[];
  subscriptions: string[];
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  items,
  categories,
  userAccessList,
  subscriptions,
}) => {
  const theme = useTheme();

  // Advanced analytics calculations
  const analytics = useMemo(() => {
    const totalItems = items.length;
    const accessibleItems = items.filter(item => item.has_access).length;
    const subscribedItems = subscriptions.length;
    const comingSoonItems = items.filter(item => item.status === 'coming_soon').length;
    const activeItems = items.filter(item => item.status === 'active').length;

    // Category analytics
    const categoryStats = categories.map(category => {
      const categoryItems = items.filter(item => item.category_id === category.id);
      const accessibleCount = categoryItems.filter(item => item.has_access).length;
      const subscribedCount = categoryItems.filter(item => item.is_subscribed).length;

      return {
        ...category,
        totalItems: categoryItems.length,
        accessibleItems: accessibleCount,
        subscribedItems: subscribedCount,
        accessRate: categoryItems.length > 0 ? (accessibleCount / categoryItems.length) * 100 : 0,
        engagementRate: categoryItems.length > 0 ? (subscribedCount / categoryItems.length) * 100 : 0,
      };
    }).sort((a, b) => b.totalItems - a.totalItems);

    // Performance metrics
    const metrics = {
      totalItems,
      accessibleItems,
      subscribedItems,
      comingSoonItems,
      activeItems,
      accessRate: totalItems > 0 ? (accessibleItems / totalItems) * 100 : 0,
      engagementRate: totalItems > 0 ? (subscribedItems / totalItems) * 100 : 0,
      completionRate: totalItems > 0 ? (activeItems / totalItems) * 100 : 0,
      categoryStats,
      topCategory: categoryStats[0],
      mostEngagedCategory: categoryStats.sort((a, b) => b.engagementRate - a.engagementRate)[0],
    };

    return metrics;
  }, [items, categories, userAccessList, subscriptions]);

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return { color: '#43e97b', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' };
    if (value >= 60) return { color: '#4facfe', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' };
    if (value >= 40) return { color: '#fa709a', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' };
    return { color: '#ff6b6b', gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a52)' };
  };

  const formatPercentage = (value: number) => Math.round(value);

  return (
    <Box sx={{ mb: 4 }}>
      <Fade in timeout={1200}>
        <Paper
          elevation={0}
          className="glass-effect neon-glow"
          sx={{
            borderRadius: 6,
            p: 4,
            mb: 4,
            background: 'rgba(79, 172, 254, 0.05)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(79, 172, 254, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar
              className="pulse-animation"
              sx={{
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                width: 60,
                height: 60,
                boxShadow: '0 15px 45px rgba(79, 172, 254, 0.4)',
              }}
            >
              <AssessmentIcon sx={{ fontSize: '2rem', color: 'white' }} />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                تحليلات متقدمة
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255,255,255,0.8)' }}
              >
                رؤى عميقة حول أداء وتفاعل المحتوى
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Chip
              icon={<DataUsageIcon />}
              label="تحليل في الوقت الفعلي"
              sx={{
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                color: 'white',
                fontWeight: 700,
                px: 2,
                py: 1,
                '& .MuiChip-icon': { color: 'white' },
              }}
            />
          </Box>

          {/* Key Performance Indicators */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Grow in timeout={800}>
                <Card
                  className="neumorphism magnetic-hover"
                  sx={{
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    p: 3,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px) scale(1.02)',
                      background: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      background: getPerformanceColor(analytics.accessRate).gradient,
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <SpeedIcon sx={{ fontSize: '2rem', color: 'white' }} />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="white" sx={{ mb: 1 }}>
                    {formatPercentage(analytics.accessRate)}%
                  </Typography>
                  <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mb: 2 }}>
                    معدل الوصول
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.accessRate}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: getPerformanceColor(analytics.accessRate).gradient,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Card>
              </Grow>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Grow in timeout={900}>
                <Card
                  className="neumorphism magnetic-hover"
                  sx={{
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    p: 3,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px) scale(1.02)',
                      background: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      background: getPerformanceColor(analytics.engagementRate).gradient,
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <TrendingIcon sx={{ fontSize: '2rem', color: 'white' }} />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="white" sx={{ mb: 1 }}>
                    {formatPercentage(analytics.engagementRate)}%
                  </Typography>
                  <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mb: 2 }}>
                    معدل التفاعل
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.engagementRate}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: getPerformanceColor(analytics.engagementRate).gradient,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Card>
              </Grow>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Grow in timeout={1000}>
                <Card
                  className="neumorphism magnetic-hover"
                  sx={{
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    p: 3,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px) scale(1.02)',
                      background: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      background: getPerformanceColor(analytics.completionRate).gradient,
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <DonutIcon sx={{ fontSize: '2rem', color: 'white' }} />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="white" sx={{ mb: 1 }}>
                    {formatPercentage(analytics.completionRate)}%
                  </Typography>
                  <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mb: 2 }}>
                    معدل الإكمال
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.completionRate}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: getPerformanceColor(analytics.completionRate).gradient,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Card>
              </Grow>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Grow in timeout={1100}>
                <Card
                  className="neumorphism magnetic-hover"
                  sx={{
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    p: 3,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px) scale(1.02)',
                      background: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <BarChartIcon sx={{ fontSize: '2rem', color: '#667eea' }} />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="white" sx={{ mb: 1 }}>
                    {analytics.totalItems}
                  </Typography>
                  <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mb: 2 }}>
                    إجمالي العناصر
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Chip
                      label={`${analytics.activeItems} نشط`}
                      size="small"
                      sx={{
                        background: 'rgba(67, 233, 123, 0.2)',
                        color: '#43e97b',
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={`${analytics.comingSoonItems} قريباً`}
                      size="small"
                      sx={{
                        background: 'rgba(250, 112, 154, 0.2)',
                        color: '#fa709a',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Card>
              </Grow>
            </Grid>
          </Grid>

          {/* Category Performance Analysis */}
          <Typography
            variant="h5"
            fontWeight={700}
            color="white"
            sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <TimelineIcon />
            تحليل أداء الفئات
          </Typography>

          <Grid container spacing={2}>
            {analytics.categoryStats.slice(0, 6).map((category, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={category.id}>
                <Fade in timeout={1000 + index * 100}>
                  <Card
                    className="neumorphism hover-lift"
                    sx={{
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      p: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          background: `linear-gradient(135deg, ${getPerformanceColor(category.accessRate).color}, ${alpha(getPerformanceColor(category.accessRate).color, 0.7)})`,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <InsightsIcon sx={{ color: 'white' }} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={600} color="white" sx={{ mb: 0.5 }}>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.7)">
                          {category.totalItems} عنصر • {formatPercentage(category.accessRate)}% وصول
                        </Typography>
                      </Box>
                      {category.accessRate >= 80 ? (
                        <TrendingIcon sx={{ color: '#43e97b' }} />
                      ) : (
                        <TrendingDownIcon sx={{ color: '#fa709a' }} />
                      )}
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="rgba(255,255,255,0.8)">
                          معدل الوصول
                        </Typography>
                        <Typography variant="body2" color="white" fontWeight={600}>
                          {formatPercentage(category.accessRate)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={category.accessRate}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: getPerformanceColor(category.accessRate).gradient,
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="rgba(255,255,255,0.8)">
                          معدل التفاعل
                        </Typography>
                        <Typography variant="body2" color="white" fontWeight={600}>
                          {formatPercentage(category.engagementRate)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={category.engagementRate}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: getPerformanceColor(category.engagementRate).gradient,
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Intelligence Summary */}
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 4,
              background: 'rgba(79, 172, 254, 0.1)',
              border: '1px solid rgba(79, 172, 254, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar
              className="glow-animation"
              sx={{
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                width: 40,
                height: 40,
              }}
            >
              <AnalyticsIcon sx={{ color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={600} color="#4facfe">
                تحليل ذكي للأداء
              </Typography>
              <Typography variant="body2" color="rgba(79, 172, 254, 0.8)">
                {analytics.topCategory ? `الفئة الأكثر نشاطاً: ${analytics.topCategory.name} • ` : ''}
                {analytics.mostEngagedCategory ? `الأكثر تفاعلاً: ${analytics.mostEngagedCategory.name}` : ''}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};