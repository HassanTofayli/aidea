import React, { useState } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Article as ArticleIcon,
  People as PeopleIcon,
  RequestQuote as RequestIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { CategoryManager } from '../admin/CategoryManager';
import { ItemManager } from '../admin/ItemManager';
import { UserAccessManager } from '../admin/UserAccessManager';
import { AccessRequestsManager } from '../admin/AccessRequestsManager';

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

export const AdminDashboard: React.FC = () => {
  const { isAdmin, loading } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container>
        <Typography>جاري التحميل...</Typography>
      </Container>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        لوحة التحكم
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<CategoryIcon />} label="الفئات" />
          <Tab icon={<ArticleIcon />} label="العناصر" />
          <Tab icon={<PeopleIcon />} label="إدارة الوصول" />
          <Tab icon={<RequestIcon />} label="طلبات الوصول" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <CategoryManager />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <ItemManager />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <UserAccessManager />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <AccessRequestsManager />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};