import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from '@mui/material';
import {
  StarBorder as UnsubscribeIcon,
  OpenInNew as OpenInNewIcon,
  NewReleases as NewIcon,
  Category as CategoryIcon,
  Article as ItemIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Subscription, Item, Category } from '../types/database.types';
import { Navigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const SubscriptionsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [itemSubscriptions, setItemSubscriptions] = useState<(Subscription & { item?: Item })[]>([]);
  const [categorySubscriptions, setCategorySubscriptions] = useState<(Subscription & { category?: Category })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch item subscriptions
      const { data: itemSubs, error: itemError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          item:items(id, title, description, url, status, updated_at)
        `)
        .eq('user_id', user.id)
        .not('item_id', 'is', null);

      if (itemError) throw itemError;

      // Fetch category subscriptions
      const { data: categorySubs, error: categoryError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          category:categories(id, name, description, updated_at)
        `)
        .eq('user_id', user.id)
        .not('category_id', 'is', null);

      if (categoryError) throw categoryError;

      setItemSubscriptions(itemSubs || []);
      setCategorySubscriptions(categorySubs || []);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('فشل في تحميل الاشتراكات');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) throw error;

      await fetchSubscriptions();
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError('فشل في إلغاء الاشتراك');
    }
  };

  const handleMarkAsSeen = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ last_seen_update: new Date().toISOString() })
        .eq('id', subscriptionId);

      if (error) throw error;

      await fetchSubscriptions();
    } catch (err) {
      console.error('Error marking as seen:', err);
    }
  };

  const isNewUpdate = (subscription: Subscription & { item?: Item; category?: Category }) => {
    const lastSeen = new Date(subscription.last_seen_update);
    const updated = subscription.item?.updated_at || subscription.category?.updated_at;

    if (!updated) return false;

    return new Date(updated) > lastSeen;
  };

  if (authLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        اشتراكاتي
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<ItemIcon />}
            label={`العناصر (${itemSubscriptions.length})`}
          />
          <Tab
            icon={<CategoryIcon />}
            label={`الفئات (${categorySubscriptions.length})`}
          />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        {itemSubscriptions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              لا توجد اشتراكات في العناصر
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: 3
            }}
          >
            {itemSubscriptions.map((subscription) => (
              <Box key={subscription.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {isNewUpdate(subscription) && (
                        <Chip
                          icon={<NewIcon />}
                          label="تحديث جديد"
                          color="error"
                          size="small"
                        />
                      )}
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {subscription.item?.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {subscription.item?.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      مشترك منذ: {new Date(subscription.subscribed_at).toLocaleDateString('ar-SA')}
                    </Typography>
                    {subscription.item?.updated_at && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        آخر تحديث: {new Date(subscription.item.updated_at).toLocaleDateString('ar-SA')}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    {subscription.item?.status === 'active' && (
                      <Button
                        size="small"
                        startIcon={<OpenInNewIcon />}
                        onClick={() => window.open(subscription.item?.url, '_blank')}
                      >
                        فتح
                      </Button>
                    )}
                    {isNewUpdate(subscription) && (
                      <Button
                        size="small"
                        onClick={() => handleMarkAsSeen(subscription.id)}
                      >
                        وضع علامة كمقروء
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      startIcon={<UnsubscribeIcon />}
                      onClick={() => handleUnsubscribe(subscription.id)}
                    >
                      إلغاء الاشتراك
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {categorySubscriptions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              لا توجد اشتراكات في الفئات
            </Typography>
          </Box>
        ) : (
          <List>
            {categorySubscriptions.map((subscription) => (
              <ListItem key={subscription.id} component={Paper} sx={{ mb: 2 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isNewUpdate(subscription) && (
                        <Chip
                          icon={<NewIcon />}
                          label="تحديث جديد"
                          color="error"
                          size="small"
                        />
                      )}
                      {subscription.category?.name}
                    </Box>
                  }
                  secondary={
                    <>
                      {subscription.category?.description}
                      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                        مشترك منذ: {new Date(subscription.subscribed_at).toLocaleDateString('ar-SA')}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleUnsubscribe(subscription.id)}
                  >
                    <UnsubscribeIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </TabPanel>
    </Container>
  );
};