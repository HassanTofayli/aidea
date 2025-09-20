import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Grid,
  Paper,
  LinearProgress,
  Divider,
  Button,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  Slide,
  Grow,
  Zoom,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Analytics as AnalyticsIcon,
  AutoAwesome as AIIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Insights as InsightsIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  Category as CategoryIcon,
  SmartToy as SmartToyIcon,
  AutoGraph as AutoGraphIcon,
  DataSaverOn as DataSaverOnIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { Category, ItemWithAccess } from '../types/database.types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { ParticleBackground } from '../components/ParticleBackground';
import { AdvancedLoader } from '../components/AdvancedLoader';
import { SmartRecommendations } from '../components/SmartRecommendations';
import { AdvancedAnalytics } from '../components/AdvancedAnalytics';

export const SecondDesignPage: React.FC = () => {
  const theme = useTheme();
  const { user, isAdmin } = useAuth();

  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ItemWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'alphabetical' | 'recent' | 'trending'>('relevance');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [userAccessList, setUserAccessList] = useState<string[]>([]);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch items with category info
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*, category:categories(*)')
        .order('display_order', { ascending: true });

      if (itemsError) throw itemsError;

      // Fetch user access if logged in
      let accessList: string[] = [];
      let subsList: string[] = [];

      if (user) {
        // Fetch user's access
        const { data: accessData, error: accessError } = await supabase
          .from('user_access')
          .select('item_id')
          .eq('user_id', user.id);

        if (!accessError && accessData) {
          accessList = accessData.map((a) => a.item_id);
        }

        // Fetch user's subscriptions
        const { data: subsData, error: subsError } = await supabase
          .from('subscriptions')
          .select('item_id')
          .eq('user_id', user.id)
          .not('item_id', 'is', null);

        if (!subsError && subsData) {
          subsList = subsData.map((s) => s.item_id);
        }
      }

      setUserAccessList(accessList);
      setSubscriptions(subsList);

      // Map items with access info
      const itemsWithAccess: ItemWithAccess[] = (itemsData || []).map((item) => ({
        ...item,
        has_access: isAdmin || accessList.includes(item.id),
        is_subscribed: subsList.includes(item.id),
      }));

      setItems(itemsWithAccess);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      console.error('Error message:', err?.message);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Smart filtering and searching
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }

    // Smart sorting
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'trending':
        // Sort by subscriptions + access (popularity indicator)
        filtered.sort((a, b) => {
          const aScore = (a.is_subscribed ? 2 : 0) + (a.has_access ? 1 : 0);
          const bScore = (b.is_subscribed ? 2 : 0) + (b.has_access ? 1 : 0);
          return bScore - aScore;
        });
        break;
      default: // relevance
        // AI-like relevance scoring based on user behavior
        filtered.sort((a, b) => {
          const aRelevance = (a.has_access ? 3 : 0) + (a.is_subscribed ? 2 : 0) + (a.status === 'active' ? 1 : 0);
          const bRelevance = (b.has_access ? 3 : 0) + (b.is_subscribed ? 2 : 0) + (b.status === 'active' ? 1 : 0);
          return bRelevance - aRelevance;
        });
    }

    return filtered;
  }, [items, searchQuery, selectedCategory, sortBy]);

  // AI-powered insights
  const aiInsights = useMemo(() => {
    const totalItems = items.length;
    const accessibleItems = items.filter(item => item.has_access || isAdmin).length;
    const subscribedItems = items.filter(item => item.is_subscribed).length;
    const comingSoonItems = items.filter(item => item.status === 'coming_soon').length;
    const engagementRate = totalItems > 0 ? Math.round((subscribedItems / totalItems) * 100) : 0;
    const accessRate = totalItems > 0 ? Math.round((accessibleItems / totalItems) * 100) : 0;

    return {
      totalItems,
      accessibleItems,
      subscribedItems,
      comingSoonItems,
      engagementRate,
      accessRate,
      topCategories: categories.slice(0, 3),
      recommendations: items.filter(item => !item.has_access && item.status === 'active').slice(0, 3),
    };
  }, [items, categories, isAdmin]);

  if (loading) {
    return (
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ParticleBackground particleCount={60} />
        <Container maxWidth="lg" sx={{ pt: 8 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Paper
              elevation={0}
              className="glass-effect"
              sx={{
                borderRadius: 8,
                p: 8,
                textAlign: 'center',
                backdropFilter: 'blur(40px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Avatar
                className="pulse-animation"
                sx={{
                  background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.8))',
                  width: 120,
                  height: 120,
                  mb: 4,
                  mx: 'auto',
                  boxShadow: '0 30px 100px rgba(255, 255, 255, 0.3)',
                }}
              >
                <SmartToyIcon sx={{ fontSize: '4rem', color: '#667eea' }} />
              </Avatar>

              <AdvancedLoader
                text="تحليل البيانات بالذكاء الاصطناعي..."
                size="large"
                variant="gradient"
              />

              <Typography
                variant="h4"
                className="typewriter"
                sx={{
                  mt: 4,
                  fontWeight: 800,
                  color: 'white',
                  textShadow: '0 0 20px rgba(255,255,255,0.5)',
                }}
              >
                التصميم الذكي الثاني
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 4,
            background: 'linear-gradient(135deg, #f56565, #e53e3e)',
            color: 'white',
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <ParticleBackground
        particleCount={80}
        colors={['#667eea', '#764ba2', '#4facfe', '#00f2fe', '#43e97b']}
      />

      <Container maxWidth="xl" sx={{ pt: 4, pb: 8, position: 'relative', zIndex: 1 }}>
        {/* AI-Powered Header */}
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            className="glass-effect neon-glow"
            sx={{
              borderRadius: 6,
              p: 4,
              mb: 4,
              background: 'rgba(102, 126, 234, 0.1)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar
                className="breathe-animation"
                sx={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  width: 80,
                  height: 80,
                  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
                }}
              >
                <PsychologyIcon sx={{ fontSize: '2.5rem', color: 'white' }} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h3"
                  fontWeight={900}
                  sx={{
                    background: 'linear-gradient(135deg, #fff, #e2e8f0)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  مكتبة الروابط الذكية
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 400,
                  }}
                >
                  تجربة ذكية مدعومة بالذكاء الاصطناعي لاستكشاف المحتوى
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<AIIcon />}
                  label="AI مدعوم"
                  sx={{
                    background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                    color: '#0f0f23',
                    fontWeight: 700,
                    '& .MuiChip-icon': { color: '#0f0f23' },
                  }}
                />
                <Chip
                  icon={<DataSaverOnIcon />}
                  label={`${items.length} عنصر`}
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                  }}
                />
              </Box>
            </Box>

            {/* AI Insights Dashboard - Only show if enabled */}
            {showAIInsights && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper
                    className="neumorphism"
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <AnalyticsIcon sx={{ color: 'white' }} />
                    </Avatar>
                    <Typography variant="h4" fontWeight={800} color="white">
                      {aiInsights.accessRate}%
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      معدل الوصول
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper
                    className="neumorphism"
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'linear-gradient(135deg, #fa709a, #fee140)',
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <TrendingIcon sx={{ color: 'white' }} />
                    </Avatar>
                    <Typography variant="h4" fontWeight={800} color="white">
                      {aiInsights.engagementRate}%
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      معدل التفاعل
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper
                    className="neumorphism"
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <SpeedIcon sx={{ color: '#667eea' }} />
                    </Avatar>
                    <Typography variant="h4" fontWeight={800} color="white">
                      {aiInsights.subscribedItems}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      اشتراكاتك
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper
                    className="neumorphism"
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <ScheduleIcon sx={{ color: '#667eea' }} />
                    </Avatar>
                    <Typography variant="h4" fontWeight={800} color="white">
                      {aiInsights.comingSoonItems}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      قريباً
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Fade>

        {/* Smart Controls Panel */}
        <Slide direction="up" in timeout={1000}>
          <Paper
            elevation={0}
            className="glass-effect"
            sx={{
              borderRadius: 5,
              p: 4,
              mb: 4,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              {/* Smart Search */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="البحث الذكي..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Category Filter */}
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    displayEmpty
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      },
                    }}
                  >
                    <MenuItem value="all">جميع الفئات</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort Options */}
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      },
                    }}
                  >
                    <MenuItem value="relevance">الأكثر صلة</MenuItem>
                    <MenuItem value="alphabetical">أبجدياً</MenuItem>
                    <MenuItem value="recent">الأحدث</MenuItem>
                    <MenuItem value="trending">الرائج</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* View Controls */}
              <Grid size={{ xs: 12, md: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <ButtonGroup>
                    <IconButton
                      onClick={() => setViewMode('grid')}
                      sx={{
                        bgcolor: viewMode === 'grid' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          bgcolor: 'rgba(102, 126, 234, 0.2)',
                        },
                      }}
                    >
                      <ViewModuleIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setViewMode('list')}
                      sx={{
                        bgcolor: viewMode === 'list' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          bgcolor: 'rgba(102, 126, 234, 0.2)',
                        },
                      }}
                    >
                      <ViewListIcon />
                    </IconButton>
                  </ButtonGroup>
                </Box>
              </Grid>
            </Grid>

            {/* AI Insights Toggle */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showAIInsights}
                    onChange={(e) => setShowAIInsights(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#43e97b',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#43e97b',
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LightbulbIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      عرض الإحصائيات الذكية
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Paper>
        </Slide>

        {/* Smart Recommendations */}
        {user && (
          <SmartRecommendations
            items={items}
            userAccessList={userAccessList}
            subscriptions={subscriptions}
          />
        )}

        {/* Advanced Analytics Dashboard */}
        <AdvancedAnalytics
          items={items}
          categories={categories}
          userAccessList={userAccessList}
          subscriptions={subscriptions}
        />

        {/* Smart Content Display */}
        {filteredAndSortedItems.length > 0 ? (
          <Grow in timeout={1200}>
            <Box>
              {/* Results Summary */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  p: 3,
                  mb: 3,
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'linear-gradient(135deg, #667eea, #764ba2)',
                      width: 40,
                      height: 40,
                    }}
                  >
                    <InsightsIcon sx={{ color: 'white' }} />
                  </Avatar>
                  <Typography variant="h6" color="white" fontWeight={600}>
                    تم العثور على {filteredAndSortedItems.length} عنصر
                    {searchQuery && ` لـ "${searchQuery}"`}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Chip
                    icon={<AutoGraphIcon />}
                    label={`ترتيب: ${
                      sortBy === 'relevance' ? 'الأكثر صلة' :
                      sortBy === 'alphabetical' ? 'أبجدياً' :
                      sortBy === 'recent' ? 'الأحدث' : 'الرائج'
                    }`}
                    sx={{
                      background: 'rgba(67, 233, 123, 0.2)',
                      color: '#43e97b',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                </Box>
              </Paper>

              {/* Items Grid/List */}
              <Grid container spacing={3}>
                {filteredAndSortedItems.map((item, index) => (
                  <Grid
                    size={{
                      xs: 12,
                      md: viewMode === 'grid' ? 6 : 12,
                      lg: viewMode === 'grid' ? 4 : 12
                    }}
                    key={item.id}
                  >
                    <Zoom in timeout={300 + index * 50}>
                      <Card
                        className="magnetic-hover gpu-accelerated"
                        sx={{
                          borderRadius: 5,
                          background: 'rgba(255,255,255,0.05)',
                          backdropFilter: 'blur(30px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-10px) scale(1.02)',
                            background: 'rgba(255,255,255,0.1)',
                            boxShadow: '0 30px 100px rgba(102, 126, 234, 0.3)',
                            border: '1px solid rgba(102, 126, 234, 0.5)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: item.has_access || isAdmin
                              ? 'linear-gradient(90deg, #43e97b, #38f9d7)'
                              : item.status === 'coming_soon'
                              ? 'linear-gradient(90deg, #fa709a, #fee140)'
                              : 'linear-gradient(90deg, #667eea, #764ba2)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
                            <Avatar
                              className="pulse-animation"
                              sx={{
                                width: 60,
                                height: 60,
                                background: item.has_access || isAdmin
                                  ? 'linear-gradient(135deg, #43e97b, #38f9d7)'
                                  : item.status === 'coming_soon'
                                  ? 'linear-gradient(135deg, #fa709a, #fee140)'
                                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                                boxShadow: '0 15px 45px rgba(102, 126, 234, 0.3)',
                              }}
                            >
                              {item.has_access || isAdmin ? (
                                <CheckCircleIcon sx={{ color: 'white', fontSize: '2rem' }} />
                              ) : item.status === 'coming_soon' ? (
                                <ScheduleIcon sx={{ color: 'white', fontSize: '2rem' }} />
                              ) : (
                                <LockIcon sx={{ color: 'white', fontSize: '2rem' }} />
                              )}
                            </Avatar>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                color="white"
                                sx={{ mb: 1, lineHeight: 1.3 }}
                              >
                                {item.title}
                              </Typography>
                              <Chip
                                icon={<CategoryIcon />}
                                label={item.category?.name || 'غير مصنف'}
                                size="small"
                                sx={{
                                  background: 'rgba(102, 126, 234, 0.2)',
                                  color: '#667eea',
                                  fontWeight: 600,
                                  backdropFilter: 'blur(10px)',
                                  mb: 2,
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="rgba(255,255,255,0.8)"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: 1.6,
                                }}
                              >
                                {item.description}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                            {item.is_subscribed && (
                              <Chip
                                icon={<StarIcon />}
                                label="مشترك"
                                size="small"
                                sx={{
                                  background: 'rgba(250, 112, 154, 0.2)',
                                  color: '#fa709a',
                                  fontWeight: 600,
                                }}
                              />
                            )}
                            {item.has_access && (
                              <Chip
                                icon={<VisibilityIcon />}
                                label="متاح"
                                size="small"
                                sx={{
                                  background: 'rgba(67, 233, 123, 0.2)',
                                  color: '#43e97b',
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                              variant="contained"
                              className="elastic-hover"
                              sx={{
                                background: item.has_access || isAdmin
                                  ? 'linear-gradient(135deg, #43e97b, #38f9d7)'
                                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderRadius: 3,
                                px: 3,
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                },
                              }}
                            >
                              {item.has_access || isAdmin ? 'فتح الرابط' : 'طلب الوصول'}
                            </Button>

                            <IconButton
                              className="pulse-animation"
                              sx={{
                                bgcolor: 'rgba(255,255,255,0.1)',
                                color: item.is_subscribed ? '#fa709a' : 'rgba(255,255,255,0.7)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                  bgcolor: 'rgba(255,255,255,0.2)',
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              <FavoriteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>

                        {/* Floating decoration */}
                        <Box
                          className="card-floating-particles"
                          sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1), transparent)',
                            opacity: 0.6,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grow>
        ) : (
          <Fade in>
            <Paper
              elevation={0}
              className="glass-effect"
              sx={{
                borderRadius: 6,
                p: 8,
                textAlign: 'center',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 4,
                }}
              >
                <SearchIcon sx={{ fontSize: '3rem', color: 'rgba(255,255,255,0.7)' }} />
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="white" gutterBottom>
                لم يتم العثور على نتائج
              </Typography>
              <Typography variant="h6" color="rgba(255,255,255,0.7)" sx={{ mb: 4 }}>
                جرب تعديل معايير البحث أو الفلترة
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                sx={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                إعادة تعيين الفلاتر
              </Button>
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  );
};