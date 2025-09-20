import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Avatar,
  Chip,
  Fade,
  Zoom,
  Divider,
  Paper,
} from '@mui/material';
import {
  AutoAwesome as AwesomeIcon,
  Explore as ExploreIcon,
  TrendingUp as TrendingIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { ItemCard } from '../components/ItemCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { AdminFloatingButtons } from '../components/AdminFloatingButtons';
import { ParticleBackground } from '../components/ParticleBackground';
import { AdvancedLoader } from '../components/AdvancedLoader';
import { Category, ItemWithAccess } from '../types/database.types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

export const HomePage: React.FC = () => {
  const theme = useTheme();
  const { user, isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ItemWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userAccessList, setUserAccessList] = useState<string[]>([]);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    console.log('=== HomePage fetchData Debug ===');
    console.log('Current user:', user);
    console.log('IsAdmin:', isAdmin);

    setLoading(true);
    setError(null);

    try {
      // Fetch categories
      console.log('Fetching categories...');
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      console.log('Categories result:', { data: categoriesData, error: categoriesError });
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch items with category info
      console.log('Fetching items...');
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*, category:categories(*)')
        .order('display_order', { ascending: true });

      console.log('Items result:', { data: itemsData, error: itemsError });
      if (itemsError) throw itemsError;

      // Fetch user access if logged in
      let accessList: string[] = [];
      let subsList: string[] = [];

      if (user) {
        console.log('Fetching user access for user ID:', user.id);
        // Fetch user's access
        const { data: accessData, error: accessError } = await supabase
          .from('user_access')
          .select('item_id')
          .eq('user_id', user.id);

        console.log('User access result:', { data: accessData, error: accessError });
        if (!accessError && accessData) {
          accessList = accessData.map((a) => a.item_id);
        }

        // Fetch user's subscriptions
        console.log('Fetching user subscriptions...');
        const { data: subsData, error: subsError } = await supabase
          .from('subscriptions')
          .select('item_id')
          .eq('user_id', user.id)
          .not('item_id', 'is', null);

        console.log('User subscriptions result:', { data: subsData, error: subsError });
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
      console.error('=== HomePage fetchData Error ===');
      console.error('Full error object:', err);
      console.error('Error message:', err?.message);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((item) => item.category_id === selectedCategory);

  const itemCounts = categories.reduce((acc, category) => {
    acc[category.id] = items.filter((item) => item.category_id === category.id).length;
    return acc;
  }, {} as Record<string, number>);

  const statsData = {
    totalItems: items.length,
    totalCategories: categories.length,
    accessibleItems: items.filter(item => item.has_access || isAdmin).length,
    subscribedItems: items.filter(item => item.is_subscribed).length,
  };

  if (loading) {
    return (
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ParticleBackground particleCount={30} />
        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 4,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Fade in timeout={800}>
              <Paper
                elevation={0}
                className="glass-effect magnetic-hover"
                sx={{
                  borderRadius: 6,
                  p: 6,
                  textAlign: 'center',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1), transparent)',
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Avatar
                    className="breathe-animation"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      width: 100,
                      height: 100,
                      mb: 3,
                      mx: 'auto',
                      boxShadow: `0 20px 60px ${alpha('#667eea', 0.3)}`,
                    }}
                  >
                    <AwesomeIcon sx={{ fontSize: '3rem', color: 'white' }} />
                  </Avatar>

                  <AdvancedLoader
                    text="جاري تحميل المحتوى الرائع..."
                    size="large"
                    variant="morphing"
                  />

                  <Typography
                    variant="h5"
                    className="typewriter"
                    sx={{
                      mt: 3,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    مكتبة الروابط الخاصة
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
            fontSize: '1.1rem',
            py: 2,
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        pb: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <ParticleBackground particleCount={40} />
      <Container maxWidth="lg" sx={{ pt: 4, position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 6,
              p: 6,
              mb: 6,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha('#fff', 0.2),
                    width: 80,
                    height: 80,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <ExploreIcon sx={{ fontSize: '2.5rem', color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight={800} gutterBottom>
                    مكتبة الروابط الخاصة
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    استكشف مجموعة مختارة من الموارد والأدوات المفيدة
                  </Typography>
                </Box>
              </Box>

              {/* Stats */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 3
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700}>
                    {statsData.totalItems}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    إجمالي العناصر
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700}>
                    {statsData.totalCategories}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    عدد الفئات
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700}>
                    {statsData.accessibleItems}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    متاح للوصول
                  </Typography>
                </Box>
                {user && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700}>
                      {statsData.subscribedItems}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      اشتراكاتك
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Category Filter */}
        <Zoom in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 4,
              mb: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              itemCounts={itemCounts}
            />
          </Paper>
        </Zoom>

        {/* Selected Category Info */}
        {selectedCategory !== 'all' && (
          <Fade in>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                p: 3,
                mb: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {(() => {
                const category = categories.find(c => c.id === selectedCategory);
                return category ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'linear-gradient(135deg, #667eea, #764ba2)',
                        width: 48,
                        height: 48,
                      }}
                    >
                      <CategoryIcon sx={{ color: 'white' }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {category.name}
                      </Typography>
                      {category.description && (
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      icon={<TrendingIcon />}
                      label={`${filteredItems.length} عنصر`}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                ) : null;
              })()}
            </Paper>
          </Fade>
        )}

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <Box
            className="stagger-fade-in perspective-container"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: 4,
              mb: 4,
            }}
          >
            {filteredItems.map((item, index) => (
              <Zoom in timeout={300 + index * 100} key={item.id}>
                <Box
                  className="card-3d gpu-accelerated"
                  sx={{
                    '&:hover': {
                      zIndex: 10,
                    }
                  }}
                >
                  <ItemCard
                    item={item}
                    onAccessUpdate={fetchData}
                  />
                </Box>
              </Zoom>
            ))}
          </Box>
        ) : (
          <Fade in>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                p: 8,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.grey[400], 0.2),
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <ExploreIcon sx={{ fontSize: '2rem', color: theme.palette.grey[400] }} />
              </Avatar>
              <Typography variant="h5" fontWeight={600} color="text.secondary" gutterBottom>
                لا توجد عناصر في هذه الفئة
              </Typography>
              <Typography variant="body1" color="text.secondary">
                جرب اختيار فئة أخرى أو تصفح جميع الفئات
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* Admin Floating Buttons */}
        {isAdmin && <AdminFloatingButtons onRefresh={fetchData} />}
      </Container>
    </Box>
  );
};