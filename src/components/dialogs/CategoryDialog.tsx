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
} from '@mui/material';
import {
  Close as CloseIcon,
  Category as CategoryIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { supabase } from '../../services/supabase';
import { adminOperations } from '../../services/admin';
import { Category } from '../../types/database.types';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
  mode?: 'create' | 'edit';
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onClose,
  onSuccess,
  category = null,
  mode = 'create',
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (open) {
      if (category && mode === 'edit') {
        setFormData({
          name: category.name || '',
          description: category.description || '',
          display_order: category.display_order || 0,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          display_order: 0,
        });
      }
      setErrors({});
    }
  }, [open, category, mode]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم التصنيف مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === 'edit' && category) {
        console.log('Updating category with ID:', category.id);
        const { error } = await adminOperations.updateCategory(category.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          display_order: formData.display_order,
          updated_at: new Date().toISOString(),
        });

        console.log('Admin category update result:', { error });
        if (error) throw error;
      } else {
        console.log('Creating new category using admin operations...');
        const { error } = await adminOperations.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          display_order: formData.display_order,
        });

        console.log('Admin category create result:', { error });
        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors({ general: 'حدث خطأ أثناء حفظ التصنيف' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    console.log('=== Delete Category Debug ===');
    console.log('Deleting category ID:', category.id);

    setLoading(true);
    try {
      const { error } = await adminOperations.deleteCategory(category.id);

      console.log('Admin category delete result:', { error });
      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('=== Error deleting category ===');
      console.error('Full error object:', error);
      setErrors({ general: 'حدث خطأ أثناء حذف التصنيف' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="sm"
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
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          position: 'relative',
          padding: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CategoryIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {mode === 'edit' ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
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

          <TextField
            label="اسم التصنيف"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover': {
                  '& > fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              },
            }}
          />

          <TextField
            label="وصف التصنيف"
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
                    borderColor: theme.palette.primary.main,
                  },
                },
              },
            }}
          />

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
                    borderColor: theme.palette.primary.main,
                  },
                },
              },
            }}
          />
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
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              transform: 'translateY(-1px)',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
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