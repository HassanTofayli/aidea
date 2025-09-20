import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Typography,
  useTheme,
  alpha,
  Avatar,
  Tooltip,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Apps as AllIcon,
  Category as CategoryIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { Category } from '../types/database.types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  itemCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  itemCounts,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryIcon = (index: number) => {
    const icons = [
      '🚀', '💼', '🎯', '📱', '🔧', '🎨', '📊', '🌟',
      '💡', '🔥', '⚡', '🎵', '📚', '🎮', '🏆', '💎'
    ];
    return icons[index % icons.length];
  };

  const getCategoryGradient = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    ];
    return gradients[index % gradients.length];
  };

  const allCategoriesCount = Object.values(itemCounts).reduce((sum, count) => sum + count, 0);

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'linear-gradient(135deg, #667eea, #764ba2)',
              width: 48,
              height: 48,
              boxShadow: `0 8px 32px ${alpha('#667eea', 0.3)}`,
            }}
          >
            <FilterIcon sx={{ color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              تصفح الفئات
            </Typography>
            <Typography variant="body2" color="text.secondary">
              اختر فئة لعرض المحتوى المتعلق بها
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {isExpanded ? 'عرض أقل' : 'عرض الكل'}
        </Button>
      </Box>

      {/* Categories Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 2,
          maxHeight: isExpanded ? 'none' : '200px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        {/* All Categories Card */}
        <Zoom in timeout={300}>
          <Box
            onClick={() => onCategoryChange('all')}
            sx={{
              position: 'relative',
              p: 3,
              borderRadius: 4,
              background: selectedCategory === 'all'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: `2px solid ${selectedCategory === 'all' ? 'transparent' : alpha(theme.palette.divider, 0.1)}`,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: `0 20px 60px ${alpha('#667eea', 0.25)}`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                opacity: selectedCategory === 'all' ? 1 : 0.7,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: selectedCategory === 'all' ? alpha('#fff', 0.2) : '#667eea',
                  width: 56,
                  height: 56,
                  fontSize: '1.5rem',
                  boxShadow: `0 8px 24px ${alpha('#667eea', 0.3)}`,
                }}
              >
                <AllIcon sx={{ color: 'white', fontSize: '1.8rem' }} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: selectedCategory === 'all' ? 'white' : 'text.primary',
                    mb: 0.5,
                  }}
                >
                  جميع الفئات
                </Typography>
                <Chip
                  icon={<TrendingIcon />}
                  label={`${allCategoriesCount} عنصر`}
                  size="small"
                  sx={{
                    bgcolor: selectedCategory === 'all' ? alpha('#fff', 0.2) : alpha('#667eea', 0.1),
                    color: selectedCategory === 'all' ? 'white' : '#667eea',
                    fontWeight: 600,
                    '& .MuiChip-icon': {
                      color: selectedCategory === 'all' ? 'white' : '#667eea',
                    },
                  }}
                />
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: selectedCategory === 'all' ? alpha('#fff', 0.9) : 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              عرض جميع العناصر من كافة الفئات المتاحة
            </Typography>
          </Box>
        </Zoom>

        {/* Individual Category Cards */}
        {categories.map((category, index) => (
          <Zoom in timeout={300 + index * 100} key={category.id}>
            <Box
              onClick={() => onCategoryChange(category.id)}
              sx={{
                position: 'relative',
                p: 3,
                borderRadius: 4,
                background: selectedCategory === category.id
                  ? getCategoryGradient(index)
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: `2px solid ${selectedCategory === category.id ? 'transparent' : alpha(theme.palette.divider, 0.1)}`,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.25)}`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: getCategoryGradient(index),
                  opacity: selectedCategory === category.id ? 1 : 0.7,
                },
              }}
            >
              {/* Floating decoration */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
                  opacity: selectedCategory === category.id ? 0.8 : 0.4,
                  transition: 'all 0.3s ease',
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: selectedCategory === category.id ? alpha('#fff', 0.2) : getCategoryGradient(index),
                    width: 56,
                    height: 56,
                    fontSize: '1.5rem',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  {selectedCategory === category.id ? (
                    <CategoryIcon sx={{ color: 'white', fontSize: '1.8rem' }} />
                  ) : (
                    getCategoryIcon(index)
                  )}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      color: selectedCategory === category.id ? 'white' : 'text.primary',
                      mb: 0.5,
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Chip
                    label={`${itemCounts[category.id] || 0} عنصر`}
                    size="small"
                    sx={{
                      bgcolor: selectedCategory === category.id ? alpha('#fff', 0.2) : alpha(theme.palette.primary.main, 0.1),
                      color: selectedCategory === category.id ? 'white' : theme.palette.primary.main,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>

              {category.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: selectedCategory === category.id ? alpha('#fff', 0.9) : 'text.secondary',
                    lineHeight: 1.6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {category.description}
                </Typography>
              )}
            </Box>
          </Zoom>
        ))}
      </Box>

      {/* Expand Button for mobile */}
      {!isExpanded && categories.length > 6 && (
        <Fade in>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => setIsExpanded(true)}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2, #667eea)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              عرض المزيد من الفئات ({categories.length - 6})
            </Button>
          </Box>
        </Fade>
      )}
    </Box>
  );
};