import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { Item, Category, ItemStatus } from '../types/database.types';
import { supabase } from '../services/supabase';

export const ItemManager: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category_id: '',
    status: 'active' as ItemStatus,
    display_order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch items with category info
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*, category:categories(name)')
        .order('display_order', { ascending: true });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        url: item.url,
        category_id: item.category_id,
        status: item.status,
        display_order: item.display_order,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        url: '',
        category_id: categories[0]?.id || '',
        status: 'active',
        display_order: items.length,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      url: '',
      category_id: '',
      status: 'active',
      display_order: 0,
    });
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('items')
          .update(formData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Create new item
        const { error } = await supabase.from('items').insert(formData);

        if (error) throw error;
      }

      await fetchData();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving item:', err);
      setError('فشل في حفظ العنصر');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    setError(null);
    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('فشل في حذف العنصر');
    }
  };

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'coming_soon':
        return 'info';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ItemStatus) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'coming_soon':
        return 'قريباً';
      case 'archived':
        return 'مؤرشف';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">إدارة العناصر</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          إضافة عنصر جديد
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>العنوان</TableCell>
              <TableCell>الفئة</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>الترتيب</TableCell>
              <TableCell>تاريخ الإنشاء</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{(item as any).category?.name || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(item.status)}
                    color={getStatusColor(item.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{item.display_order}</TableCell>
                <TableCell>
                  {new Date(item.created_at).toLocaleDateString('ar-SA')}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Item Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'تعديل العنصر' : 'إضافة عنصر جديد'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="العنوان"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="الوصف"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="الرابط (URL)"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>الفئة</InputLabel>
            <Select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              label="الفئة"
              required
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>الحالة</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as ItemStatus })
              }
              label="الحالة"
            >
              <MenuItem value="active">نشط</MenuItem>
              <MenuItem value="coming_soon">قريباً</MenuItem>
              <MenuItem value="archived">مؤرشف</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="الترتيب"
            type="number"
            value={formData.display_order}
            onChange={(e) =>
              setFormData({ ...formData, display_order: parseInt(e.target.value) })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};