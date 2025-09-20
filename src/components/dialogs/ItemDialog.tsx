import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Slide,
  useTheme,
  alpha,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Close as CloseIcon,
  Link as ItemIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { supabase } from '../../services/supabase';
import { adminOperations } from '../../services/admin';
import { Item, Category } from '../../types/database.types';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: Item | null;
  mode?: 'create' | 'edit';
}

export const ItemDialog: React.FC<ItemDialogProps> = ({
  open,
  onClose,
  onSuccess,
  item = null,
  mode = 'create',
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category_id: '',
    status: 'active' as 'active' | 'coming_soon' | 'archived',
    display_order: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (open) {
      fetchCategories();
      if (item && mode === 'edit') {
        setFormData({
          title: item.title || '',
          description: item.description || '',
          url: item.url || '',
          category_id: item.category_id || '',
          status: item.status || 'active',
          display_order: item.display_order || 0,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          url: '',
          category_id: '',
          status: 'active',
          display_order: 0,
        });
      }
      setErrors({});
    }
  }, [open, item, mode]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان العنصر مطلوب';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'رابط العنصر مطلوب';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'يرجى إدخال رابط صحيح';
      }
    }

    if (!formData.category_id) {
      newErrors.category_id = 'يرجى اختيار تصنيف';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    console.log('=== ItemDialog Submit Debug ===');
    console.log('Mode:', mode);
    console.log('Form data:', formData);
    console.log('Item:', item);

    setLoading(true);
    try {
      if (mode === 'edit' && item) {
        console.log('Updating item with ID:', item.id);
        const { data, error } = await adminOperations.updateItem(item.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          url: formData.url.trim(),
          category_id: formData.category_id,
          status: formData.status,
          display_order: formData.display_order,
          updated_at: new Date().toISOString(),
        });

        console.log('Admin update result:', { data, error });
        if (error) throw error;
      } else {
        console.log('Inserting new item using admin operations...');
        const { data, error } = await adminOperations.createItem({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          url: formData.url.trim(),
          category_id: formData.category_id,
          status: formData.status,
          display_order: formData.display_order,
        });

        console.log('Admin insert result:', { data, error });
        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      console.error('=== Error saving item ===');
      console.error('Full error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error details:', error?.details);
      setErrors({ general: 'حدث خطأ أثناء حفظ العنصر' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    console.log('=== Delete Item Debug ===');
    console.log('Deleting item ID:', item.id);

    setLoading(true);
    try {
      const { error } = await adminOperations.deleteItem(item.id);

      console.log('Admin delete result:', { error });
      if (error) throw error;
      onSuccess();
    } catch (error: any) {
      console.error('=== Error deleting item ===');
      console.error('Full error object:', error);
      setErrors({ general: 'حدث خطأ أثناء حذف العنصر' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.95)})`,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.15)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, #4ECDC4, #44A08D)`,
          color: 'white',
          position: 'relative',
          padding: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ItemIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {mode === 'edit' ? 'تعديل العنصر' : 'إضافة عنصر جديد'}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.1),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ padding: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {errors.general && (
            <Chip
              label={errors.general}
              color="error"
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            />
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
            <TextField
              label="عنوان العنصر"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover': {
                    '& > fieldset': {
                      borderColor: '#4ECDC4',
                    },
                  },
                },
              }}
            />

            <FormControl
              fullWidth
              error={!!errors.category_id}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <InputLabel>التصنيف</InputLabel>
              <Select
                value={formData.category_id}
                label="التصنيف"
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.5 }}>
                  {errors.category_id}
                </Typography>
              )}
            </FormControl>
          </Box>

          <TextField
            label="وصف العنصر"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover': {
                  '& > fieldset': {
                    borderColor: '#4ECDC4',
                  },
                },
              },
            }}
          />

          <TextField
            label="رابط العنصر"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            error={!!errors.url}
            helperText={errors.url}
            fullWidth
            variant="outlined"
            placeholder="https://example.com"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover': {
                  '& > fieldset': {
                    borderColor: '#4ECDC4',
                  },
                },
              },
            }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <FormControl
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <InputLabel>حالة العنصر</InputLabel>
              <Select
                value={formData.status}
                label="حالة العنصر"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="coming_soon">قريباً</MenuItem>
                <MenuItem value="archived">مؤرشف</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="ترتيب العرض"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover': {
                    '& > fieldset': {
                      borderColor: '#4ECDC4',
                    },
                  },
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ padding: 3, gap: 1 }}>
        {mode === 'edit' && (
          <Button
            onClick={handleDelete}
            disabled={loading}
            startIcon={<DeleteIcon />}
            sx={{
              borderRadius: 2,
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            حذف
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 2,
            minWidth: 100,
          }}
        >
          إلغاء
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{
            borderRadius: 2,
            minWidth: 120,
            background: `linear-gradient(135deg, #4ECDC4, #44A08D)`,
            '&:hover': {
              background: `linear-gradient(135deg, #3CBDBE, #3A8B7A)`,
              transform: 'translateY(-1px)',
              boxShadow: `0 8px 24px ${alpha('#4ECDC4', 0.3)}`,
            },
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};